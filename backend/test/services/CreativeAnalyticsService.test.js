const sinon = require('sinon');
const { Creative, CreativePerformance } = require('../../src/models');
const CreativeAnalyticsService = require('../../src/services/CreativeAnalyticsService');

describe('CreativeAnalyticsService', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('calculatePerformanceScore', () => {
    it('should return the correct performance score', async () => {
      const creativeId = 'test-creative-id';
      const performanceData = [
        { impressions: 1000, clicks: 100, conversions: 10 },
        { impressions: 1500, clicks: 120, conversions: 15 }
      ];

      sinon.stub(CreativePerformance, 'findAll').resolves(performanceData);

      const score = await CreativeAnalyticsService.calculatePerformanceScore(creativeId);

      // ( (220/2500)*100*0.4 ) + ( (25/220)*100*0.6 ) = 3.52 + 6.81 = 10.33
      expect(score).toBeCloseTo(10.34, 2);
    });
  });
  describe('detectFatigue', () => {
    it('should return true if performance drops by more than 20%', async () => {
      const creativeId = 'test-creative-id';
      const performanceData = [];
      // Week 1: high performance
      for (let i = 0; i < 7; i++) {
        performanceData.push({ impressions: 1000, clicks: 100, conversions: 10 });
      }
      // Week 2: low performance
      for (let i = 0; i < 7; i++) {
        performanceData.push({ impressions: 1000, clicks: 40, conversions: 4 });
      }

      sinon.stub(CreativePerformance, 'findAll').resolves(performanceData);

      const isFatigued = await CreativeAnalyticsService.detectFatigue(creativeId);

      expect(isFatigued).toBe(true);
    });
  });
  describe('rankCreatives', () => {
    it('should return a ranked list of creatives', async () => {
      const creatives = [
        { id: 'creative-1', name: 'Creative 1' },
        { id: 'creative-2', name: 'Creative 2' }
      ];
      sinon.stub(Creative, 'findAll').resolves(creatives);
      sinon.stub(CreativeAnalyticsService, 'calculatePerformanceScore')
        .withArgs('creative-1').resolves(10)
        .withArgs('creative-2').resolves(20);

      const rankedCreatives = await CreativeAnalyticsService.rankCreatives();

      expect(rankedCreatives[0].creative.id).toBe('creative-2');
      expect(rankedCreatives[1].creative.id).toBe('creative-1');
    });
  });

  describe('getRotationRecommendations', () => {
    it('should return a list of recommended creatives', async () => {
      const creatives = [
        { id: 'creative-1', name: 'Creative 1' },
        { id: 'creative-2', name: 'Creative 2' },
        { id: 'creative-3', name: 'Creative 3' }
      ];
      sinon.stub(Creative, 'findAll').resolves(creatives);
      sinon.stub(CreativeAnalyticsService, 'detectFatigue')
        .withArgs('creative-1').resolves(true)
        .withArgs('creative-2').resolves(false)
        .withArgs('creative-3').resolves(false);
      sinon.stub(CreativeAnalyticsService, 'rankCreatives').resolves([
        { creative: { id: 'creative-3' }, score: 30 },
        { creative: { id: 'creative-2' }, score: 20 },
        { creative: { id: 'creative-1' }, score: 10 }
      ]);

      const recommendations = await CreativeAnalyticsService.getRotationRecommendations();

      expect(recommendations.length).toBe(2);
      expect(recommendations[0].id).toBe('creative-3');
      expect(recommendations[1].id).toBe('creative-2');
    });
  });
});
