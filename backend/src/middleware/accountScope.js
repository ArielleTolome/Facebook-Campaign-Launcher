/**
 * Middleware to ensure that an ad account is selected in the user's session.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @param {function} next - The next middleware function.
 */
module.exports = (req, res, next) => {
  if (!req.session || !req.session.selectedAdAccountId) {
    return res.status(401).json({
      success: false,
      error: 'No ad account selected. Please select an ad account to continue.',
    });
  }

  req.adAccountId = req.session.selectedAdAccountId;
  next();
};
