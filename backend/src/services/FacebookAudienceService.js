const axios = require('axios');
const config = require('../config/config');
const crypto = require('crypto');

class FacebookAudienceService {
  constructor() {
    this.baseURL = `https://graph.facebook.com/${config.facebook.apiVersion}`;
    this.accessToken = config.facebook.accessToken;
  }

  /**
   * Create a custom audience
   * @param {string} adAccountId - Facebook Ad Account ID
   * @param {object} audienceData - Audience configuration
   * @returns {Promise<object>} Facebook API response
   */
  async createCustomAudience(adAccountId, audienceData) {
    try {
      const response = await axios.post(
        `${this.baseURL}/act_${adAccountId}/customaudiences`,
        {
          name: audienceData.name,
          description: audienceData.description,
          subtype: audienceData.subtype || 'CUSTOM', // CUSTOM, WEBSITE, APP, OFFLINE_CONVERSION, etc.
          customer_file_source: audienceData.customerFileSource || 'USER_PROVIDED_ONLY',
          access_token: this.accessToken
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Add users to a custom audience
   * @param {string} customAudienceId - Facebook Custom Audience ID
   * @param {array} users - Array of user data (emails, phone numbers, etc.)
   * @param {string} schema - Data schema (EMAIL, PHONE, etc.)
   * @returns {Promise<object>} Facebook API response
   */
  async addUsersToCustomAudience(customAudienceId, users, schema = ['EMAIL']) {
    try {
      // Hash the user data according to Facebook requirements
      const hashedUsers = users.map(user => {
        if (typeof user === 'string') {
          return this.hashData(user.toLowerCase().trim());
        }
        // If user is an object with multiple fields
        return Object.keys(user).map(key =>
          this.hashData(user[key].toLowerCase().trim())
        );
      });

      const response = await axios.post(
        `${this.baseURL}/${customAudienceId}/users`,
        {
          payload: {
            schema: schema,
            data: hashedUsers
          },
          access_token: this.accessToken
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Remove users from a custom audience
   * @param {string} customAudienceId - Facebook Custom Audience ID
   * @param {array} users - Array of user data to remove
   * @param {string} schema - Data schema
   * @returns {Promise<object>} Facebook API response
   */
  async removeUsersFromCustomAudience(customAudienceId, users, schema = ['EMAIL']) {
    try {
      const hashedUsers = users.map(user => {
        if (typeof user === 'string') {
          return this.hashData(user.toLowerCase().trim());
        }
        return Object.keys(user).map(key =>
          this.hashData(user[key].toLowerCase().trim())
        );
      });

      const response = await axios.delete(
        `${this.baseURL}/${customAudienceId}/users`,
        {
          data: {
            payload: {
              schema: schema,
              data: hashedUsers
            },
            access_token: this.accessToken
          }
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create a lookalike audience
   * @param {string} adAccountId - Facebook Ad Account ID
   * @param {object} lookalikData - Lookalike configuration
   * @returns {Promise<object>} Facebook API response
   */
  async createLookalikeAudience(adAccountId, lookalikData) {
    try {
      const response = await axios.post(
        `${this.baseURL}/act_${adAccountId}/customaudiences`,
        {
          name: lookalikData.name,
          subtype: 'LOOKALIKE',
          lookalike_spec: {
            origin: {
              id: lookalikData.originAudienceId
            },
            ratio: lookalikData.ratio || 0.01, // 1% to 10%, default 1%
            country: lookalikData.country,
            starting_ratio: lookalikData.startingRatio || 0,
            location_spec: lookalikData.locationSpec
          },
          origin_audience_id: lookalikData.originAudienceId,
          access_token: this.accessToken
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get audience reach estimate
   * @param {string} adAccountId - Facebook Ad Account ID
   * @param {object} targeting - Targeting specification
   * @returns {Promise<object>} Reach estimate data
   */
  async getReachEstimate(adAccountId, targeting) {
    try {
      const response = await axios.get(
        `${this.baseURL}/act_${adAccountId}/reachestimate`,
        {
          params: {
            targeting_spec: JSON.stringify(targeting),
            access_token: this.accessToken
          }
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get detailed audience insights
   * @param {string} customAudienceId - Facebook Custom Audience ID
   * @returns {Promise<object>} Audience details
   */
  async getAudienceDetails(customAudienceId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/${customAudienceId}`,
        {
          params: {
            fields: 'id,name,description,approximate_count,subtype,time_created,time_updated,delivery_status,operation_status',
            access_token: this.accessToken
          }
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update custom audience
   * @param {string} customAudienceId - Facebook Custom Audience ID
   * @param {object} updateData - Data to update
   * @returns {Promise<object>} Facebook API response
   */
  async updateCustomAudience(customAudienceId, updateData) {
    try {
      const response = await axios.post(
        `${this.baseURL}/${customAudienceId}`,
        {
          name: updateData.name,
          description: updateData.description,
          access_token: this.accessToken
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete custom audience
   * @param {string} customAudienceId - Facebook Custom Audience ID
   * @returns {Promise<object>} Facebook API response
   */
  async deleteCustomAudience(customAudienceId) {
    try {
      const response = await axios.delete(
        `${this.baseURL}/${customAudienceId}`,
        {
          params: {
            access_token: this.accessToken
          }
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get targeting search suggestions
   * @param {string} adAccountId - Facebook Ad Account ID
   * @param {string} type - Type of targeting (interests, behaviors, etc.)
   * @param {string} query - Search query
   * @returns {Promise<object>} Targeting suggestions
   */
  async getTargetingSearch(adAccountId, type, query) {
    try {
      const response = await axios.get(
        `${this.baseURL}/search`,
        {
          params: {
            type: 'adTargetingCategory',
            class: type, // interests, behaviors, demographics, etc.
            q: query,
            access_token: this.accessToken
          }
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Validate targeting spec
   * @param {string} adAccountId - Facebook Ad Account ID
   * @param {object} targeting - Targeting specification to validate
   * @returns {Promise<object>} Validation result
   */
  async validateTargeting(adAccountId, targeting) {
    try {
      const response = await axios.get(
        `${this.baseURL}/act_${adAccountId}/targetingvalidation`,
        {
          params: {
            targeting_spec: JSON.stringify(targeting),
            access_token: this.accessToken
          }
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Hash data according to Facebook requirements (SHA-256)
   * @param {string} data - Data to hash
   * @returns {string} Hashed data
   */
  hashData(data) {
    return crypto
      .createHash('sha256')
      .update(data)
      .digest('hex');
  }

  /**
   * Parse CSV data for custom audience upload
   * @param {string} csvData - CSV file content
   * @param {string} schema - Data schema
   * @returns {array} Parsed user data
   */
  parseCSVData(csvData, schema = 'EMAIL') {
    const lines = csvData.trim().split('\n');
    const users = [];

    // Skip header if present
    const startIndex = lines[0].toLowerCase().includes('email') ||
                       lines[0].toLowerCase().includes('phone') ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line) {
        // Simple CSV parsing (for complex CSV, use a proper library)
        const values = line.split(',').map(v => v.trim());
        if (values.length > 0 && values[0]) {
          users.push(values[0]);
        }
      }
    }

    return users;
  }

  /**
   * Handle Facebook API errors
   * @param {Error} error - Error object
   * @returns {Error} Formatted error
   */
  handleError(error) {
    if (error.response) {
      const fbError = error.response.data.error;
      return new Error(
        `Facebook API Error: ${fbError.message} (Code: ${fbError.code}, Type: ${fbError.type || 'Unknown'})`
      );
    }
    return error;
  }
}

module.exports = new FacebookAudienceService();
