const express = require('express');
const router = express.Router();
const audienceController = require('../controllers/audienceController');

// Multer configuration for CSV file uploads
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Accept CSV files only
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  }
});

// ========== AUDIENCE ROUTES ==========

// Basic CRUD operations
router.post('/', audienceController.createAudience);
router.get('/', audienceController.getAudiences);
router.get('/:id', audienceController.getAudienceById);
router.put('/:id', audienceController.updateAudience);
router.delete('/:id', audienceController.deleteAudience);

// CSV upload for custom audiences
router.post('/:id/upload-csv', upload.single('file'), audienceController.uploadCSV);

// Reach estimation
router.post('/estimate', audienceController.getReachEstimate);

// Create from template
router.post('/templates/:templateId/create', audienceController.createFromTemplate);

// Targeting helpers
router.get('/targeting/suggestions', audienceController.getTargetingSuggestions);
router.post('/targeting/validate', audienceController.validateTargeting);

// ========== TEMPLATE ROUTES ==========

// Template CRUD operations
router.post('/templates', audienceController.createTemplate);
router.get('/templates', audienceController.getTemplates);
router.get('/templates/:id', audienceController.getTemplateById);
router.put('/templates/:id', audienceController.updateTemplate);
router.delete('/templates/:id', audienceController.deleteTemplate);

module.exports = router;
