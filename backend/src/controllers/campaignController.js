const campaignService = require('../services/campaignService');

class CampaignController {
  async createCampaign(req, res) {
    try {
      const { adAccountId } = req.query;
      const campaign = await campaignService.createCampaign(req.body, adAccountId, req.user.id);
      res.status(201).json({
        success: true,
        data: campaign
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async bulkCreateCampaigns(req, res) {
    try {
      const { adAccountId } = req.query;
      const { campaigns } = req.body;

      if (!Array.isArray(campaigns)) {
        return res.status(400).json({
          success: false,
          error: 'campaigns must be an array'
        });
      }

      const results = await campaignService.bulkCreateCampaigns(campaigns, adAccountId);
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

  async getCampaigns(req, res) {
    try {
      const campaigns = await campaignService.getAllCampaigns(req.query);
      res.json({
        success: true,
        data: campaigns
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async getCampaignById(req, res) {
    try {
      const campaign = await campaignService.getCampaignById(req.params.id);
      res.json({
        success: true,
        data: campaign
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        error: error.message
      });
    }
  }

  async updateCampaign(req, res) {
    try {
      const campaign = await campaignService.updateCampaign(req.params.id, req.body, req.user);
      res.json({
        success: true,
        data: campaign
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async deleteCampaign(req, res) {
    try {
      const result = await campaignService.deleteCampaign(req.params.id, req.user);
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

  async createFromTemplate(req, res) {
    try {
      const { templateId } = req.params;
      const { adAccountId } = req.query;
      const campaign = await campaignService.createFromTemplate(
        templateId,
        req.body,
        adAccountId
      );
      res.status(201).json({
        success: true,
        data: campaign
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async getCampaignInsights(req, res) {
    try {
      const insights = await campaignService.getCampaignInsights(req.params.id);
      res.json({
        success: true,
        data: insights
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new CampaignController();
