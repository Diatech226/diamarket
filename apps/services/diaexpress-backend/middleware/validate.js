const { error } = require('../utils/http');

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const validators = {
  required: (value) => value !== undefined && value !== null && value !== '',
  string: (value) => value === undefined || value === null || typeof value === 'string',
  number: (value) => value === undefined || (Number.isFinite(Number(value))),
  enum: (values) => (value) => value === undefined || values.includes(value),
  objectId: (value) => value === undefined || value === null || objectIdPattern.test(String(value)),
  min: (min) => (value) => value === undefined || Number(value) >= min,
};

const validateBody = (rules = []) => (req, res, next) => {
  const details = {};

  rules.forEach((rule) => {
    const value = req.body?.[rule.field];
    const checks = Array.isArray(rule.checks) ? rule.checks : [];

    checks.forEach((check) => {
      const valid = typeof check.fn === 'function' ? check.fn(value, req.body) : true;
      if (!valid) {
        details[rule.field] = details[rule.field] || [];
        details[rule.field].push(check.message);
      }
    });
  });

  if (Object.keys(details).length) {
    return error(res, {
      status: 400,
      code: 'VALIDATION_ERROR',
      message: 'Request validation failed',
      details,
    });
  }

  return next();
};

module.exports = {
  validateBody,
  validators,
};
