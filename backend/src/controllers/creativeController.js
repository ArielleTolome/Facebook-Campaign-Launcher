const creativeService = require('../services/creativeService');

class CreativeController {
  async createCreative(req, res) {
    try {
      const { adAccountId } = req;
      const creative = await creativeService.createCreative(req.body, adAccountId);
      res.status(201).json({
        success: true,
        data: creative
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async bulkCreateCreatives(req, res) {
    try {
      const { adAccountId } = req;
      const { creatives } = req.body;

      if (!Array.isArray(creatives)) {
        return res.status(400).json({
          success: false,
          error: 'creatives must be an array'
        });
      }

      const results = await creativeService.bulkCreateCreatives(creatives, adAccountId);
      res.status(201).json({
        success: true,
        data: results
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async getCreatives(req, res) {
    try {
      const creatives = await creativeService.getAllCreatives(req.adAccountId, req.query);
      res.json({
        success: true,
        data: creatives
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async getCreativeById(req, res) {
    try {
      const creative = await creativeService.getCreativeById(req.params.id, req.adAccountId);
      res.json({
        success: true,
        data: creative
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        error: error.message
      });
    }
  }

  async updateCreative(req, res) {
    try {
      const creative = await creativeService.updateCreative(req.params.id, req.adAccountId, req.body);
      res.json({
        success: true,
        data: creative
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async deleteCreative(req, res) {
    try {
      const result = await creativeService.deleteCreative(req.params.id, req.adAccountId);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new CreativeController();
