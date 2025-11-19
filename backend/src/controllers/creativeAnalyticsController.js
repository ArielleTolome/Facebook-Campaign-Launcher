const CreativeAnalyticsService = require('../services/CreativeAnalyticsService');

class CreativeAnalyticsController {
  /**
   * Get ranked creatives.
   */
  static async getRankedCreatives(req, res, next) {
    try {
      const rankedCreatives = await CreativeAnalyticsService.rankCreatives();
      res.json(rankedCreatives);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Detect fatigue for a creative.
   */
  static async detectCreativeFatigue(req, res, next) {
    try {
      const { creativeId } = req.params;
      const isFatigued = await CreativeAnalyticsService.detectFatigue(creativeId);
      res.json({ isFatigued });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get creative rotation recommendations.
   */
  static async getRotationRecommendations(req, res, next) {
    try {
      const recommendations = await CreativeAnalyticsService.getRotationRecommendations();
      res.json(recommendations);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CreativeAnalyticsController;
