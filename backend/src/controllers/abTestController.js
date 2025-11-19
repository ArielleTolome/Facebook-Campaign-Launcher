const abTestService = require('../services/abTestService');

class ABTestController {
  async createABTest(req, res) {
    try {
      const abTest = await abTestService.createABTest(req.body, req.adAccountId);
      res.status(201).json({
        success: true,
        data: abTest
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async getABTests(req, res) {
    try {
      const abTests = await abTestService.getAllABTests(req.adAccountId, req.query);
      res.json({
        success: true,
        data: abTests
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async getABTestById(req, res) {
    try {
      const abTest = await abTestService.getABTestById(req.params.id, req.adAccountId);
      res.json({
        success: true,
        data: abTest
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        error: error.message
      });
    }
  }

  async updateABTest(req, res) {
    try {
      const abTest = await abTestService.updateABTest(req.params.id, req.adAccountId, req.body);
      res.json({
        success: true,
        data: abTest
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async startABTest(req, res) {
    try {
      const abTest = await abTestService.startABTest(req.params.id, req.adAccountId);
      res.json({
        success: true,
        data: abTest
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async completeABTest(req, res) {
    try {
      const abTest = await abTestService.completeABTest(req.params.id, req.adAccountId, req.body.results);
      res.json({
        success: true,
        data: abTest
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async analyzeResults(req, res) {
    try {
      const analysis = await abTestService.analyzeResults(req.params.id, req.adAccountId);
      res.json({
        success: true,
        data: analysis
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new ABTestController();
