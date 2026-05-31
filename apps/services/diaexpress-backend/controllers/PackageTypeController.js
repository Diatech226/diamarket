const PackageType = require('../models/PackageType');
const { success, parseListQuery, ApiError } = require('../utils/http');

exports.getAllPackageTypes = async (req, res, next) => {
  try {
    const list = parseListQuery(req.query, { defaultSortBy: 'name', allowedSortBy: ['name', 'createdAt', 'updatedAt'] });
    const query = {};
    if (list.search) query.$or = [{ name: new RegExp(list.search, 'i') }, { label: new RegExp(list.search, 'i') }];
    const [data, total] = await Promise.all([
      PackageType.find(query).sort({ [list.sortBy]: list.sortOrder === 'asc' ? 1 : -1 }).skip(list.skip).limit(list.limit).lean(),
      PackageType.countDocuments(query),
    ]);
    return success(res, data, {
      pagination: { page: list.page, limit: list.limit, total, totalPages: Math.ceil(total / list.limit) || 1 },
      legacy: { packageTypes: data },
    });
  } catch (error) { return next(error); }
};

exports.createPackageType = async (req, res, next) => {
  try {
    const { name, description, allowedTransportTypes } = req.body || {};
    if (!name || typeof name !== 'string') throw new ApiError(400, 'VALIDATION_ERROR', 'name is required');
    const doc = await PackageType.create({ name: name.trim(), description, allowedTransportTypes: Array.isArray(allowedTransportTypes) ? allowedTransportTypes : [] });
    return success(res, doc, { status: 201, legacy: { message: 'Type de colis créé avec succès', packageType: doc } });
  } catch (error) { return next(error); }
};

exports.updatePackageType = async (req, res, next) => {
  try {
    const updated = await PackageType.findByIdAndUpdate(req.params.id, {
      $set: {
        name: req.body.name,
        description: req.body.description,
        allowedTransportTypes: Array.isArray(req.body.allowedTransportTypes) ? req.body.allowedTransportTypes : [],
      },
    }, { new: true, runValidators: true });
    if (!updated) throw new ApiError(404, 'PACKAGE_TYPE_NOT_FOUND', 'Type non trouvé');
    return success(res, updated, { legacy: { message: 'Type mis à jour', packageType: updated } });
  } catch (error) { return next(error); }
};

exports.deletePackageType = async (req, res, next) => {
  try {
    const deleted = await PackageType.findByIdAndDelete(req.params.id);
    if (!deleted) throw new ApiError(404, 'PACKAGE_TYPE_NOT_FOUND', 'Type non trouvé');
    return success(res, { deleted: true }, { legacy: { message: 'Type supprimé' } });
  } catch (error) { return next(error); }
};
