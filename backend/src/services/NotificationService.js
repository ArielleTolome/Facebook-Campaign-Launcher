const nodemailer = require('nodemailer');
const { IncomingWebhook } = require('@slack/webhook');
const axios = require('axios');
const NotificationPreference = require('../models/NotificationPreference');

/**
 * NotificationService - Multi-channel notification hub
 * Supports email, webhooks, and Slack notifications
 */
class NotificationService {
  constructor() {
    this.emailTransporter = null;
    this.initializeEmailTransporter();
  }

  /**
   * Initialize email transporter based on environment configuration
   * Supports SendGrid, AWS SES, and generic SMTP
   */
  initializeEmailTransporter() {
    const emailService = process.env.EMAIL_SERVICE || 'smtp';

    try {
      if (emailService === 'sendgrid') {
        // SendGrid configuration
        this.emailTransporter = nodemailer.createTransport({
          host: 'smtp.sendgrid.net',
          port: 587,
          secure: false,
          auth: {
            user: 'apikey',
            pass: process.env.SENDGRID_API_KEY
          }
        });
      } else if (emailService === 'ses') {
        // AWS SES configuration
        this.emailTransporter = nodemailer.createTransport({
          host: process.env.AWS_SES_HOST || 'email-smtp.us-east-1.amazonaws.com',
          port: 587,
          secure: false,
          auth: {
            user: process.env.AWS_SES_ACCESS_KEY,
            pass: process.env.AWS_SES_SECRET_KEY
          }
        });
      } else {
        // Generic SMTP configuration
        this.emailTransporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'localhost',
          port: process.env.SMTP_PORT || 587,
          secure: process.env.SMTP_SECURE === 'true',
          auth: process.env.SMTP_USER ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD
          } : undefined
        });
      }
    } catch (error) {
      console.error('Failed to initialize email transporter:', error.message);
    }
  }

  /**
   * Send notification to all configured channels for a user
   * @param {string} userId - User ID to send notification to
   * @param {Object} notification - Notification content
   * @param {string} notification.type - Type of notification (budget_alert, campaign_complete, etc.)
   * @param {string} notification.subject - Notification subject/title
   * @param {string} notification.message - Notification message body
   * @param {Object} notification.data - Additional data payload
   * @returns {Promise<Object>} Results of sending to each channel
   */
  async sendNotification(userId, notification) {
    try {
      const preferences = await NotificationPreference.findOne({ where: { userId } });

      if (!preferences) {
        console.warn(`No notification preferences found for user ${userId}`);
        return {
          success: false,
          error: 'No notification preferences found'
        };
      }

      // Check if user wants this type of notification
      if (!this.shouldSendNotification(preferences, notification.type)) {
        return {
          success: true,
          skipped: true,
          reason: 'Notification type disabled in preferences'
        };
      }

      // Check quiet hours
      if (this.isQuietHours(preferences)) {
        return {
          success: true,
          skipped: true,
          reason: 'Within quiet hours'
        };
      }

      const results = {
        email: null,
        webhook: null,
        slack: null
      };

      // Send to all enabled channels in parallel
      const promises = [];

      if (preferences.emailEnabled && preferences.emailAddress) {
        promises.push(
          this.sendEmail(preferences.emailAddress, notification)
            .then(result => { results.email = result; })
            .catch(error => { results.email = { success: false, error: error.message }; })
        );
      }

      if (preferences.webhookEnabled && preferences.webhookUrl) {
        promises.push(
          this.sendWebhook(preferences.webhookUrl, preferences.webhookHeaders, notification)
            .then(result => { results.webhook = result; })
            .catch(error => { results.webhook = { success: false, error: error.message }; })
        );
      }

      if (preferences.slackEnabled && preferences.slackWebhookUrl) {
        promises.push(
          this.sendSlack(preferences.slackWebhookUrl, preferences.slackChannel, notification)
            .then(result => { results.slack = result; })
            .catch(error => { results.slack = { success: false, error: error.message }; })
        );
      }

      await Promise.all(promises);

      return {
        success: true,
        results
      };
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  /**
   * Send email notification
   * @param {string} to - Recipient email address
   * @param {Object} notification - Notification content
   * @returns {Promise<Object>}
   */
  async sendEmail(to, notification) {
    if (!this.emailTransporter) {
      throw new Error('Email transporter not initialized');
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@campaign-launcher.com',
      to,
      subject: notification.subject,
      text: notification.message,
      html: this.formatEmailHTML(notification)
    };

    try {
      const info = await this.emailTransporter.sendMail(mailOptions);
      return {
        success: true,
        messageId: info.messageId
      };
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  /**
   * Send webhook notification
   * @param {string} url - Webhook URL
   * @param {Object} headers - Custom headers
   * @param {Object} notification - Notification content
   * @returns {Promise<Object>}
   */
  async sendWebhook(url, headers = {}, notification) {
    try {
      const payload = {
        timestamp: new Date().toISOString(),
        type: notification.type,
        subject: notification.subject,
        message: notification.message,
        data: notification.data || {}
      };

      const response = await axios.post(url, payload, {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Facebook-Campaign-Launcher-Notification-Service',
          ...headers
        },
        timeout: 10000 // 10 second timeout
      });

      return {
        success: true,
        status: response.status,
        statusText: response.statusText
      };
    } catch (error) {
      console.error('Error sending webhook:', error.message);
      throw new Error(`Webhook failed: ${error.message}`);
    }
  }

  /**
   * Send Slack notification
   * @param {string} webhookUrl - Slack webhook URL
   * @param {string} channel - Optional channel override
   * @param {Object} notification - Notification content
   * @returns {Promise<Object>}
   */
  async sendSlack(webhookUrl, channel, notification) {
    try {
      const webhook = new IncomingWebhook(webhookUrl);

      const payload = {
        text: notification.subject,
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: notification.subject
            }
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: notification.message
            }
          }
        ]
      };

      if (channel) {
        payload.channel = channel;
      }

      // Add color based on notification type
      const color = this.getNotificationColor(notification.type);
      if (color) {
        payload.attachments = [{
          color,
          fields: this.formatSlackFields(notification.data)
        }];
      }

      await webhook.send(payload);

      return {
        success: true
      };
    } catch (error) {
      console.error('Error sending Slack notification:', error);
      throw error;
    }
  }

  /**
   * Send budget alert notification
   * @param {string} userId - User ID
   * @param {Object} alertData - Alert details
   * @returns {Promise<Object>}
   */
  async sendBudgetAlert(userId, alertData) {
    const { campaignName, currentSpend, budget, percentage } = alertData;

    return this.sendNotification(userId, {
      type: 'budget_alert',
      subject: `Budget Alert: ${campaignName}`,
      message: `Campaign "${campaignName}" has reached ${percentage}% of its budget.\n\nCurrent spend: $${currentSpend}\nBudget: $${budget}`,
      data: alertData
    });
  }

  /**
   * Send campaign completion notification
   * @param {string} userId - User ID
   * @param {Object} campaignData - Campaign details
   * @returns {Promise<Object>}
   */
  async sendCampaignComplete(userId, campaignData) {
    const { campaignName, totalSpend, results } = campaignData;

    return this.sendNotification(userId, {
      type: 'campaign_complete',
      subject: `Campaign Completed: ${campaignName}`,
      message: `Campaign "${campaignName}" has completed.\n\nTotal spend: $${totalSpend}\nResults: ${JSON.stringify(results, null, 2)}`,
      data: campaignData
    });
  }

  /**
   * Send campaign error notification
   * @param {string} userId - User ID
   * @param {Object} errorData - Error details
   * @returns {Promise<Object>}
   */
  async sendCampaignError(userId, errorData) {
    const { campaignName, error, details } = errorData;

    return this.sendNotification(userId, {
      type: 'campaign_error',
      subject: `Campaign Error: ${campaignName}`,
      message: `An error occurred with campaign "${campaignName}".\n\nError: ${error}\nDetails: ${details}`,
      data: errorData
    });
  }

  /**
   * Check if notification should be sent based on user preferences
   * @param {Object} preferences - User notification preferences
   * @param {string} type - Notification type
   * @returns {boolean}
   */
  shouldSendNotification(preferences, type) {
    const typeMap = {
      'budget_alert': preferences.notifyOnBudgetAlert,
      'campaign_complete': preferences.notifyOnCampaignComplete,
      'campaign_error': preferences.notifyOnCampaignError,
      'ab_test_results': preferences.notifyOnABTestResults
    };

    return typeMap[type] !== false;
  }

  /**
   * Check if current time is within quiet hours
   * @param {Object} preferences - User notification preferences
   * @returns {boolean}
   */
  isQuietHours(preferences) {
    if (!preferences.quietHoursEnabled || !preferences.quietHoursStart || !preferences.quietHoursEnd) {
      return false;
    }

    // This is a simplified check - in production, you'd want to use a proper timezone library
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const [startHour, startMin] = preferences.quietHoursStart.split(':').map(Number);
    const [endHour, endMin] = preferences.quietHoursEnd.split(':').map(Number);

    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Quiet hours span midnight
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  /**
   * Format notification data as HTML email
   * @param {Object} notification - Notification content
   * @returns {string}
   */
  formatEmailHTML(notification) {
    const colorMap = {
      'budget_alert': '#ff9800',
      'campaign_complete': '#4caf50',
      'campaign_error': '#f44336',
      'ab_test_results': '#2196f3'
    };

    const color = colorMap[notification.type] || '#333';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: ${color}; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
          .content { background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
          .footer { margin-top: 20px; font-size: 12px; color: #666; text-align: center; }
          .data-table { width: 100%; margin-top: 15px; border-collapse: collapse; }
          .data-table td { padding: 8px; border-bottom: 1px solid #ddd; }
          .data-table td:first-child { font-weight: bold; width: 40%; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>${notification.subject}</h2>
          </div>
          <div class="content">
            <p>${notification.message.replace(/\n/g, '<br>')}</p>
            ${notification.data ? this.formatDataTable(notification.data) : ''}
          </div>
          <div class="footer">
            <p>Facebook Campaign Launcher - Notification Service</p>
            <p>This is an automated notification. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Format data as HTML table
   * @param {Object} data - Data object
   * @returns {string}
   */
  formatDataTable(data) {
    if (!data || typeof data !== 'object') return '';

    const rows = Object.entries(data)
      .map(([key, value]) => `
        <tr>
          <td>${key}</td>
          <td>${typeof value === 'object' ? JSON.stringify(value) : value}</td>
        </tr>
      `)
      .join('');

    return `
      <table class="data-table">
        ${rows}
      </table>
    `;
  }

  /**
   * Format notification data as Slack fields
   * @param {Object} data - Data object
   * @returns {Array}
   */
  formatSlackFields(data) {
    if (!data || typeof data !== 'object') return [];

    return Object.entries(data).map(([key, value]) => ({
      title: key,
      value: typeof value === 'object' ? JSON.stringify(value) : String(value),
      short: String(value).length < 40
    }));
  }

  /**
   * Get color for notification type (for Slack attachments)
   * @param {string} type - Notification type
   * @returns {string}
   */
  getNotificationColor(type) {
    const colorMap = {
      'budget_alert': 'warning',
      'campaign_complete': 'good',
      'campaign_error': 'danger',
      'ab_test_results': '#2196f3'
    };

    return colorMap[type] || '#333333';
  }

  /**
   * Test notification service configuration
   * @param {string} userId - User ID to test with
   * @returns {Promise<Object>}
   */
  async testNotificationConfig(userId) {
    const testNotification = {
      type: 'test',
      subject: 'Test Notification',
      message: 'This is a test notification from the Facebook Campaign Launcher notification service.',
      data: {
        timestamp: new Date().toISOString(),
        testId: Math.random().toString(36).substring(7)
      }
    };

    return this.sendNotification(userId, testNotification);
  }
}

module.exports = new NotificationService();
