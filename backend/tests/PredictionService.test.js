const PredictionService = require('../src/services/PredictionService');

describe('PredictionService', () => {
  it('should return a prediction with bid recommendation', async () => {
    const campaign = {
      budget: 100,
      audienceSize: 10000,
      duration: 7,
      creatives: 2,
      placements: 3,
    };
    const prediction = await PredictionService.predict(campaign);
    expect(prediction).toHaveProperty('ctr');
    expect(prediction).toHaveProperty('cpc');
    expect(prediction).toHaveProperty('conversionRate');
    expect(prediction).toHaveProperty('roas');
    expect(prediction).toHaveProperty('confidence');
    expect(prediction).toHaveProperty('bidRecommendation');
    expect(prediction.bidRecommendation).toHaveProperty('min');
    expect(prediction.bidRecommendation).toHaveProperty('max');
    expect(prediction.bidRecommendation).toHaveProperty('recommended');
  });

  it('should return a confidence of 1 when all fields are provided', async () => {
    const campaign = {
      budget: 100,
      audienceSize: 10000,
      duration: 7,
      creatives: 2,
      placements: 3,
    };
    const prediction = await PredictionService.predict(campaign);
    expect(prediction.confidence).toBe(1);
  });

  it('should return a confidence of 0.5 when half the fields are provided', async () => {
    const campaign = {
      budget: 100,
      audienceSize: 10000,
    };
    const prediction = await PredictionService.predict(campaign);
    expect(prediction.confidence).toBe(0.4);
  });
});
