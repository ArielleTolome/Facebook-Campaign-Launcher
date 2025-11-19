const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const accountScope = require('../middleware/accountScope');
const adAccountRoutes = require('./adAccounts');
const campaignRoutes = require('./campaigns');
const creativeRoutes = require('./creatives');
const abTestRoutes = require('./abTests');

// Auth routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Ad account routes are not scoped
router.use('/ad-accounts', adAccountRoutes);

// Apply account scope middleware to all subsequent routes
router.use(accountScope);

router.use('/campaigns', campaignRoutes);
router.use('/creatives', creativeRoutes);
router.use('/ab-tests', abTestRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

module.exports = router;
