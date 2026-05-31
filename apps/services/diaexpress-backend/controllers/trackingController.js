const { syncTracking } = require('../src/domains/tracking/application/trackingApplicationService');

exports.getTracking = async (req, res) => {
  const trackingCode = req.params.trackingCode || req.params.code;

  if (!trackingCode) {
    return res.status(400).json({ message: 'trackingCode requis' });
  }

  try {
    const result = await syncTracking({
      trackingCode,
      provider: req.query.provider,
      identity: req.identity || {},
    });

    return res.status(result.code).json(result.payload);
  } catch (error) {
    console.error('Erreur récupération tracking:', error);
    return res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};
