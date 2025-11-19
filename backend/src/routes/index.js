const express = require('express');
const router = express.Router();

const campaignRoutes = require('./campaigns');
const creativeRoutes = require('./creatives');
const abTestRoutes = require('./abTests');
const predictionRoutes = require('./predictions');

router.use('/campaigns', campaignRoutes);
router.use('/creatives', creativeRoutes);
router.use('/ab-tests', abTestRoutes);
router.use('/predictions', predictionRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

module.exports = router;
