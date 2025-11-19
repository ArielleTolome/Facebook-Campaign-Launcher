const express = require('express');
const router = express.Router();
const PredictionService = require('../services/PredictionService');

router.post('/', async (req, res) => {
  try {
    const prediction = await PredictionService.predict(req.body);
    res.json(prediction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
