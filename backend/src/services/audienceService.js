const { Audience } = require('../models');
const facebookAPI = require('./facebookAPI');

class AudienceService {
  async createAudience(audienceData, adAccountId) {
    try {
      // Create audience in database
      const audience = await Audience.create(audienceData);

      // If adAccountId provided, create custom audience in Facebook
      if (adAccountId && audienceData.audienceType === 'CUSTOM') {
        const fbResponse = await facebookAPI.createCustomAudience(adAccountId, {
          name: audience.name,
          description: audience.description,
          targeting: audience.targeting
        });

        // Update audience with Facebook ID
        await audience.update({ fbAudienceId: fbResponse.id });
      }

      return audience;
    } catch (error) {
      throw error;
    }
  }

  async getAllAudiences(filters = {}) {
    try {
      const where = {};

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.audienceType) {
        where.audienceType = filters.audienceType;
      }

      const audiences = await Audience.findAll({
        where,
        order: [['createdAt', 'DESC']]
      });

      return audiences;
    } catch (error) {
      throw error;
    }
  }

  async getAudienceById(id) {
    try {
      const audience = await Audience.findByPk(id);

      if (!audience) {
        throw new Error('Audience not found');
      }

      return audience;
    } catch (error) {
      throw error;
    }
  }

  async updateAudience(id, updateData) {
    try {
      const audience = await Audience.findByPk(id);

      if (!audience) {
        throw new Error('Audience not found');
      }

      await audience.update(updateData);
      return audience;
    } catch (error) {
      throw error;
    }
  }

  async deleteAudience(id) {
    try {
      const audience = await Audience.findByPk(id);

      if (!audience) {
        throw new Error('Audience not found');
      }

      // Soft delete - mark as archived
      await audience.update({ status: 'ARCHIVED' });

      return { message: 'Audience archived successfully' };
    } catch (error) {
      throw error;
    }
  }

  async bulkCreateAudiences(audiencesData, adAccountId) {
    try {
      const results = {
        successful: [],
        failed: []
      };

      for (const audienceData of audiencesData) {
        try {
          const audience = await this.createAudience(audienceData, adAccountId);
          results.successful.push(audience);
        } catch (error) {
          results.failed.push({
            data: audienceData,
            error: error.message
          });
        }
      }

      return results;
    } catch (error) {
      throw error;
    }
  }

  async estimateAudienceSize(targeting, adAccountId) {
    try {
      // Call Facebook API to estimate audience size
      if (adAccountId) {
        const estimate = await facebookAPI.estimateAudienceSize(adAccountId, targeting);
        return estimate;
      }

      // Return mock estimate if no ad account
      return {
        estimatedSize: {
          min: 100000,
          max: 500000
        }
      };
    } catch (error) {
      throw error;
    }
  }

  async analyzeAudienceOverlap(audienceIds) {
    try {
      // Get all audiences
      const audiences = await Audience.findAll({
        where: {
          id: audienceIds
        }
      });

      if (audiences.length < 2) {
        throw new Error('At least 2 audiences required for overlap analysis');
      }

      // Calculate overlap based on targeting criteria
      const overlapData = this.calculateOverlap(audiences);

      return overlapData;
    } catch (error) {
      throw error;
    }
  }

  calculateOverlap(audiences) {
    // Simple overlap calculation based on common targeting criteria
    const overlapMap = {};

    for (let i = 0; i < audiences.length; i++) {
      for (let j = i + 1; j < audiences.length; j++) {
        const key = `${audiences[i].id}-${audiences[j].id}`;
        const overlap = this.compareTargeting(
          audiences[i].targeting,
          audiences[j].targeting
        );
        overlapMap[key] = overlap;
      }
    }

    return {
      audiences: audiences.map(a => ({
        id: a.id,
        name: a.name,
        size: a.size
      })),
      overlaps: overlapMap
    };
  }

  compareTargeting(targeting1, targeting2) {
    let overlapScore = 0;
    let totalCriteria = 0;

    // Compare age ranges
    if (targeting1.age && targeting2.age) {
      const ageOverlap = this.calculateRangeOverlap(
        targeting1.age,
        targeting2.age
      );
      overlapScore += ageOverlap;
      totalCriteria++;
    }

    // Compare genders
    if (targeting1.gender && targeting2.gender) {
      if (targeting1.gender === targeting2.gender) {
        overlapScore += 1;
      }
      totalCriteria++;
    }

    // Compare locations
    if (targeting1.locations && targeting2.locations) {
      const locationOverlap = this.calculateArrayOverlap(
        targeting1.locations,
        targeting2.locations
      );
      overlapScore += locationOverlap;
      totalCriteria++;
    }

    // Compare interests
    if (targeting1.interests && targeting2.interests) {
      const interestOverlap = this.calculateArrayOverlap(
        targeting1.interests,
        targeting2.interests
      );
      overlapScore += interestOverlap;
      totalCriteria++;
    }

    return totalCriteria > 0 ? overlapScore / totalCriteria : 0;
  }

  calculateRangeOverlap(range1, range2) {
    const min1 = range1.min || 18;
    const max1 = range1.max || 65;
    const min2 = range2.min || 18;
    const max2 = range2.max || 65;

    const overlapMin = Math.max(min1, min2);
    const overlapMax = Math.min(max1, max2);

    if (overlapMin > overlapMax) return 0;

    const overlap = overlapMax - overlapMin;
    const total = Math.max(max1, max2) - Math.min(min1, min2);

    return overlap / total;
  }

  calculateArrayOverlap(arr1, arr2) {
    if (!arr1 || !arr2 || arr1.length === 0 || arr2.length === 0) return 0;

    const set1 = new Set(arr1.map(item => typeof item === 'object' ? item.id : item));
    const set2 = new Set(arr2.map(item => typeof item === 'object' ? item.id : item));

    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    return intersection.size / union.size;
  }
}

module.exports = new AudienceService();
