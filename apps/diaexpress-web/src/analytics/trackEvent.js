const normalizePayload = (payload = {}) => Object.entries(payload).reduce((acc, [key, value]) => {
  if (value !== undefined && value !== null && value !== '') {
    acc[key] = value;
  }
  return acc;
}, {});

export const ANALYTICS_EVENTS = {
  SEND_PACKAGE_CLICK: 'send_package_click',
  TRACK_PACKAGE_CLICK: 'track_package_click',
  SERVICE_CTA_CLICK: 'service_cta_click',
  QUOTE_CTA_CLICK: 'quote_cta_click',
  CONTACT_CTA_CLICK: 'contact_cta_click',
  QUOTE_FLOW_START: 'quote_flow_start',
  QUOTE_FLOW_SUBMIT: 'quote_flow_submit',
  CONTACT_FORM_SUBMIT: 'contact_form_submit',
  TRACKING_SEARCH: 'tracking_search',
};

export const trackEvent = (eventName, payload = {}) => {
  if (typeof window === 'undefined' || !eventName) {
    return;
  }

  const eventPayload = {
    event: eventName,
    ...normalizePayload(payload),
    timestamp: new Date().toISOString(),
  };

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(eventPayload);

  if (window.dispatchEvent && typeof window.CustomEvent === 'function') {
    window.dispatchEvent(new CustomEvent('diaexpress:analytics', { detail: eventPayload }));
  }

  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.info('[analytics:event]', eventPayload);
  }
};
