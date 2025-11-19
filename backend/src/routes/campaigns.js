const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaignController');
const rbacMiddleware = require('../middleware/rbacMiddleware');

// Campaign routes
router.post('/', rbacMiddleware('WRITE'), campaignController.createCampaign);
router.post('/bulk', rbacMiddleware('WRITE'), campaignController.bulkCreateCampaigns);
router.get('/', rbacMiddleware('READ'), campaignController.getCampaigns);
router.get('/:id', rbacMiddleware('READ'), campaignController.getCampaignById);
router.put('/:id', rbacMiddleware('WRITE'), campaignController.updateCampaign);
router.delete('/:id', rbacMiddleware('DELETE'), campaignController.deleteCampaign);

// Template routes
router.post('/templates/:templateId/create', rbacMiddleware('WRITE'), campaignController.createFromTemplate);

// Insights routes
router.get('/:id/insights', rbacMiddleware('READ'), campaignController.getCampaignInsights);

module.exports = router;
