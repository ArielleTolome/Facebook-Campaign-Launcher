const request = require('supertest');
const app = require('../src/app');

describe('Predictions API', () => {
  it('should return a prediction', async () => {
    const campaign = {
      budget: 100,
      audienceSize: 10000,
      duration: 7,
      creatives: 2,
      placements: 3,
    };
    const response = await request(app).post('/api/predictions').send(campaign);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('ctr');
    expect(response.body).toHaveProperty('cpc');
    expect(response.body).toHaveProperty('conversionRate');
    expect(response.body).toHaveProperty('roas');
    expect(response.body).toHaveProperty('confidence');
    expect(response.body).toHaveProperty('bidRecommendation');
    expect(response.body.bidRecommendation).toHaveProperty('min');
    expect(response.body.bidRecommendation).toHaveProperty('max');
    expect(response.body.bidRecommendation).toHaveProperty('recommended');
  });
});
