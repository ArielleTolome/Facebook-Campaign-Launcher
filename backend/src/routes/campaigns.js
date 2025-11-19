const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaignController');

// Campaign routes
router.post('/', campaignController.createCampaign);
router.post('/bulk', campaignController.bulkCreateCampaigns);
router.get('/', campaignController.getCampaigns);
router.get('/:id', campaignController.getCampaignById);
router.put('/:id', campaignController.updateCampaign);
router.delete('/:id', campaignController.deleteCampaign);

// Template routes
router.post('/templates/:templateId/create', campaignController.createFromTemplate);

// Insights routes
router.get('/:id/insights', campaignController.getCampaignInsights);

module.exports = router;
