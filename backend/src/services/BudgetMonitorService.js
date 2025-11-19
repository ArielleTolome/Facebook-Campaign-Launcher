const { Campaign, BudgetAlert } = require('../models');
const facebookAPI = require('./facebookAPI');
const { Op } = require('sequelize');

class BudgetMonitorService {
  constructor() {
    this.OVERSPEND_THRESHOLD = 120; // Alert when spending >120% of expected pace
    this.UNDERSPEND_THRESHOLD = 50; // Alert when spending <50% of expected pace
    this.AUTO_PAUSE_THRESHOLD = 90; // Auto-pause at 90% of budget
    this.CRITICAL_THRESHOLD = 95; // Critical alert at 95% of budget
  }

  /**
   * Main method to monitor all active campaigns
   */
  async monitorAllCampaigns() {
    try {
      console.log('[BudgetMonitor] Starting budget monitoring check...');

      // Get all active campaigns with Facebook IDs
      const campaigns = await Campaign.findAll({
        where: {
          status: 'ACTIVE',
          fbCampaignId: {
            [Op.not]: null
          },
          [Op.or]: [
            { dailyBudget: { [Op.not]: null } },
            { lifetimeBudget: { [Op.not]: null } }
          ]
        }
      });

      console.log(`[BudgetMonitor] Found ${campaigns.length} active campaigns to monitor`);

      const results = {
        monitored: campaigns.length,
        alerts: [],
        paused: [],
        errors: []
      };

      // Monitor each campaign
      for (const campaign of campaigns) {
        try {
          const monitorResult = await this.monitorCampaign(campaign);

          if (monitorResult.alert) {
            results.alerts.push(monitorResult.alert);
          }

          if (monitorResult.paused) {
            results.paused.push(campaign.id);
          }
        } catch (error) {
          console.error(`[BudgetMonitor] Error monitoring campaign ${campaign.id}:`, error.message);
          results.errors.push({
            campaignId: campaign.id,
            error: error.message
          });
        }
      }

      console.log(`[BudgetMonitor] Monitoring complete. Alerts: ${results.alerts.length}, Paused: ${results.paused.length}, Errors: ${results.errors.length}`);

      return results;
    } catch (error) {
      console.error('[BudgetMonitor] Error in monitorAllCampaigns:', error);
      throw error;
    }
  }

  /**
   * Monitor a single campaign
   */
  async monitorCampaign(campaign) {
    const result = {
      campaignId: campaign.id,
      alert: null,
      paused: false
    };

    try {
      // Get current spend from Facebook
      const insights = await this.getCampaignSpend(campaign.fbCampaignId);

      if (!insights) {
        console.log(`[BudgetMonitor] No insights available for campaign ${campaign.id}`);
        return result;
      }

      const currentSpend = parseFloat(insights.spend) || 0;

      // Determine budget type and calculate metrics
      const budgetMetrics = campaign.dailyBudget
        ? await this.calculateDailyBudgetMetrics(campaign, currentSpend)
        : await this.calculateLifetimeBudgetMetrics(campaign, currentSpend);

      if (!budgetMetrics) {
        return result;
      }

      // Check for budget issues
      const alertData = await this.checkBudgetThresholds(campaign, budgetMetrics);

      if (alertData) {
        // Create alert in database
        const alert = await this.createAlert(campaign, alertData, budgetMetrics);
        result.alert = alert;

        // Auto-pause if necessary
        if (alertData.shouldPause) {
          await this.pauseCampaign(campaign);
          result.paused = true;
        }
      }

      return result;
    } catch (error) {
      console.error(`[BudgetMonitor] Error monitoring campaign ${campaign.id}:`, error);
      throw error;
    }
  }

  /**
   * Get campaign spend from Facebook API
   */
  async getCampaignSpend(fbCampaignId) {
    try {
      const insights = await facebookAPI.getCampaignInsights(fbCampaignId, 'today');

      if (insights.data && insights.data.length > 0) {
        return insights.data[0];
      }

      return null;
    } catch (error) {
      console.error(`[BudgetMonitor] Error fetching insights for campaign ${fbCampaignId}:`, error.message);
      throw error;
    }
  }

  /**
   * Calculate metrics for daily budget campaigns
   */
  async calculateDailyBudgetMetrics(campaign, currentSpend) {
    const dailyBudget = parseFloat(campaign.dailyBudget);

    // Calculate how far through the day we are
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const minutesElapsed = (now - startOfDay) / (1000 * 60);
    const totalMinutesInDay = 24 * 60;
    const dayProgress = minutesElapsed / totalMinutesInDay;

    // Calculate expected spend based on time of day
    const expectedSpend = dailyBudget * dayProgress;

    // Calculate pace percentage
    const pacePercentage = expectedSpend > 0 ? (currentSpend / expectedSpend) * 100 : 0;

    // Forecast end-of-day spend
    const forecastedSpend = dayProgress > 0 ? currentSpend / dayProgress : currentSpend;

    return {
      budgetType: 'DAILY',
      budget: dailyBudget,
      currentSpend,
      expectedSpend,
      pacePercentage,
      forecastedSpend,
      remainingBudget: dailyBudget - currentSpend,
      spendPercentage: (currentSpend / dailyBudget) * 100,
      dayProgress: dayProgress * 100
    };
  }

  /**
   * Calculate metrics for lifetime budget campaigns
   */
  async calculateLifetimeBudgetMetrics(campaign, currentSpend) {
    const lifetimeBudget = parseFloat(campaign.lifetimeBudget);

    if (!campaign.startTime || !campaign.endTime) {
      console.log(`[BudgetMonitor] Campaign ${campaign.id} missing start/end time for lifetime budget tracking`);
      return null;
    }

    const now = new Date();
    const startTime = new Date(campaign.startTime);
    const endTime = new Date(campaign.endTime);

    // Calculate campaign progress
    const totalDuration = endTime - startTime;
    const elapsed = now - startTime;
    const campaignProgress = elapsed / totalDuration;

    if (campaignProgress < 0 || campaignProgress > 1) {
      console.log(`[BudgetMonitor] Campaign ${campaign.id} is outside its scheduled time range`);
      return null;
    }

    // Calculate expected spend based on campaign progress
    const expectedSpend = lifetimeBudget * campaignProgress;

    // Calculate pace percentage
    const pacePercentage = expectedSpend > 0 ? (currentSpend / expectedSpend) * 100 : 0;

    // Forecast total spend
    const forecastedSpend = campaignProgress > 0 ? currentSpend / campaignProgress : currentSpend;

    return {
      budgetType: 'LIFETIME',
      budget: lifetimeBudget,
      currentSpend,
      expectedSpend,
      pacePercentage,
      forecastedSpend,
      remainingBudget: lifetimeBudget - currentSpend,
      spendPercentage: (currentSpend / lifetimeBudget) * 100,
      campaignProgress: campaignProgress * 100
    };
  }

  /**
   * Check if campaign exceeds any budget thresholds
   */
  async checkBudgetThresholds(campaign, metrics) {
    const {
      pacePercentage,
      spendPercentage,
      forecastedSpend,
      budget,
      budgetType
    } = metrics;

    // Check if should auto-pause (90% budget spent)
    if (spendPercentage >= this.AUTO_PAUSE_THRESHOLD) {
      return {
        alertType: 'AUTO_PAUSED',
        severity: 'CRITICAL',
        message: `Campaign auto-paused: ${spendPercentage.toFixed(1)}% of ${budgetType.toLowerCase()} budget spent`,
        shouldPause: true
      };
    }

    // Check for critical overspend (95% budget spent)
    if (spendPercentage >= this.CRITICAL_THRESHOLD) {
      return {
        alertType: 'BUDGET_EXHAUSTED',
        severity: 'CRITICAL',
        message: `Critical: ${spendPercentage.toFixed(1)}% of ${budgetType.toLowerCase()} budget spent`,
        shouldPause: false
      };
    }

    // Check for fast spending pace (>120% of expected pace)
    if (pacePercentage >= this.OVERSPEND_THRESHOLD) {
      const overageAmount = forecastedSpend - budget;
      return {
        alertType: 'OVERSPEND',
        severity: 'WARNING',
        message: `Campaign spending ${pacePercentage.toFixed(1)}% of expected pace. Forecasted to exceed budget by $${overageAmount.toFixed(2)}`,
        shouldPause: false
      };
    }

    // Check for slow spending pace (<50% of expected pace)
    if (pacePercentage > 0 && pacePercentage <= this.UNDERSPEND_THRESHOLD) {
      return {
        alertType: 'UNDERSPEND',
        severity: 'INFO',
        message: `Campaign spending only ${pacePercentage.toFixed(1)}% of expected pace. May not fully utilize budget`,
        shouldPause: false
      };
    }

    return null;
  }

  /**
   * Create budget alert in database
   */
  async createAlert(campaign, alertData, metrics) {
    try {
      // Check if there's already an active alert of this type for this campaign
      const existingAlert = await BudgetAlert.findOne({
        where: {
          campaignId: campaign.id,
          alertType: alertData.alertType,
          status: 'ACTIVE'
        }
      });

      // Don't create duplicate active alerts
      if (existingAlert) {
        console.log(`[BudgetMonitor] Active alert already exists for campaign ${campaign.id}, type ${alertData.alertType}`);
        return existingAlert;
      }

      const alert = await BudgetAlert.create({
        campaignId: campaign.id,
        alertType: alertData.alertType,
        severity: alertData.severity,
        message: alertData.message,
        currentSpend: metrics.currentSpend,
        budgetLimit: metrics.budget,
        pacePercentage: metrics.pacePercentage,
        forecastedSpend: metrics.forecastedSpend,
        status: 'ACTIVE',
        metadata: {
          campaignName: campaign.name,
          budgetType: metrics.budgetType,
          spendPercentage: metrics.spendPercentage,
          remainingBudget: metrics.remainingBudget,
          expectedSpend: metrics.expectedSpend,
          fbCampaignId: campaign.fbCampaignId
        }
      });

      console.log(`[BudgetMonitor] Created ${alertData.severity} alert for campaign ${campaign.name}: ${alertData.message}`);

      return alert;
    } catch (error) {
      console.error(`[BudgetMonitor] Error creating alert:`, error);
      throw error;
    }
  }

  /**
   * Pause a campaign that exceeded budget threshold
   */
  async pauseCampaign(campaign) {
    try {
      console.log(`[BudgetMonitor] Auto-pausing campaign ${campaign.name} (${campaign.id})`);

      // Update status in Facebook
      await facebookAPI.updateCampaignStatus(campaign.fbCampaignId, 'PAUSED');

      // Update status in local database
      await campaign.update({ status: 'PAUSED' });

      console.log(`[BudgetMonitor] Successfully paused campaign ${campaign.name}`);

      return true;
    } catch (error) {
      console.error(`[BudgetMonitor] Error pausing campaign ${campaign.id}:`, error);
      throw error;
    }
  }

  /**
   * Get budget alerts for a campaign
   */
  async getCampaignAlerts(campaignId, includeResolved = false) {
    const whereClause = { campaignId };

    if (!includeResolved) {
      whereClause.status = 'ACTIVE';
    }

    return await BudgetAlert.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * Resolve an alert
   */
  async resolveAlert(alertId) {
    const alert = await BudgetAlert.findByPk(alertId);

    if (!alert) {
      throw new Error('Alert not found');
    }

    await alert.update({
      status: 'RESOLVED',
      resolvedAt: new Date()
    });

    return alert;
  }

  /**
   * Get monitoring statistics
   */
  async getMonitoringStats() {
    const totalAlerts = await BudgetAlert.count();
    const activeAlerts = await BudgetAlert.count({ where: { status: 'ACTIVE' } });
    const criticalAlerts = await BudgetAlert.count({
      where: {
        status: 'ACTIVE',
        severity: 'CRITICAL'
      }
    });

    const alertsByType = await BudgetAlert.findAll({
      attributes: [
        'alertType',
        [BudgetAlert.sequelize.fn('COUNT', BudgetAlert.sequelize.col('id')), 'count']
      ],
      where: { status: 'ACTIVE' },
      group: ['alertType'],
      raw: true
    });

    return {
      totalAlerts,
      activeAlerts,
      criticalAlerts,
      alertsByType
    };
  }
}

module.exports = new BudgetMonitorService();
