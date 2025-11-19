const NotificationPreference = require('../models/NotificationPreference');
const NotificationService = require('../services/NotificationService');

class NotificationController {
  /**
   * Create notification preferences for a user
   */
  async createPreferences(req, res) {
    try {
      const preferences = await NotificationPreference.create(req.body);
      res.status(201).json({
        success: true,
        data: preferences
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get notification preferences by user ID
   */
  async getPreferencesByUserId(req, res) {
    try {
      const { userId } = req.params;
      const preferences = await NotificationPreference.findOne({
        where: { userId }
      });

      if (!preferences) {
        return res.status(404).json({
          success: false,
          error: 'Notification preferences not found for this user'
        });
      }

      res.json({
        success: true,
        data: preferences
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get all notification preferences
   */
  async getAllPreferences(req, res) {
    try {
      const preferences = await NotificationPreference.findAll({
        order: [['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        data: preferences,
        count: preferences.length
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(req, res) {
    try {
      const { id } = req.params;
      const preferences = await NotificationPreference.findByPk(id);

      if (!preferences) {
        return res.status(404).json({
          success: false,
          error: 'Notification preferences not found'
        });
      }

      await preferences.update(req.body);

      res.json({
        success: true,
        data: preferences
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Update notification preferences by user ID
   */
  async updatePreferencesByUserId(req, res) {
    try {
      const { userId } = req.params;
      const preferences = await NotificationPreference.findOne({
        where: { userId }
      });

      if (!preferences) {
        // Create new preferences if they don't exist
        const newPreferences = await NotificationPreference.create({
          userId,
          ...req.body
        });

        return res.status(201).json({
          success: true,
          data: newPreferences,
          created: true
        });
      }

      await preferences.update(req.body);

      res.json({
        success: true,
        data: preferences
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Delete notification preferences
   */
  async deletePreferences(req, res) {
    try {
      const { id } = req.params;
      const preferences = await NotificationPreference.findByPk(id);

      if (!preferences) {
        return res.status(404).json({
          success: false,
          error: 'Notification preferences not found'
        });
      }

      await preferences.destroy();

      res.json({
        success: true,
        message: 'Notification preferences deleted successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Test notification configuration
   */
  async testNotification(req, res) {
    try {
      const { userId } = req.params;

      const result = await NotificationService.testNotificationConfig(userId);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Send a manual notification
   */
  async sendNotification(req, res) {
    try {
      const { userId, notification } = req.body;

      if (!userId || !notification) {
        return res.status(400).json({
          success: false,
          error: 'userId and notification are required'
        });
      }

      if (!notification.type || !notification.subject || !notification.message) {
        return res.status(400).json({
          success: false,
          error: 'notification must include type, subject, and message'
        });
      }

      const result = await NotificationService.sendNotification(userId, notification);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Send budget alert (convenience method)
   */
  async sendBudgetAlert(req, res) {
    try {
      const { userId, alertData } = req.body;

      if (!userId || !alertData) {
        return res.status(400).json({
          success: false,
          error: 'userId and alertData are required'
        });
      }

      const result = await NotificationService.sendBudgetAlert(userId, alertData);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Send campaign complete notification (convenience method)
   */
  async sendCampaignComplete(req, res) {
    try {
      const { userId, campaignData } = req.body;

      if (!userId || !campaignData) {
        return res.status(400).json({
          success: false,
          error: 'userId and campaignData are required'
        });
      }

      const result = await NotificationService.sendCampaignComplete(userId, campaignData);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Send campaign error notification (convenience method)
   */
  async sendCampaignError(req, res) {
    try {
      const { userId, errorData } = req.body;

      if (!userId || !errorData) {
        return res.status(400).json({
          success: false,
          error: 'userId and errorData are required'
        });
      }

      const result = await NotificationService.sendCampaignError(userId, errorData);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new NotificationController();
