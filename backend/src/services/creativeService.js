const { Creative } = require('../models');
const facebookAPI = require('./facebookAPI');

class CreativeService {
  async createCreative(creativeData, adAccountId) {
    try {
      // Create creative in database
      const creative = await Creative.create(creativeData);

      // If adAccountId provided, create in Facebook
      if (adAccountId) {
        const fbResponse = await facebookAPI.createCreative(adAccountId, {
          name: creative.name,
          objectStorySpec: {
            page_id: creativeData.pageId,
            link_data: {
              link: creative.linkUrl,
              message: creative.body,
              name: creative.title,
              call_to_action: {
                type: creative.callToAction || 'LEARN_MORE'
              },
              image_hash: creativeData.imageHash
            }
          }
        });

        // Update creative with Facebook ID
        await creative.update({ fbCreativeId: fbResponse.id });
      }

      return creative;
    } catch (error) {
      throw error;
    }
  }

  async getAllCreatives(filters = {}) {
    try {
      const where = {};

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.format) {
        where.format = filters.format;
      }

      const creatives = await Creative.findAll({
        where,
        order: [['createdAt', 'DESC']]
      });

      return creatives;
    } catch (error) {
      throw error;
    }
  }

  async getCreativeById(id) {
    try {
      const creative = await Creative.findByPk(id, {
        include: ['ads']
      });

      if (!creative) {
        throw new Error('Creative not found');
      }

      return creative;
    } catch (error) {
      throw error;
    }
  }

  async updateCreative(id, updateData) {
    try {
      const creative = await Creative.findByPk(id);

      if (!creative) {
        throw new Error('Creative not found');
      }

      await creative.update(updateData);
      return creative;
    } catch (error) {
      throw error;
    }
  }

  async deleteCreative(id) {
    try {
      const creative = await Creative.findByPk(id);

      if (!creative) {
        throw new Error('Creative not found');
      }

      // Soft delete - mark as archived
      await creative.update({ status: 'ARCHIVED' });

      return { message: 'Creative archived successfully' };
    } catch (error) {
      throw error;
    }
  }

  async bulkCreateCreatives(creativesData, adAccountId) {
    try {
      const results = {
        successful: [],
        failed: []
      };

      for (const creativeData of creativesData) {
        try {
          const creative = await this.createCreative(creativeData, adAccountId);
          results.successful.push(creative);
        } catch (error) {
          results.failed.push({
            data: creativeData,
            error: error.message
          });
        }
      }

      return results;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new CreativeService();
