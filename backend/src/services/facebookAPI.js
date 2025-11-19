const axios = require('axios');
const config = require('../config/config');

class FacebookMarketingAPI {
  constructor() {
    this.baseURL = `https://graph.facebook.com/${config.facebook.apiVersion}`;
    this.accessToken = config.facebook.accessToken;
  }

  async createCampaign(adAccountId, campaignData) {
    try {
      const response = await axios.post(
        `${this.baseURL}/act_${adAccountId}/campaigns`,
        {
          name: campaignData.name,
          objective: campaignData.objective,
          status: campaignData.status || 'PAUSED',
          special_ad_categories: campaignData.specialAdCategories || [],
          daily_budget: campaignData.dailyBudget,
          lifetime_budget: campaignData.lifetimeBudget,
          access_token: this.accessToken
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createAdSet(adAccountId, adSetData) {
    try {
      const response = await axios.post(
        `${this.baseURL}/act_${adAccountId}/adsets`,
        {
          name: adSetData.name,
          campaign_id: adSetData.campaignId,
          status: adSetData.status || 'PAUSED',
          targeting: adSetData.targeting,
          billing_event: adSetData.billingEvent,
          bid_amount: adSetData.bidAmount,
          daily_budget: adSetData.dailyBudget,
          lifetime_budget: adSetData.lifetimeBudget,
          start_time: adSetData.startTime,
          end_time: adSetData.endTime,
          access_token: this.accessToken
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createCreative(adAccountId, creativeData) {
    try {
      const response = await axios.post(
        `${this.baseURL}/act_${adAccountId}/adcreatives`,
        {
          name: creativeData.name,
          object_story_spec: creativeData.objectStorySpec,
          access_token: this.accessToken
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createAd(adAccountId, adData) {
    try {
      const response = await axios.post(
        `${this.baseURL}/act_${adAccountId}/ads`,
        {
          name: adData.name,
          adset_id: adData.adSetId,
          creative: { creative_id: adData.creativeId },
          status: adData.status || 'PAUSED',
          access_token: this.accessToken
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateCampaignStatus(campaignId, status) {
    try {
      const response = await axios.post(
        `${this.baseURL}/${campaignId}`,
        {
          status: status,
          access_token: this.accessToken
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getCampaignInsights(campaignId, datePreset = 'last_7d') {
    try {
      const response = await axios.get(
        `${this.baseURL}/${campaignId}/insights`,
        {
          params: {
            date_preset: datePreset,
            fields: 'impressions,clicks,spend,actions,cost_per_action_type,ctr,cpc,cpm',
            access_token: this.accessToken
          }
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getAdSetInsights(adSetId, datePreset = 'last_7d') {
    try {
      const response = await axios.get(
        `${this.baseURL}/${adSetId}/insights`,
        {
          params: {
            date_preset: datePreset,
            fields: 'impressions,clicks,spend,actions,cost_per_action_type,ctr,cpc,cpm',
            access_token: this.accessToken
          }
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async batchCreate(adAccountId, batchRequests) {
    try {
      const response = await axios.post(
        `${this.baseURL}`,
        {
          batch: batchRequests,
          access_token: this.accessToken
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  handleError(error) {
    if (error.response) {
      const fbError = error.response.data.error;
      return new Error(`Facebook API Error: ${fbError.message} (Code: ${fbError.code})`);
    }
    return error;
  }
}

module.exports = new FacebookMarketingAPI();
