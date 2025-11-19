const { Audience, AudienceTemplate } = require('../models');
const facebookAudienceService = require('./FacebookAudienceService');

class AudienceService {
  /**
   * Create a new audience
   * @param {object} audienceData - Audience configuration
   * @param {string} adAccountId - Facebook Ad Account ID (optional)
   * @returns {Promise<object>} Created audience
   */
  async createAudience(audienceData, adAccountId) {
    try {
      // Create audience in database
      const audience = await Audience.create(audienceData);

      // If custom audience and adAccountId provided, create in Facebook
      if (audienceData.type === 'CUSTOM' && adAccountId) {
        const fbResponse = await facebookAudienceService.createCustomAudience(adAccountId, {
          name: audience.name,
          description: audience.description,
          subtype: audienceData.customAudienceSpec?.subtype || 'CUSTOM',
          customerFileSource: audienceData.customAudienceSpec?.customerFileSource
        });

        // Update audience with Facebook ID
        await audience.update({ fbAudienceId: fbResponse.id });
      }

      // If lookalike audience and adAccountId provided, create in Facebook
      if (audienceData.type === 'LOOKALIKE' && adAccountId && audienceData.lookalikSpec) {
        const fbResponse = await facebookAudienceService.createLookalikeAudience(adAccountId, {
          name: audience.name,
          originAudienceId: audienceData.lookalikSpec.originAudienceId,
          ratio: audienceData.lookalikSpec.ratio,
          country: audienceData.lookalikSpec.country,
          startingRatio: audienceData.lookalikSpec.startingRatio,
          locationSpec: audienceData.lookalikSpec.locationSpec
        });

        await audience.update({ fbAudienceId: fbResponse.id });
      }

      return audience;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all audiences with optional filters
   * @param {object} filters - Filter options
   * @returns {Promise<array>} List of audiences
   */
  async getAllAudiences(filters = {}) {
    try {
      const where = {};

      if (filters.type) {
        where.type = filters.type;
      }

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.tags && filters.tags.length > 0) {
        where.tags = {
          [require('sequelize').Op.overlap]: filters.tags
        };
      }

      const audiences = await Audience.findAll({
        where,
        include: [
          {
            association: 'template',
            required: false
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      return audiences;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get audience by ID
   * @param {string} id - Audience ID
   * @returns {Promise<object>} Audience details
   */
  async getAudienceById(id) {
    try {
      const audience = await Audience.findByPk(id, {
        include: [
          {
            association: 'template',
            required: false
          }
        ]
      });

      if (!audience) {
        throw new Error('Audience not found');
      }

      // If audience exists in Facebook, fetch updated details
      if (audience.fbAudienceId) {
        try {
          const fbDetails = await facebookAudienceService.getAudienceDetails(audience.fbAudienceId);

          // Update estimated size if available
          if (fbDetails.approximate_count) {
            await audience.update({ estimatedSize: fbDetails.approximate_count });
          }
        } catch (fbError) {
          // If Facebook fetch fails, continue with database data
          console.error('Error fetching Facebook audience details:', fbError.message);
        }
      }

      return audience;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update audience
   * @param {string} id - Audience ID
   * @param {object} updateData - Data to update
   * @returns {Promise<object>} Updated audience
   */
  async updateAudience(id, updateData) {
    try {
      const audience = await Audience.findByPk(id);

      if (!audience) {
        throw new Error('Audience not found');
      }

      // Update in database
      await audience.update(updateData);

      // If name or description changed and exists in Facebook, update there too
      if (audience.fbAudienceId && (updateData.name || updateData.description)) {
        try {
          await facebookAudienceService.updateCustomAudience(audience.fbAudienceId, {
            name: updateData.name || audience.name,
            description: updateData.description || audience.description
          });
        } catch (fbError) {
          console.error('Error updating Facebook audience:', fbError.message);
        }
      }

      return audience;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete audience (soft delete)
   * @param {string} id - Audience ID
   * @returns {Promise<object>} Result message
   */
  async deleteAudience(id) {
    try {
      const audience = await Audience.findByPk(id);

      if (!audience) {
        throw new Error('Audience not found');
      }

      // Soft delete - mark as deleted
      await audience.update({ status: 'DELETED' });

      // Optionally delete from Facebook
      // Note: Commented out to prevent accidental deletion
      // if (audience.fbAudienceId) {
      //   await facebookAudienceService.deleteCustomAudience(audience.fbAudienceId);
      // }

      return { message: 'Audience deleted successfully' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Add users to custom audience from CSV
   * @param {string} id - Audience ID
   * @param {string} csvData - CSV file content
   * @param {string} schema - Data schema
   * @returns {Promise<object>} Upload result
   */
  async uploadUsersToAudience(id, csvData, schema = ['EMAIL']) {
    try {
      const audience = await Audience.findByPk(id);

      if (!audience) {
        throw new Error('Audience not found');
      }

      if (audience.type !== 'CUSTOM') {
        throw new Error('Can only upload users to custom audiences');
      }

      if (!audience.fbAudienceId) {
        throw new Error('Audience not synced with Facebook');
      }

      // Parse CSV data
      const users = facebookAudienceService.parseCSVData(csvData, schema);

      if (users.length === 0) {
        throw new Error('No valid users found in CSV');
      }

      // Upload to Facebook in batches (Facebook recommends max 10,000 per batch)
      const batchSize = 10000;
      const results = [];

      for (let i = 0; i < users.length; i += batchSize) {
        const batch = users.slice(i, i + batchSize);
        const result = await facebookAudienceService.addUsersToCustomAudience(
          audience.fbAudienceId,
          batch,
          schema
        );
        results.push(result);
      }

      // Update metadata with upload info
      await audience.update({
        metadata: {
          ...audience.metadata,
          lastUpload: new Date(),
          uploadedUsers: users.length
        }
      });

      return {
        message: 'Users uploaded successfully',
        totalUsers: users.length,
        batches: results.length,
        details: results
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get audience reach estimate
   * @param {object} targeting - Targeting specification
   * @param {string} adAccountId - Facebook Ad Account ID
   * @returns {Promise<object>} Reach estimate
   */
  async getAudienceEstimate(targeting, adAccountId) {
    try {
      if (!adAccountId) {
        throw new Error('Ad Account ID is required for reach estimation');
      }

      const estimate = await facebookAudienceService.getReachEstimate(adAccountId, targeting);

      return {
        estimatedReach: estimate.data?.users || 0,
        estimatedDailyReach: estimate.data?.estimate_dau || 0,
        estimatedMonthlyReach: estimate.data?.estimate_mau || 0,
        estimatedReachRange: {
          min: estimate.data?.users_lower_bound || 0,
          max: estimate.data?.users_upper_bound || 0
        },
        currency: estimate.data?.currency || 'USD',
        bidEstimates: estimate.data?.bid_estimations || []
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create audience from template
   * @param {string} templateId - Template ID
   * @param {object} customData - Custom data to override template
   * @param {string} adAccountId - Facebook Ad Account ID (optional)
   * @returns {Promise<object>} Created audience
   */
  async createFromTemplate(templateId, customData, adAccountId) {
    try {
      const template = await AudienceTemplate.findByPk(templateId);

      if (!template) {
        throw new Error('Template not found');
      }

      // Merge template data with custom data
      const audienceData = {
        name: customData.name || template.name,
        description: customData.description || template.description,
        type: customData.type || template.type,
        targeting: {
          ...template.targeting,
          ...customData.targeting
        },
        customAudienceSpec: customData.customAudienceSpec || template.customAudienceSpec,
        lookalikSpec: customData.lookalikSpec || template.lookalikSpec,
        templateId: templateId,
        tags: [...(template.tags || []), ...(customData.tags || [])],
        metadata: {
          ...template.metadata,
          ...customData.metadata,
          createdFromTemplate: templateId
        }
      };

      // Increment template usage count
      await template.update({ usageCount: template.usageCount + 1 });

      return await this.createAudience(audienceData, adAccountId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get targeting search suggestions
   * @param {string} adAccountId - Facebook Ad Account ID
   * @param {string} type - Type of targeting
   * @param {string} query - Search query
   * @returns {Promise<object>} Targeting suggestions
   */
  async getTargetingSuggestions(adAccountId, type, query) {
    try {
      return await facebookAudienceService.getTargetingSearch(adAccountId, type, query);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Validate targeting specification
   * @param {string} adAccountId - Facebook Ad Account ID
   * @param {object} targeting - Targeting spec to validate
   * @returns {Promise<object>} Validation result
   */
  async validateTargeting(adAccountId, targeting) {
    try {
      return await facebookAudienceService.validateTargeting(adAccountId, targeting);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new AudienceService();
