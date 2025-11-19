/**
 * Mock Facebook API Service for Demonstration/Mockup Mode
 *
 * This service provides realistic mock data for all Facebook Marketing API operations
 * without requiring actual Facebook API credentials or making real API calls.
 */

class MockFacebookAPI {
  constructor() {
    // Simulated Facebook ID counters
    this.campaignIdCounter = 1000000;
    this.adSetIdCounter = 2000000;
    this.creativeIdCounter = 3000000;
    this.adIdCounter = 4000000;
  }

  /**
   * Generate random metrics for insights
   */
  generateRandomMetrics() {
    const impressions = Math.floor(Math.random() * 50000) + 10000;
    const clicks = Math.floor(impressions * (Math.random() * 0.05 + 0.01)); // 1-6% CTR
    const spend = (Math.random() * 500 + 100).toFixed(2);

    return {
      impressions,
      clicks,
      spend,
      ctr: ((clicks / impressions) * 100).toFixed(2),
      cpc: (spend / clicks).toFixed(2),
      cpm: ((spend / impressions) * 1000).toFixed(2),
      conversions: Math.floor(clicks * (Math.random() * 0.1 + 0.02)), // 2-12% conversion
      reach: Math.floor(impressions * (Math.random() * 0.3 + 0.6)) // 60-90% of impressions
    };
  }

  /**
   * Create a campaign (mocked)
   */
  async createCampaign(campaignData) {
    // Simulate API delay
    await this.simulateDelay();

    const fbCampaignId = `mock_campaign_${this.campaignIdCounter++}`;

    console.log(`[MOCK] Created campaign: ${campaignData.name} (${fbCampaignId})`);

    return {
      id: fbCampaignId,
      name: campaignData.name,
      objective: campaignData.objective,
      status: campaignData.status || 'PAUSED',
      created_time: new Date().toISOString(),
      updated_time: new Date().toISOString()
    };
  }

  /**
   * Create an ad set (mocked)
   */
  async createAdSet(adSetData) {
    await this.simulateDelay();

    const fbAdSetId = `mock_adset_${this.adSetIdCounter++}`;

    console.log(`[MOCK] Created ad set: ${adSetData.name} (${fbAdSetId})`);

    return {
      id: fbAdSetId,
      name: adSetData.name,
      campaign_id: adSetData.campaign_id,
      status: adSetData.status || 'PAUSED',
      targeting: adSetData.targeting || {},
      billing_event: adSetData.billing_event || 'IMPRESSIONS',
      bid_amount: adSetData.bid_amount || 100,
      daily_budget: adSetData.daily_budget,
      created_time: new Date().toISOString()
    };
  }

  /**
   * Create a creative (mocked)
   */
  async createCreative(creativeData) {
    await this.simulateDelay();

    const fbCreativeId = `mock_creative_${this.creativeIdCounter++}`;

    console.log(`[MOCK] Created creative: ${creativeData.name} (${fbCreativeId})`);

    return {
      id: fbCreativeId,
      name: creativeData.name,
      title: creativeData.title,
      body: creativeData.body,
      image_url: creativeData.image_url,
      link_url: creativeData.link_url,
      call_to_action: creativeData.call_to_action,
      created_time: new Date().toISOString()
    };
  }

  /**
   * Create an ad (mocked)
   */
  async createAd(adData) {
    await this.simulateDelay();

    const fbAdId = `mock_ad_${this.adIdCounter++}`;

    console.log(`[MOCK] Created ad: ${adData.name} (${fbAdId})`);

    return {
      id: fbAdId,
      name: adData.name,
      adset_id: adData.adset_id,
      creative: { id: adData.creative_id },
      status: adData.status || 'PAUSED',
      created_time: new Date().toISOString()
    };
  }

  /**
   * Get campaign insights (mocked)
   */
  async getCampaignInsights(campaignId, dateRange = {}) {
    await this.simulateDelay();

    const metrics = this.generateRandomMetrics();

    console.log(`[MOCK] Fetched insights for campaign: ${campaignId}`);

    return {
      data: [{
        campaign_id: campaignId,
        date_start: dateRange.since || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        date_stop: dateRange.until || new Date().toISOString().split('T')[0],
        ...metrics
      }]
    };
  }

  /**
   * Get ad set insights (mocked)
   */
  async getAdSetInsights(adSetId, dateRange = {}) {
    await this.simulateDelay();

    const metrics = this.generateRandomMetrics();

    console.log(`[MOCK] Fetched insights for ad set: ${adSetId}`);

    return {
      data: [{
        adset_id: adSetId,
        date_start: dateRange.since || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        date_stop: dateRange.until || new Date().toISOString().split('T')[0],
        ...metrics
      }]
    };
  }

  /**
   * Update campaign status (mocked)
   */
  async updateCampaignStatus(campaignId, status) {
    await this.simulateDelay();

    console.log(`[MOCK] Updated campaign ${campaignId} status to: ${status}`);

    return {
      id: campaignId,
      status: status,
      success: true
    };
  }

  /**
   * Update ad set (mocked)
   */
  async updateAdSet(adSetId, updates) {
    await this.simulateDelay();

    console.log(`[MOCK] Updated ad set ${adSetId}:`, updates);

    return {
      id: adSetId,
      ...updates,
      success: true
    };
  }

  /**
   * Delete campaign (mocked)
   */
  async deleteCampaign(campaignId) {
    await this.simulateDelay();

    console.log(`[MOCK] Deleted campaign: ${campaignId}`);

    return {
      success: true
    };
  }

  /**
   * Batch create campaigns (mocked)
   */
  async batchCreateCampaigns(campaigns) {
    console.log(`[MOCK] Batch creating ${campaigns.length} campaigns...`);

    const results = await Promise.all(
      campaigns.map(campaign => this.createCampaign(campaign))
    );

    return results;
  }

  /**
   * Get account insights (mocked)
   */
  async getAccountInsights(accountId, dateRange = {}) {
    await this.simulateDelay();

    const metrics = this.generateRandomMetrics();

    // Multiply by random factor for account-level metrics
    const accountMetrics = {
      impressions: metrics.impressions * (Math.floor(Math.random() * 20) + 10),
      clicks: metrics.clicks * (Math.floor(Math.random() * 20) + 10),
      spend: (parseFloat(metrics.spend) * (Math.floor(Math.random() * 20) + 10)).toFixed(2),
      conversions: metrics.conversions * (Math.floor(Math.random() * 20) + 10),
      reach: metrics.reach * (Math.floor(Math.random() * 20) + 10)
    };

    // Recalculate derived metrics
    accountMetrics.ctr = ((accountMetrics.clicks / accountMetrics.impressions) * 100).toFixed(2);
    accountMetrics.cpc = (accountMetrics.spend / accountMetrics.clicks).toFixed(2);
    accountMetrics.cpm = ((accountMetrics.spend / accountMetrics.impressions) * 1000).toFixed(2);

    console.log(`[MOCK] Fetched account insights for: ${accountId}`);

    return {
      data: [{
        account_id: accountId,
        date_start: dateRange.since || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        date_stop: dateRange.until || new Date().toISOString().split('T')[0],
        ...accountMetrics
      }]
    };
  }

  /**
   * Simulate network delay (50-200ms)
   */
  async simulateDelay() {
    const delay = Math.floor(Math.random() * 150) + 50;
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Validate ad account (mocked - always succeeds)
   */
  async validateAdAccount(accountId) {
    await this.simulateDelay();

    console.log(`[MOCK] Validated ad account: ${accountId}`);

    return {
      id: accountId,
      name: 'Mock Ad Account',
      account_status: 1, // Active
      currency: 'USD',
      timezone_name: 'America/New_York',
      is_valid: true
    };
  }

  /**
   * Get available targeting options (mocked)
   */
  async getTargetingOptions(type = 'interests') {
    await this.simulateDelay();

    const mockOptions = {
      interests: [
        { id: '6003139266461', name: 'Technology' },
        { id: '6004115167424', name: 'Fashion' },
        { id: '6003348604581', name: 'Food & Dining' },
        { id: '6003020834693', name: 'Sports' },
        { id: '6003195797498', name: 'Travel' }
      ],
      locations: [
        { key: 'US', name: 'United States', type: 'country' },
        { key: 'GB', name: 'United Kingdom', type: 'country' },
        { key: 'CA', name: 'Canada', type: 'country' },
        { key: 'AU', name: 'Australia', type: 'country' }
      ],
      age_ranges: [
        { min: 18, max: 24 },
        { min: 25, max: 34 },
        { min: 35, max: 44 },
        { min: 45, max: 54 },
        { min: 55, max: 64 },
        { min: 65, max: null }
      ]
    };

    return mockOptions[type] || [];
  }
}

module.exports = new MockFacebookAPI();
