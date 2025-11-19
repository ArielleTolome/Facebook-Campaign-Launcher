const express = require('express');
const router = express.Router();
const abTestController = require('../controllers/abTestController');

// A/B Test routes
router.post('/', abTestController.createABTest);
router.get('/', abTestController.getABTests);
router.get('/:id', abTestController.getABTestById);
router.put('/:id', abTestController.updateABTest);

// Test control routes
router.post('/:id/start', abTestController.startABTest);
router.post('/:id/complete', abTestController.completeABTest);
router.get('/:id/analyze', abTestController.analyzeResults);

module.exports = router;
