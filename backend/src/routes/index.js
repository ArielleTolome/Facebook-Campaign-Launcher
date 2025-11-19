const express = require('express');
const router = express.Router();

const campaignRoutes = require('./campaigns');
const creativeRoutes = require('./creatives');
const abTestRoutes = require('./abTests');
const notificationRoutes = require('./notifications');

router.use('/campaigns', campaignRoutes);
router.use('/creatives', creativeRoutes);
router.use('/ab-tests', abTestRoutes);
router.use('/notifications', notificationRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

module.exports = router;
