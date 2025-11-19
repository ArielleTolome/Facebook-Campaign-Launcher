const cron = require('node-cron');
const { Op } = require('sequelize');
const { Campaign, CampaignSnapshot } = require('../models');
const { facebook } = require('../config/config');
const bizSdk = require('facebook-nodejs-business-sdk');
const AdAccount = bizSdk.AdAccount;
const Campaign_ = bizSdk.Campaign;

const api = bizSdk.FacebookAdsApi.init(facebook.accessToken);

const fetchFacebookInsights = async (campaign) => {
  try {
    const fields = [
      'impressions',
      'clicks',
      'spend',
    ];
    const params = {
      'date_preset': 'yesterday',
      'level': 'campaign',
    };
    const campaignId = campaign.get('facebookCampaignId');
    const insights = await (new Campaign_(campaignId)).getInsights(fields, params);

    if (insights.length === 0) {
      return { impressions: 0, clicks: 0, spend: 0, revenue: 0 };
    }

    const metrics = insights[0];
    return {
      impressions: parseInt(metrics.impressions, 10),
      clicks: parseInt(metrics.clicks, 10),
      spend: parseFloat(metrics.spend),
      revenue: 0, // Assuming revenue is tracked separately
    };
  } catch (error) {
    console.error(`Error fetching insights for campaign ${campaign.name}:`, error);
    return null;
  }
};

const collectSnapshots = async () => {
  try {
    const campaigns = await Campaign.findAll({ where: { active: true } });
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    for (const campaign of campaigns) {
      const metrics = await fetchFacebookInsights(campaign);
      if (metrics) {
        await CampaignSnapshot.create({
          campaignId: campaign.id,
          date: yesterday,
          ...metrics,
        });
      }
    }
    console.log('Snapshots collected successfully.');
  } catch (error) {
    console.error('Error collecting snapshots:', error);
  }
};

const archiveOldSnapshots = async () => {
  try {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    await CampaignSnapshot.destroy({
      where: {
        date: {
          [Op.lt]: oneYearAgo,
        },
      },
    });
    console.log('Old snapshots archived successfully.');
  } catch (error) {
    console.error('Error archiving old snapshots:', error);
  }
};


// Schedule the job to run daily at midnight
cron.schedule('0 0 * * *', async () => {
  await collectSnapshots();
  await archiveOldSnapshots();
});

module.exports = {
  collectSnapshots,
  archiveOldSnapshots,
};
