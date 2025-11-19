const express = require('express');
const router = express.Router();
const CreativeAnalyticsController = require('../controllers/creativeAnalyticsController');

// GET /api/creatives/rankings
router.get('/rankings', CreativeAnalyticsController.getRankedCreatives);

// GET /api/creatives/:creativeId/fatigue
router.get('/:creativeId/fatigue', CreativeAnalyticsController.detectCreativeFatigue);

// GET /api/creatives/recommendations
router.get('/recommendations', CreativeAnalyticsController.getRotationRecommendations);

module.exports = router;
