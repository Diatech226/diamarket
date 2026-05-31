const ERROR_CLASSIFICATION = {
  UNAUTHORIZED: 'auth',
  FORBIDDEN: 'auth',
  INVALID_AUTH_TOKEN: 'auth',
  VALIDATION_ERROR: 'validation',
  BAD_REQUEST: 'validation',
  DATA_INTEGRITY_ERROR: 'data_integrity',
  DB_UNAVAILABLE: 'data_integrity',
  PROVIDER_INTEGRATION_ERROR: 'provider_integration',
  NETWORK_MASTER_DATA_ERROR: 'network_master_data',
  PLANNING_CAPACITY_ERROR: 'planning_capacity',
  PAYMENT_FAILED: 'finance_payment',
  INTERNAL_ERROR: 'system',
};

function classifyErrorCode(code) {
  return ERROR_CLASSIFICATION[code] || 'system';
}

module.exports = {
  classifyErrorCode,
};
