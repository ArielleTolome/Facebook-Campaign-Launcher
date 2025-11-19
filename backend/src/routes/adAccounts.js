const express = require('express');
const router = express.Router();
const adAccountController = require('../controllers/adAccountController');
const authMiddleware = require('../middleware/auth'); // Assuming you have an auth middleware

// @route   GET /api/ad-accounts
// @desc    Get all ad accounts for the user
// @access  Private
router.get('/', authMiddleware, adAccountController.getAdAccounts);

// @route   POST /api/ad-accounts/select
// @desc    Select an ad account for the session
// @access  Private
router.post('/select', authMiddleware, adAccountController.selectAdAccount);

module.exports = router;
