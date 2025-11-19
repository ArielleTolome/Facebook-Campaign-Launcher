const { User, AdAccount } = require('../models');
const FacebookAccountService = require('../services/FacebookAccountService');

/**
 * Fetches the list of ad accounts for the authenticated user.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
exports.getAdAccounts = async (req, res) => {
  try {
    const { user } = req;
    const fbAdAccounts = await FacebookAccountService.fetchAdAccounts(user.facebookAccessToken);

    const adAccountIds = [];
    for (const fbAccount of fbAdAccounts) {
      const [adAccount] = await AdAccount.findOrCreate({
        where: { facebookAccountId: fbAccount.facebookAccountId },
        defaults: {
          name: fbAccount.name,
          status: fbAccount.status,
        },
      });
      await user.addAdAccount(adAccount);
      adAccountIds.push(adAccount.id);
    }

    const adAccounts = await AdAccount.findAll({ where: { id: adAccountIds } });

    res.json({ success: true, adAccounts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Selects an ad account for the user's session.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
exports.selectAdAccount = async (req, res) => {
  try {
    const { adAccountId } = req.body;
    const { user } = req;

    // Check if the user has access to this ad account
    const adAccount = await AdAccount.findOne({ where: { id: adAccountId } });
    if (!adAccount) {
      return res.status(404).json({ success: false, error: 'Ad account not found.' });
    }

    const userAdAccount = await user.hasAdAccount(adAccount);
    if (!userAdAccount) {
      return res.status(403).json({ success: false, error: 'You do not have access to this ad account.' });
    }

    req.session.selectedAdAccountId = adAccountId;
    res.json({ success: true, message: 'Ad account selected successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
