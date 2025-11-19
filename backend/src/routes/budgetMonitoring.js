const express = require('express');
const router = express.Router();
const budgetMonitorService = require('../services/BudgetMonitorService');
const budgetPacingChecker = require('../jobs/budgetPacingChecker');
const { BudgetAlert } = require('../models');

/**
 * GET /api/budget-monitoring/alerts
 * Get all budget alerts
 */
router.get('/alerts', async (req, res) => {
  try {
    const { status, severity, campaignId, limit = 50, offset = 0 } = req.query;

    const whereClause = {};

    if (status) {
      whereClause.status = status;
    }

    if (severity) {
      whereClause.severity = severity;
    }

    if (campaignId) {
      whereClause.campaignId = campaignId;
    }

    const alerts = await BudgetAlert.findAll({
      where: whereClause,
      include: ['campaign'],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const totalCount = await BudgetAlert.count({ where: whereClause });

    res.json({
      success: true,
      data: {
        alerts,
        pagination: {
          total: totalCount,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: parseInt(offset) + alerts.length < totalCount
        }
      }
    });
  } catch (error) {
    console.error('Error fetching budget alerts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch budget alerts',
      message: error.message
    });
  }
});

/**
 * GET /api/budget-monitoring/campaigns/:campaignId/alerts
 * Get alerts for a specific campaign
 */
router.get('/campaigns/:campaignId/alerts', async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { includeResolved } = req.query;

    const alerts = await budgetMonitorService.getCampaignAlerts(
      campaignId,
      includeResolved === 'true'
    );

    res.json({
      success: true,
      data: { alerts }
    });
  } catch (error) {
    console.error('Error fetching campaign alerts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch campaign alerts',
      message: error.message
    });
  }
});

/**
 * GET /api/budget-monitoring/stats
 * Get monitoring statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await budgetMonitorService.getMonitoringStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching monitoring stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch monitoring statistics',
      message: error.message
    });
  }
});

/**
 * POST /api/budget-monitoring/check
 * Manually trigger a budget monitoring check
 */
router.post('/check', async (req, res) => {
  try {
    const results = await budgetPacingChecker.triggerManualCheck();

    res.json({
      success: true,
      message: 'Budget monitoring check completed',
      data: results
    });
  } catch (error) {
    console.error('Error triggering budget check:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to trigger budget check',
      message: error.message
    });
  }
});

/**
 * PUT /api/budget-monitoring/alerts/:alertId/resolve
 * Resolve a budget alert
 */
router.put('/alerts/:alertId/resolve', async (req, res) => {
  try {
    const { alertId } = req.params;

    const alert = await budgetMonitorService.resolveAlert(alertId);

    res.json({
      success: true,
      message: 'Alert resolved successfully',
      data: { alert }
    });
  } catch (error) {
    console.error('Error resolving alert:', error);
    res.status(error.message === 'Alert not found' ? 404 : 500).json({
      success: false,
      error: 'Failed to resolve alert',
      message: error.message
    });
  }
});

/**
 * GET /api/budget-monitoring/job/status
 * Get budget monitoring job status
 */
router.get('/job/status', (req, res) => {
  try {
    const status = budgetPacingChecker.getStatus();

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error fetching job status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch job status',
      message: error.message
    });
  }
});

/**
 * GET /api/budget-monitoring/alerts/:alertId
 * Get a specific alert by ID
 */
router.get('/alerts/:alertId', async (req, res) => {
  try {
    const { alertId } = req.params;

    const alert = await BudgetAlert.findByPk(alertId, {
      include: ['campaign']
    });

    if (!alert) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found'
      });
    }

    res.json({
      success: true,
      data: { alert }
    });
  } catch (error) {
    console.error('Error fetching alert:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch alert',
      message: error.message
    });
  }
});

module.exports = router;
