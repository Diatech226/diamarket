const MarketPoint = require('../models/MarketPoint');
const {
  createMarketPoint,
  listMarketPoints,
} = require('../src/domains/network/application/masterDataService');

const parsePagination = (req) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  return { page, limit };
};

exports.list = async (req, res) => {
  try {
    const { page, limit } = parsePagination(req);
    const { search, country, active, countryId, type } = req.query;

    const filters = {
      search,
      countryCode: country,
      countryId,
      type,
    };
    if (active != null) filters.active = active !== 'false';

    const [items, total] = await Promise.all([
      listMarketPoints(filters, { skip: (page - 1) * limit, limit }),
      MarketPoint.countDocuments({
        ...(country ? { countryCode: String(country).toUpperCase() } : {}),
        ...(countryId ? { countryId } : {}),
        ...(active != null ? { active: active !== 'false' } : {}),
      }),
    ]);

    return res.json({ items, page, limit, total });
  } catch (error) {
    console.error('Error listing market points', error);
    return res.status(500).json({ message: 'Erreur lors du chargement des MarketPoints' });
  }
};

exports.create = async (req, res) => {
  try {
    const marketPoint = await createMarketPoint(req.body || {});
    return res.status(201).json({ message: 'MarketPoint créé', marketPoint });
  } catch (error) {
    console.error('Error creating market point', error);
    return res.status(error.status || 400).json({ message: error.message || 'Impossible de créer le MarketPoint' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await MarketPoint.findByIdAndUpdate(id, req.body || {}, { new: true }).populate('countryId');
    if (!updated) {
      return res.status(404).json({ message: 'MarketPoint introuvable' });
    }
    return res.json({ message: 'MarketPoint mis à jour', marketPoint: updated });
  } catch (error) {
    console.error('Error updating market point', error);
    return res.status(400).json({ message: error.message || 'Impossible de mettre à jour le MarketPoint' });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await MarketPoint.findByIdAndUpdate(id, { active: false }, { new: true }).populate('countryId');
    if (!updated) {
      return res.status(404).json({ message: 'MarketPoint introuvable' });
    }
    return res.json({ message: 'MarketPoint désactivé', marketPoint: updated });
  } catch (error) {
    console.error('Error disabling market point', error);
    return res.status(400).json({ message: error.message || 'Impossible de désactiver le MarketPoint' });
  }
};
