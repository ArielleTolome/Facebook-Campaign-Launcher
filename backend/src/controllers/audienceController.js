const audienceService = require('../services/audienceService');

class AudienceController {
  async createAudience(req, res) {
    try {
      const { adAccountId } = req.query;
      const audience = await audienceService.createAudience(req.body, adAccountId);
      res.status(201).json({
        success: true,
        data: audience
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async bulkCreateAudiences(req, res) {
    try {
      const { adAccountId } = req.query;
      const { audiences } = req.body;

      if (!Array.isArray(audiences)) {
        return res.status(400).json({
          success: false,
          error: 'audiences must be an array'
        });
      }

      const results = await audienceService.bulkCreateAudiences(audiences, adAccountId);
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

  async getAudiences(req, res) {
    try {
      const audiences = await audienceService.getAllAudiences(req.query);
      res.json({
        success: true,
        data: audiences
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async getAudienceById(req, res) {
    try {
      const audience = await audienceService.getAudienceById(req.params.id);
      res.json({
        success: true,
        data: audience
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        error: error.message
      });
    }
  }

  async updateAudience(req, res) {
    try {
      const audience = await audienceService.updateAudience(req.params.id, req.body);
      res.json({
        success: true,
        data: audience
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async deleteAudience(req, res) {
    try {
      const result = await audienceService.deleteAudience(req.params.id);
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

  async estimateSize(req, res) {
    try {
      const { adAccountId } = req.query;
      const { targeting } = req.body;

      if (!targeting) {
        return res.status(400).json({
          success: false,
          error: 'targeting is required'
        });
      }

      const estimate = await audienceService.estimateAudienceSize(targeting, adAccountId);
      res.json({
        success: true,
        data: estimate
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async analyzeOverlap(req, res) {
    try {
      const { audienceIds } = req.body;

      if (!Array.isArray(audienceIds) || audienceIds.length < 2) {
        return res.status(400).json({
          success: false,
          error: 'At least 2 audience IDs required'
        });
      }

      const overlap = await audienceService.analyzeAudienceOverlap(audienceIds);
      res.json({
        success: true,
        data: overlap
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new AudienceController();
