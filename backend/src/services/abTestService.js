const { ABTest, Campaign, AdSet } = require('../models');

class ABTestService {
  async createABTest(testData, adAccountId) {
    try {
      const campaign = await Campaign.findOne({ where: { id: testData.campaignId, adAccountId } });

      if (!campaign) {
        throw new Error('Campaign not found');
      }

      const abTest = await ABTest.create({ ...testData, adAccountId });
      return abTest;
    } catch (error) {
      throw error;
    }
  }

  async getABTestById(id, adAccountId) {
    try {
      const abTest = await ABTest.findOne({
        where: { id, adAccountId },
        include: ['campaign']
      });

      if (!abTest) {
        throw new Error('A/B Test not found');
      }

      return abTest;
    } catch (error) {
      throw error;
    }
  }

  async getAllABTests(adAccountId, filters = {}) {
    try {
      const where = { adAccountId };

      if (filters.campaignId) {
        where.campaignId = filters.campaignId;
      }

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.testType) {
        where.testType = filters.testType;
      }

      const abTests = await ABTest.findAll({
        where,
        include: ['campaign'],
        order: [['createdAt', 'DESC']]
      });

      return abTests;
    } catch (error) {
      throw error;
    }
  }

  async updateABTest(id, adAccountId, updateData) {
    try {
      const abTest = await ABTest.findOne({ where: { id, adAccountId } });

      if (!abTest) {
        throw new Error('A/B Test not found');
      }

      await abTest.update(updateData);
      return abTest;
    } catch (error) {
      throw error;
    }
  }

  async startABTest(id, adAccountId) {
    try {
      const abTest = await ABTest.findOne({ where: { id, adAccountId } });

      if (!abTest) {
        throw new Error('A/B Test not found');
      }

      if (abTest.status !== 'DRAFT') {
        throw new Error('Only draft tests can be started');
      }

      await abTest.update({
        status: 'RUNNING',
        startDate: new Date()
      });

      return abTest;
    } catch (error) {
      throw error;
    }
  }

  async completeABTest(id, adAccountId, results) {
    try {
      const abTest = await ABTest.findOne({ where: { id, adAccountId } });

      if (!abTest) {
        throw new Error('A/B Test not found');
      }

      await abTest.update({
        status: 'COMPLETED',
        endDate: new Date(),
        results: results
      });

      return abTest;
    } catch (error) {
      throw error;
    }
  }

  async analyzeResults(id, adAccountId) {
    try {
      const abTest = await ABTest.findOne({ where: { id, adAccountId } });

      if (!abTest) {
        throw new Error('A/B Test not found');
      }

      // This is a placeholder for actual analytics logic
      // In a real implementation, this would fetch performance data
      // from Facebook API and compare variants
      const analysis = {
        testId: id,
        testType: abTest.testType,
        variants: abTest.variants,
        winner: null,
        metrics: {}
      };

      return analysis;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ABTestService();
