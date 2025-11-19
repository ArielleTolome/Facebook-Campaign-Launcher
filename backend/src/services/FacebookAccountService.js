const axios = require('axios');
const { AdAccount } = require('../models');

const FACEBOOK_GRAPH_API_URL = 'https://graph.facebook.com/v12.0';

class FacebookAccountService {
  /**
   * Fetches ad accounts from the Facebook Graph API for a given user.
   * @param {string} userAccessToken - The user's Facebook access token.
   * @returns {Promise<Array>} - A promise that resolves to an array of ad accounts.
   */
  static async fetchAdAccounts(userAccessToken) {
    try {
      const response = await axios.get(`${FACEBOOK_GRAPH_API_URL}/me/adaccounts`, {
        params: {
          fields: 'account_id,name,account_status',
          access_token: userAccessToken,
        },
      });

      const adAccounts = response.data.data;

      // Here you might want to save the ad accounts to your database
      // For now, we'll just return them.
      return adAccounts.map(account => ({
        facebookAccountId: account.account_id,
        name: account.name,
        status: account.account_status,
      }));
    } catch (error) {
      console.error('Error fetching ad accounts from Facebook:', error);
      throw new Error('Failed to fetch ad accounts from Facebook.');
    }
  }
}

module.exports = FacebookAccountService;
