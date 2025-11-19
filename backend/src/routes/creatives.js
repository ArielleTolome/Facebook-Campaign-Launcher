const express = require('express');
const router = express.Router();
const creativeController = require('../controllers/creativeController');

// Creative routes
router.post('/', creativeController.createCreative);
router.post('/bulk', creativeController.bulkCreateCreatives);
router.get('/', creativeController.getCreatives);
router.get('/:id', creativeController.getCreativeById);
router.put('/:id', creativeController.updateCreative);
router.delete('/:id', creativeController.deleteCreative);

module.exports = router;
