const { Campaign, AdSet, Ad, Creative } = require('../models');
const facebookAPI = require('./facebookAPI');

class CampaignService {
  async createCampaign(campaignData, adAccountId) {
    try {
      // Create campaign in database
      const campaign = await Campaign.create(campaignData);

      // If not a template and adAccountId provided, create in Facebook
      if (!campaignData.isTemplate && adAccountId) {
        const fbResponse = await facebookAPI.createCampaign(adAccountId, {
          name: campaign.name,
          objective: campaign.objective,
          status: campaign.status,
          dailyBudget: campaign.dailyBudget,
          lifetimeBudget: campaign.lifetimeBudget
        });

        // Update campaign with Facebook ID
        await campaign.update({ fbCampaignId: fbResponse.id });
      }

      return campaign;
    } catch (error) {
      throw error;
    }
  }

  async bulkCreateCampaigns(campaignsData, adAccountId) {
    try {
      const results = {
        successful: [],
        failed: []
      };

      for (const campaignData of campaignsData) {
        try {
          const campaign = await this.createCampaign(campaignData, adAccountId);
          results.successful.push(campaign);
        } catch (error) {
          results.failed.push({
            data: campaignData,
            error: error.message
          });
        }
      }

      return results;
    } catch (error) {
      throw error;
    }
  }

  async getCampaignById(id) {
    try {
      const campaign = await Campaign.findByPk(id, {
        include: [
          {
            association: 'adSets',
            include: [
              {
                association: 'ads',
                include: ['creative']
              }
            ]
          },
          'abTests'
        ]
      });

      if (!campaign) {
        throw new Error('Campaign not found');
      }

      return campaign;
    } catch (error) {
      throw error;
    }
  }

  async getAllCampaigns(filters = {}) {
    try {
      const where = {};

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.isTemplate !== undefined) {
        where.isTemplate = filters.isTemplate;
      }

      const campaigns = await Campaign.findAll({
        where,
        include: ['adSets', 'abTests'],
        order: [['createdAt', 'DESC']]
      });

      return campaigns;
    } catch (error) {
      throw error;
    }
  }

  async updateCampaign(id, updateData) {
    try {
      const campaign = await Campaign.findByPk(id);

      if (!campaign) {
        throw new Error('Campaign not found');
      }

      // Update in database
      await campaign.update(updateData);

      // If status changed and campaign exists in Facebook, update there too
      if (updateData.status && campaign.fbCampaignId) {
        await facebookAPI.updateCampaignStatus(campaign.fbCampaignId, updateData.status);
      }

      return campaign;
    } catch (error) {
      throw error;
    }
  }

  async deleteCampaign(id) {
    try {
      const campaign = await Campaign.findByPk(id);

      if (!campaign) {
        throw new Error('Campaign not found');
      }

      // Soft delete - mark as deleted
      await campaign.update({ status: 'DELETED' });

      if (campaign.fbCampaignId) {
        await facebookAPI.updateCampaignStatus(campaign.fbCampaignId, 'DELETED');
      }

      return { message: 'Campaign deleted successfully' };
    } catch (error) {
      throw error;
    }
  }

  async createFromTemplate(templateId, customData, adAccountId) {
    try {
      const template = await Campaign.findByPk(templateId);

      if (!template || !template.isTemplate) {
        throw new Error('Template not found');
      }

      const campaignData = {
        name: customData.name || template.name,
        objective: customData.objective || template.objective,
        dailyBudget: customData.dailyBudget || template.dailyBudget,
        lifetimeBudget: customData.lifetimeBudget || template.lifetimeBudget,
        startTime: customData.startTime,
        endTime: customData.endTime,
        templateId: templateId,
        metadata: { ...template.metadata, ...customData.metadata }
      };

      return await this.createCampaign(campaignData, adAccountId);
    } catch (error) {
      throw error;
    }
  }

  async getCampaignInsights(id) {
    try {
      const campaign = await Campaign.findByPk(id);

      if (!campaign || !campaign.fbCampaignId) {
        throw new Error('Campaign not found or not synced with Facebook');
      }

      const insights = await facebookAPI.getCampaignInsights(campaign.fbCampaignId);
      return insights;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new CampaignService();
