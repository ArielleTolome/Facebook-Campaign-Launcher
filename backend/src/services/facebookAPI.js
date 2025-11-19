const axios = require('axios');
const config = require('../config/config');
const ErrorHandlerService = require('./ErrorHandlerService');
const { facebookApiQueue } = require('./queueService');

class FacebookMarketingAPI {
  constructor() {
    this.baseURL = `https://graph.facebook.com/${config.facebook.apiVersion}`;
    this.accessToken = config.facebook.accessToken;
    this.maxRetries = 3;
    this.rateLimitUsage = null;
    this.isRateLimited = false;

    facebookApiQueue.process(this._requestProcessor.bind(this));
  }

  async _executeRequest(axiosConfig) {
    let retries = 0;
    while (retries < this.maxRetries) {
      try {
        const response = await axios(axiosConfig);
        this._updateRateLimitUsage(response.headers);
        return response.data;
      } catch (error) {
        if (this._shouldRetry(error) && retries < this.maxRetries - 1) {
          retries++;
          const delay = (2 ** retries) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          throw error;
        }
      }
    }
  }

  async _requestProcessor(job) {
    const { axiosConfig } = job.data;
    try {
      return await this._executeRequest(axiosConfig);
    } catch (error) {
      if (this._isRateLimitError(error)) {
        console.warn('Queued job hit a rate limit error. Re-throwing to let Bull retry the job.');
      }
      throw error;
    }
  }

  _updateRateLimitUsage(headers) {
    if (headers && headers['x-business-use-case-usage']) {
      this.rateLimitUsage = JSON.parse(headers['x-business-use-case-usage']);
      const usage = this.rateLimitUsage[Object.keys(this.rateLimitUsage)[0]][0];
      if (usage.call_count > 90 && !this.isRateLimited) {
        this.isRateLimited = true;
        console.log('Facebook API rate limit approaching. Switching to queue.');
        setTimeout(() => {
          this.isRateLimited = false;
          console.log('Resuming direct calls after proactive cooldown.');
        }, usage.estimated_time_to_regain_access * 60 * 1000);
      }
    }
  }

  _shouldRetry(error) {
    if (error.code === 'ECONNRESET' || (error.response && error.response.status >= 500)) {
        return true;
    }
    return false;
  }

  _isRateLimitError(error) {
    if (error.response && error.response.data && error.response.data.error) {
      const code = error.response.data.error.code;
      return code === 17 || code === 32 || code === 613 || (code >= 80000 && code <= 80014);
    }
    return false;
  }

  async _request(axiosConfig) {
    if (this.isRateLimited) {
      const job = await facebookApiQueue.add({ axiosConfig });
      return job.finished();
    }

    try {
      return await this._executeRequest(axiosConfig);
    } catch (error) {
      if (this._isRateLimitError(error)) {
        this.isRateLimited = true;
        console.log('Facebook API rate limit reached. Switching to queue.');
        if (error.response.headers && error.response.headers['x-business-use-case-usage']) {
          const usageHeader = JSON.parse(error.response.headers['x-business-use-case-usage']);
          const usage = usageHeader[Object.keys(usageHeader)[0]][0];
          const timeToRegain = usage.estimated_time_to_regain_access; // in minutes
          if (timeToRegain > 0) {
            setTimeout(() => {
              this.isRateLimited = false;
              console.log('Facebook API rate limit window passed. Resuming direct calls.');
            }, timeToRegain * 60 * 1000);
          }
        } else {
          // Fallback: reset after 5 minutes if header is not present
          setTimeout(() => {
            this.isRateLimited = false;
            console.log('Facebook API rate limit window passed (default time). Resuming direct calls.');
          }, 5 * 60 * 1000);
        }
        const job = await facebookApiQueue.add({ axiosConfig });
        return job.finished();
      }
      throw this.handleError(error);
    }
  }

  async createCampaign(adAccountId, campaignData) {
    const axiosConfig = {
      method: 'post',
      url: `${this.baseURL}/act_${adAccountId}/campaigns`,
      data: {
        name: campaignData.name,
        objective: campaignData.objective,
        status: campaignData.status || 'PAUSED',
        special_ad_categories: campaignData.specialAdCategories || [],
        daily_budget: campaignData.dailyBudget,
        lifetime_budget: campaignData.lifetimeBudget,
        access_token: this.accessToken
      }
    };
    return this._request(axiosConfig);
  }

  async createAdSet(adAccountId, adSetData) {
    const axiosConfig = {
        method: 'post',
        url: `${this.baseURL}/act_${adAccountId}/adsets`,
        data: {
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
    };
    return this._request(axiosConfig);
  }

  async createCreative(adAccountId, creativeData) {
    const axiosConfig = {
        method: 'post',
        url: `${this.baseURL}/act_${adAccountId}/adcreatives`,
        data: {
            name: creativeData.name,
            object_story_spec: creativeData.objectStorySpec,
            access_token: this.accessToken
        }
    };
    return this._request(axiosConfig);
  }

  async createAd(adAccountId, adData) {
    const axiosConfig = {
        method: 'post',
        url: `${this.baseURL}/act_${adAccountId}/ads`,
        data: {
            name: adData.name,
            adset_id: adData.adSetId,
            creative: { creative_id: adData.creativeId },
            status: adData.status || 'PAUSED',
            access_token: this.accessToken
        }
    };
    return this._request(axiosConfig);
  }

  async updateCampaignStatus(campaignId, status) {
    const axiosConfig = {
        method: 'post',
        url: `${this.baseURL}/${campaignId}`,
        data: {
            status: status,
            access_token: this.accessToken
        }
    };
    return this._request(axiosConfig);
  }

  async getCampaignInsights(campaignId, datePreset = 'last_7d') {
    const axiosConfig = {
        method: 'get',
        url: `${this.baseURL}/${campaignId}/insights`,
        params: {
            date_preset: datePreset,
            fields: 'impressions,clicks,spend,actions,cost_per_action_type,ctr,cpc,cpm',
            access_token: this.accessToken
        }
    };
    return this._request(axiosConfig);
  }

  async getAdSetInsights(adSetId, datePreset = 'last_7d') {
    const axiosConfig = {
        method: 'get',
        url: `${this.baseURL}/${adSetId}/insights`,
        params: {
            date_preset: datePreset,
            fields: 'impressions,clicks,spend,actions,cost_per_action_type,ctr,cpc,cpm',
            access_token: this.accessToken
        }
    };
    return this._request(axiosConfig);
  }

  async batchCreate(adAccountId, batchRequests) {
    const axiosConfig = {
        method: 'post',
        url: `${this.baseURL}`,
        data: {
            batch: batchRequests,
            access_token: this.accessToken
        }
    };
    return this._request(axiosConfig);
  }

  handleError(error) {
    return ErrorHandlerService.handle(error);
  }
}

module.exports = new FacebookMarketingAPI();
