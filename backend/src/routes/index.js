const express = require('express');
const router = express.Router();

const campaignRoutes = require('./campaigns');
const creativeRoutes = require('./creatives');
const creativeAnalyticsRoutes = require('./creativeAnalytics');
const abTestRoutes = require('./abTests');

router.use('/campaigns', campaignRoutes);
router.use('/creatives', creativeRoutes);
router.use('/analytics', creativeAnalyticsRoutes);
router.use('/ab-tests', abTestRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

module.exports = router;
