const { CampaignSnapshot } = require('../models');
const { Op } = require('sequelize');

const calculateTrend = async (campaignId, days) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Current Period: yesterday back for `days` days.
  const endDate = new Date(today);
  endDate.setDate(today.getDate() - 1);
  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - (days - 1));

  // Previous Period: the `days` days before the current period.
  const previousEndDate = new Date(startDate);
  previousEndDate.setDate(startDate.getDate() - 1);
  const previousStartDate = new Date(previousEndDate);
  previousStartDate.setDate(previousEndDate.getDate() - (days - 1));

  const currentPeriodSnapshots = await CampaignSnapshot.findAll({
    where: {
      campaignId,
      date: {
        [Op.between]: [startDate, endDate],
      },
    },
  });

  const previousPeriodSnapshots = await CampaignSnapshot.findAll({
    where: {
      campaignId,
      date: {
        [Op.between]: [previousStartDate, previousEndDate],
      },
    },
  });

  const calculateAverage = (snapshots, metric) => {
    if (snapshots.length === 0) return 0;
    const total = snapshots.reduce((acc, snapshot) => acc + snapshot[metric], 0);
    return total / snapshots.length;
  };

  const metrics = ['impressions', 'clicks', 'spend', 'revenue'];
  const trends = {};

  metrics.forEach(metric => {
    const currentAverage = calculateAverage(currentPeriodSnapshots, metric);
    const previousAverage = calculateAverage(previousPeriodSnapshots, metric);
    const percentageChange = previousAverage === 0 ? 100 : ((currentAverage - previousAverage) / previousAverage) * 100;
    trends[metric] = {
      current: currentAverage,
      previous: previousAverage,
      change: percentageChange,
      arrow: percentageChange > 0 ? '↑' : (percentageChange < 0 ? '↓' : '→'),
    };
  });

  return trends;
};

const getCampaignTrends = async (campaignId) => {
  return {
    '7day': await calculateTrend(campaignId, 7),
    '30day': await calculateTrend(campaignId, 30),
    '90day': await calculateTrend(campaignId, 90),
  };
};

module.exports = {
  getCampaignTrends,
};
