export const ANALYTICS_EVENTS = {
  SEND_PACKAGE_CLICK: 'send_package_click',
  TRACKING_SEARCH: 'tracking_search',
};

export const trackEvent = (eventName, payload = {}) => {
  if (typeof window === 'undefined' || !eventName) return;

  window.dispatchEvent(
    new CustomEvent('diaexpress:analytics', {
      detail: {
        eventName,
        payload,
        timestamp: new Date().toISOString(),
      },
    })
  );
};
