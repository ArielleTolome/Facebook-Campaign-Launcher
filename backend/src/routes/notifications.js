const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// Notification preferences CRUD routes
router.post('/preferences', notificationController.createPreferences);
router.get('/preferences', notificationController.getAllPreferences);
router.get('/preferences/:id', notificationController.getPreferencesByUserId);
router.put('/preferences/:id', notificationController.updatePreferences);
router.delete('/preferences/:id', notificationController.deletePreferences);

// User-specific preference routes
router.get('/users/:userId/preferences', notificationController.getPreferencesByUserId);
router.put('/users/:userId/preferences', notificationController.updatePreferencesByUserId);

// Notification sending routes
router.post('/send', notificationController.sendNotification);
router.post('/send/budget-alert', notificationController.sendBudgetAlert);
router.post('/send/campaign-complete', notificationController.sendCampaignComplete);
router.post('/send/campaign-error', notificationController.sendCampaignError);

// Test notification endpoint
router.post('/test/:userId', notificationController.testNotification);

module.exports = router;
