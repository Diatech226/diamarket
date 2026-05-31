const counters = new Map();
const timers = new Map();

function labelKey(labels = {}) {
  return Object.entries(labels)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join(',');
}

function increment(name, value = 1, labels = {}) {
  const key = `${name}|${labelKey(labels)}`;
  counters.set(key, (counters.get(key) || 0) + value);
}

function observe(name, value, labels = {}) {
  const key = `${name}|${labelKey(labels)}`;
  const bucket = timers.get(key) || { count: 0, sum: 0, min: Number.POSITIVE_INFINITY, max: 0 };
  bucket.count += 1;
  bucket.sum += value;
  bucket.min = Math.min(bucket.min, value);
  bucket.max = Math.max(bucket.max, value);
  timers.set(key, bucket);
}

function snapshot() {
  const countersPayload = [];
  counters.forEach((value, key) => countersPayload.push({ key, value }));

  const timerPayload = [];
  timers.forEach((value, key) => timerPayload.push({ key, ...value, avg: value.count ? value.sum / value.count : 0 }));

  return {
    generatedAt: new Date().toISOString(),
    counters: countersPayload,
    timers: timerPayload,
  };
}

function getCounterValue(name) {
  let total = 0;
  counters.forEach((value, key) => {
    if (key === name || key.startsWith(`${name}|`)) {
      total += value;
    }
  });
  return total;
}

function getTimerStats(name) {
  let count = 0;
  let sum = 0;
  timers.forEach((value, key) => {
    if (key === name || key.startsWith(`${name}|`)) {
      count += value.count;
      sum += value.sum;
    }
  });
  return {
    count,
    avg: count ? sum / count : 0,
  };
}

function summary() {
  const requestLatency = getTimerStats('request_latency_ms');
  return {
    requests: {
      total: getCounterValue('request_total'),
      errors: getCounterValue('request_error_rate'),
      avgLatency: Number(requestLatency.avg.toFixed(2)),
    },
    auth: {
      failures: getCounterValue('auth_failures'),
    },
    db: {
      failures: getCounterValue('db_connection_failures'),
    },
    quote: {
      created: getCounterValue('quote_creation_rate'),
    },
    shipment: {
      created: getCounterValue('shipment_creation_rate'),
    },
    payment: {
      success: getCounterValue('payment_success_rate'),
      failed: getCounterValue('payment_failure_rate'),
    },
    planning: {
      exceptions: getCounterValue('planning_capacity_exceptions'),
    },
  };
}

module.exports = {
  metrics: {
    increment,
    observe,
    snapshot,
    summary,
  },
};
