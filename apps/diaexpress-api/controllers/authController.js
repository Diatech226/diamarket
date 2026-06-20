const {
  ensureRequestIdentity,
  issueClientToken,
  parseBasicCredentials,
} = require('../services/diaexpressAuthService');
const { syncUserFromIdentity } = require('../services/userIdentityService');

function extractClientCredentials(req) {
  const basic = parseBasicCredentials(req.get('authorization'));
  if (basic?.clientId) {
    return basic;
  }

  const { client_id: clientId, client_secret: clientSecret } = req.body || {};
  if (clientId && clientSecret) {
    return { clientId, clientSecret };
  }

  return null;
}

exports.exchangeToken = (req, res) => {
  try {
    const credentials = extractClientCredentials(req);
    if (!credentials) {
      return res.status(400).json({ success: false, message: 'Client credentials manquants' });
    }

    const { token, tokenType, expiresIn, identity } = issueClientToken(
      credentials.clientId,
      credentials.clientSecret,
    );

    return res.json({
      success: true,
      token,
      access_token: token,
      token_type: tokenType,
      expires_in: expiresIn,
      scope: (identity.scopes || []).join(' '),
      subject: identity.principalId,
      role: identity.role,
      label: identity.label,
    });
  } catch (error) {
    if (error.code === 'INVALID_CLIENT') {
      return res.status(401).json({ success: false, message: 'Identifiants client invalides' });
    }

    console.error('Erreur échange token DiaExpress:', error);
    return res.status(500).json({ success: false, message: "Échec de l'émission du token" });
  }
};

exports.syncUser = async (req, res) => {
  try {
    const identity = ensureRequestIdentity(req);
    if (!identity) {
      return res.status(401).json({ success: false, message: 'Unauthorized: no identity' });
    }

    const user = await syncUserFromIdentity(identity);
    if (!user) {
      return res.status(500).json({ success: false, message: 'User sync failed' });
    }

    res.json({ success: true, user, identity });
  } catch (err) {
    console.error('❌ Sync error:', err);
    res.status(500).json({ success: false, message: 'User sync failed' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const identity = ensureRequestIdentity(req);
    if (!identity) {
      return res.status(401).json({ success: false, message: 'Unauthorized: no identity' });
    }

    const user = await syncUserFromIdentity(identity);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, identity, user });
  } catch (err) {
    console.error('❌ getMe error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
