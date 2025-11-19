const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const NotificationPreference = sequelize.define('NotificationPreference', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id',
    comment: 'Reference to user/account that owns these preferences'
  },
  // Email notification settings
  emailEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'email_enabled'
  },
  emailAddress: {
    type: DataTypes.STRING,
    validate: {
      isEmail: true
    },
    field: 'email_address'
  },
  // Webhook settings
  webhookEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'webhook_enabled'
  },
  webhookUrl: {
    type: DataTypes.STRING,
    validate: {
      isUrl: true
    },
    field: 'webhook_url'
  },
  webhookHeaders: {
    type: DataTypes.JSONB,
    defaultValue: {},
    field: 'webhook_headers',
    comment: 'Custom headers to send with webhook requests'
  },
  // Slack settings
  slackEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'slack_enabled'
  },
  slackWebhookUrl: {
    type: DataTypes.STRING,
    field: 'slack_webhook_url'
  },
  slackChannel: {
    type: DataTypes.STRING,
    field: 'slack_channel',
    comment: 'Optional: override default channel'
  },
  // Notification trigger settings
  notifyOnBudgetAlert: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'notify_on_budget_alert',
    comment: 'Send notification when budget threshold is reached'
  },
  notifyOnCampaignComplete: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'notify_on_campaign_complete',
    comment: 'Send notification when campaign completes'
  },
  notifyOnCampaignError: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'notify_on_campaign_error',
    comment: 'Send notification when campaign encounters an error'
  },
  notifyOnABTestResults: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'notify_on_ab_test_results',
    comment: 'Send notification when A/B test has results'
  },
  // Budget alert thresholds
  budgetAlertThresholds: {
    type: DataTypes.JSONB,
    defaultValue: [75, 90, 100],
    field: 'budget_alert_thresholds',
    comment: 'Budget percentage thresholds that trigger alerts (e.g., [75, 90, 100])'
  },
  // General settings
  quietHoursEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'quiet_hours_enabled'
  },
  quietHoursStart: {
    type: DataTypes.TIME,
    field: 'quiet_hours_start',
    comment: 'Start time for quiet hours (no notifications)'
  },
  quietHoursEnd: {
    type: DataTypes.TIME,
    field: 'quiet_hours_end',
    comment: 'End time for quiet hours'
  },
  timezone: {
    type: DataTypes.STRING,
    defaultValue: 'UTC',
    comment: 'Timezone for quiet hours'
  }
}, {
  tableName: 'notification_preferences',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['user_id']
    }
  ]
});

module.exports = NotificationPreference;
