const { Creative, CreativePerformance } = require('../models');
const { Op } = require('sequelize');

class CreativeAnalyticsService {
  /**
   * Calculate the performance score of a creative.
   * @param {string} creativeId - The ID of the creative.
   * @returns {Promise<number>} - The performance score.
   */
  static async calculatePerformanceScore(creativeId) {
    const performanceData = await CreativePerformance.findAll({
      where: { creativeId },
      attributes: ['impressions', 'clicks', 'conversions']
    });

    if (performanceData.length === 0) {
      return 0;
    }

    const totals = performanceData.reduce((acc, record) => {
      acc.impressions += record.impressions;
      acc.clicks += record.clicks;
      acc.conversions += record.conversions;
      return acc;
    }, { impressions: 0, clicks: 0, conversions: 0 });

    const engagementRate = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
    const conversionRate = totals.clicks > 0 ? (totals.conversions / totals.clicks) * 100 : 0;

    // Weighted score: 40% engagement, 60% conversion
    const score = (engagementRate * 0.4) + (conversionRate * 0.6);

    return score;
  }
  /**
   * Rank creatives by performance score.
   * @returns {Promise<Array<{creative: Creative, score: number}>>} - A ranked list of creatives.
   */
  static async rankCreatives() {
    const creatives = await Creative.findAll({
      where: { status: 'ACTIVE' }
    });

    const rankedCreatives = await Promise.all(
      creatives.map(async (creative) => {
        const score = await this.calculatePerformanceScore(creative.id);
        return { creative, score };
      })
    );

    return rankedCreatives.sort((a, b) => b.score - a.score);
  }

  /**
   * Detect creative fatigue by analyzing performance decay.
   * @param {string} creativeId - The ID of the creative.
   * @returns {Promise<boolean>} - True if fatigue is detected.
   */
  static async detectFatigue(creativeId) {
    const today = new Date();
    const fourteenDaysAgo = new Date(today);
    fourteenDaysAgo.setDate(today.getDate() - 14);

    const performanceData = await CreativePerformance.findAll({
      where: {
        creativeId,
        date: {
          [Op.gte]: fourteenDaysAgo
        }
      },
      order: [['date', 'ASC']]
    });

    if (performanceData.length < 14) {
      return false; // Not enough data
    }

    const firstWeekData = performanceData.slice(0, 7);
    const secondWeekData = performanceData.slice(7, 14);

    const firstWeekScore = this._calculateAverageScore(firstWeekData);
    const secondWeekScore = this._calculateAverageScore(secondWeekData);

    if (firstWeekScore === 0) {
      return false;
    }

    const decay = ((firstWeekScore - secondWeekScore) / firstWeekScore) * 100;
    return decay > 20;
  }
    /**
   * Provide creative rotation recommendations.
   * @returns {Promise<Array<Creative>>} - A list of recommended creatives.
   */
  static async getRotationRecommendations() {
    const fatiguedCreatives = [];
    const activeCreatives = await Creative.findAll({ where: { status: 'ACTIVE' } });

    for (const creative of activeCreatives) {
      const isFatigued = await this.detectFatigue(creative.id);
      if (isFatigued) {
        fatiguedCreatives.push(creative.id);
      }
    }

    const rankedCreatives = await this.rankCreatives();
    const topCreatives = rankedCreatives
      .filter(c => !fatiguedCreatives.includes(c.creative.id))
      .slice(0, 5)
      .map(c => c.creative);

    return topCreatives;
  }

  static _calculateAverageScore(performanceData) {
    if (performanceData.length === 0) {
      return 0;
    }

    const totalScore = performanceData.reduce((acc, record) => {
      const engagementRate = record.impressions > 0 ? (record.clicks / record.impressions) * 100 : 0;
      const conversionRate = record.clicks > 0 ? (record.conversions / record.clicks) * 100 : 0;
      return acc + (engagementRate * 0.4) + (conversionRate * 0.6);
    }, 0);

    return totalScore / performanceData.length;
  }
}

module.exports = CreativeAnalyticsService;
