const NotificationService = require('../services/NotificationService');
const NotificationPreference = require('../models/NotificationPreference');

/**
 * Budget Alert Integration Utility
 * Demonstrates how the budget alert system (Agent 1) integrates with the notification system (Agent 2)
 */

/**
 * Check campaign budget and send alerts if thresholds are reached
 * @param {Object} campaign - Campaign object with budget information
 * @param {string} userId - User ID to send notifications to
 * @returns {Promise<Object>}
 */
async function checkBudgetAndNotify(campaign, userId) {
  try {
    // Get user's notification preferences
    const preferences = await NotificationPreference.findOne({ where: { userId } });

    if (!preferences || !preferences.notifyOnBudgetAlert) {
      return {
        success: true,
        skipped: true,
        reason: 'Budget alerts disabled'
      };
    }

    // Calculate budget usage percentage
    const budget = campaign.dailyBudget || campaign.lifetimeBudget;
    const currentSpend = campaign.currentSpend || 0;
    const percentage = (currentSpend / budget) * 100;

    // Check if any threshold is reached
    const thresholds = preferences.budgetAlertThresholds || [75, 90, 100];
    const reachedThreshold = thresholds.find(threshold =>
      percentage >= threshold && percentage < threshold + 5 // Small window to avoid duplicate alerts
    );

    if (!reachedThreshold) {
      return {
        success: true,
        skipped: true,
        reason: 'No threshold reached'
      };
    }

    // Send budget alert notification
    const alertData = {
      campaignId: campaign.id,
      campaignName: campaign.name,
      budget: budget.toFixed(2),
      currentSpend: currentSpend.toFixed(2),
      percentage: Math.round(percentage),
      threshold: reachedThreshold,
      timestamp: new Date().toISOString()
    };

    const result = await NotificationService.sendBudgetAlert(userId, alertData);

    return {
      success: true,
      notificationSent: true,
      alertData,
      result
    };
  } catch (error) {
    console.error('Error checking budget and sending notification:', error);
    throw error;
  }
}

/**
 * Monitor multiple campaigns and send alerts
 * This would typically be called by a cron job or scheduled task
 * @param {Array} campaigns - Array of campaign objects
 * @param {string} userId - User ID
 * @returns {Promise<Object>}
 */
async function monitorCampaignBudgets(campaigns, userId) {
  const results = {
    checked: 0,
    alerted: 0,
    skipped: 0,
    errors: []
  };

  for (const campaign of campaigns) {
    try {
      results.checked++;
      const result = await checkBudgetAndNotify(campaign, userId);

      if (result.notificationSent) {
        results.alerted++;
      } else if (result.skipped) {
        results.skipped++;
      }
    } catch (error) {
      results.errors.push({
        campaignId: campaign.id,
        error: error.message
      });
    }
  }

  return results;
}

/**
 * Send campaign completion notification
 * @param {Object} campaign - Campaign object
 * @param {Object} results - Campaign results data
 * @param {string} userId - User ID
 * @returns {Promise<Object>}
 */
async function notifyCampaignComplete(campaign, results, userId) {
  try {
    const campaignData = {
      campaignId: campaign.id,
      campaignName: campaign.name,
      totalSpend: results.totalSpend || 0,
      impressions: results.impressions || 0,
      clicks: results.clicks || 0,
      conversions: results.conversions || 0,
      ctr: results.ctr || 0,
      cpc: results.cpc || 0,
      completedAt: new Date().toISOString(),
      results
    };

    return await NotificationService.sendCampaignComplete(userId, campaignData);
  } catch (error) {
    console.error('Error sending campaign completion notification:', error);
    throw error;
  }
}

/**
 * Send campaign error notification
 * @param {Object} campaign - Campaign object
 * @param {Error} error - Error object
 * @param {string} userId - User ID
 * @returns {Promise<Object>}
 */
async function notifyCampaignError(campaign, error, userId) {
  try {
    const errorData = {
      campaignId: campaign.id,
      campaignName: campaign.name,
      error: error.message,
      details: error.stack || 'No additional details',
      timestamp: new Date().toISOString()
    };

    return await NotificationService.sendCampaignError(userId, errorData);
  } catch (err) {
    console.error('Error sending campaign error notification:', err);
    throw err;
  }
}

module.exports = {
  checkBudgetAndNotify,
  monitorCampaignBudgets,
  notifyCampaignComplete,
  notifyCampaignError
};
