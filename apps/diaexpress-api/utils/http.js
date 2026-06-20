class ApiError extends Error {
  constructor(status, code, message, details, options = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.exposeDetails = Boolean(options.exposeDetails);
  }
}

const success = (res, data, { status = 200, meta, pagination, legacy } = {}) => {
  const payload = { success: true, data, meta: meta || {} };
  if (pagination) payload.pagination = pagination;
  if (legacy && typeof legacy === 'object') Object.assign(payload, legacy);
  return res.status(status).json(payload);
};

const error = (res, { status = 500, code = 'INTERNAL_ERROR', message = 'Internal server error', details, category } = {}) => {
  const requestId = res.getHeader('x-correlation-id') || res.getHeader('x-request-id') || null;
  return res.status(status).json({
    success: false,
    message,
    error: {
      code,
      category: category || null,
      message,
      reference: requestId || null,
      ...(details ? { details } : {}),
    },
  });
};

const parseListQuery = (query = {}, {
  defaultSortBy = 'createdAt',
  allowedSortBy = ['createdAt', 'updatedAt'],
  maxLimit = 100,
} = {}) => {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, Number.parseInt(query.limit, 10) || 20));
  const search = typeof query.search === 'string' ? query.search.trim() : '';
  const sortBy = allowedSortBy.includes(query.sortBy) ? query.sortBy : defaultSortBy;
  const sortOrder = String(query.sortOrder || 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc';
  return { page, limit, search, sortBy, sortOrder, skip: (page - 1) * limit };
};

module.exports = {
  ApiError,
  success,
  error,
  parseListQuery,
};
