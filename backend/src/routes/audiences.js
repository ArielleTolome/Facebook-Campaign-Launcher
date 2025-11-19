const express = require('express');
const router = express.Router();
const audienceController = require('../controllers/audienceController');

// Audience routes
router.post('/', audienceController.createAudience);
router.post('/bulk', audienceController.bulkCreateAudiences);
router.post('/estimate-size', audienceController.estimateSize);
router.post('/analyze-overlap', audienceController.analyzeOverlap);
router.get('/', audienceController.getAudiences);
router.get('/:id', audienceController.getAudienceById);
router.put('/:id', audienceController.updateAudience);
router.delete('/:id', audienceController.deleteAudience);

module.exports = router;
