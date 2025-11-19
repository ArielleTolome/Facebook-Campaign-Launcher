const audienceService = require('../services/audienceService');
const { Audience, AudienceTemplate } = require('../models');

class AudienceController {
  /**
   * Create a new audience
   */
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

  /**
   * Get all audiences
   */
  async getAudiences(req, res) {
    try {
      const filters = {
        type: req.query.type,
        status: req.query.status,
        tags: req.query.tags ? req.query.tags.split(',') : undefined
      };

      const audiences = await audienceService.getAllAudiences(filters);
      res.json({
        success: true,
        data: audiences,
        count: audiences.length
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get audience by ID
   */
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

  /**
   * Update audience
   */
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

  /**
   * Delete audience
   */
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

  /**
   * Upload users to custom audience from CSV
   */
  async uploadCSV(req, res) {
    try {
      const { id } = req.params;
      const { schema = 'EMAIL' } = req.body;

      // Get CSV data from request
      let csvData;
      if (req.file) {
        // If using multipart/form-data with file upload
        csvData = req.file.buffer.toString('utf-8');
      } else if (req.body.csvData) {
        // If CSV data sent as string in request body
        csvData = req.body.csvData;
      } else {
        throw new Error('No CSV data provided');
      }

      const result = await audienceService.uploadUsersToAudience(
        id,
        csvData,
        Array.isArray(schema) ? schema : [schema]
      );

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

  /**
   * Get audience reach estimate
   */
  async getReachEstimate(req, res) {
    try {
      const { adAccountId } = req.query;
      const { targeting } = req.body;

      if (!targeting) {
        return res.status(400).json({
          success: false,
          error: 'Targeting specification is required'
        });
      }

      const estimate = await audienceService.getAudienceEstimate(targeting, adAccountId);
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

  /**
   * Create audience from template
   */
  async createFromTemplate(req, res) {
    try {
      const { templateId } = req.params;
      const { adAccountId } = req.query;

      const audience = await audienceService.createFromTemplate(
        templateId,
        req.body,
        adAccountId
      );

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

  /**
   * Get targeting suggestions
   */
  async getTargetingSuggestions(req, res) {
    try {
      const { adAccountId, type, query } = req.query;

      if (!adAccountId || !type || !query) {
        return res.status(400).json({
          success: false,
          error: 'adAccountId, type, and query are required'
        });
      }

      const suggestions = await audienceService.getTargetingSuggestions(
        adAccountId,
        type,
        query
      );

      res.json({
        success: true,
        data: suggestions
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Validate targeting specification
   */
  async validateTargeting(req, res) {
    try {
      const { adAccountId } = req.query;
      const { targeting } = req.body;

      if (!targeting) {
        return res.status(400).json({
          success: false,
          error: 'Targeting specification is required'
        });
      }

      const validation = await audienceService.validateTargeting(adAccountId, targeting);

      res.json({
        success: true,
        data: validation
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // ========== TEMPLATE CONTROLLERS ==========

  /**
   * Create audience template
   */
  async createTemplate(req, res) {
    try {
      const template = await AudienceTemplate.create(req.body);
      res.status(201).json({
        success: true,
        data: template
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get all audience templates
   */
  async getTemplates(req, res) {
    try {
      const where = {};

      if (req.query.type) {
        where.type = req.query.type;
      }

      if (req.query.category) {
        where.category = req.query.category;
      }

      if (req.query.isPublic !== undefined) {
        where.isPublic = req.query.isPublic === 'true';
      }

      if (req.query.tags) {
        const tags = req.query.tags.split(',');
        where.tags = {
          [require('sequelize').Op.overlap]: tags
        };
      }

      const templates = await AudienceTemplate.findAll({
        where,
        order: [['usageCount', 'DESC'], ['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        data: templates,
        count: templates.length
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get template by ID
   */
  async getTemplateById(req, res) {
    try {
      const template = await AudienceTemplate.findByPk(req.params.id, {
        include: [
          {
            association: 'audiences',
            limit: 5,
            order: [['createdAt', 'DESC']]
          }
        ]
      });

      if (!template) {
        return res.status(404).json({
          success: false,
          error: 'Template not found'
        });
      }

      res.json({
        success: true,
        data: template
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Update template
   */
  async updateTemplate(req, res) {
    try {
      const template = await AudienceTemplate.findByPk(req.params.id);

      if (!template) {
        return res.status(404).json({
          success: false,
          error: 'Template not found'
        });
      }

      await template.update(req.body);

      res.json({
        success: true,
        data: template
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Delete template
   */
  async deleteTemplate(req, res) {
    try {
      const template = await AudienceTemplate.findByPk(req.params.id);

      if (!template) {
        return res.status(404).json({
          success: false,
          error: 'Template not found'
        });
      }

      await template.destroy();

      res.json({
        success: true,
        data: { message: 'Template deleted successfully' }
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
