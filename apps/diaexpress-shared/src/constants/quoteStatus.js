export const QUOTE_STATUS_META = {
  requested: {
    label: 'Pending',
    tone: 'info',
    description: 'Your quote request was submitted and is waiting for initial review.',
  },
  under_review: {
    label: 'Under review',
    tone: 'warning',
    description: 'Your request is being reviewed by our operations team.',
  },
  approved: {
    label: 'Approved',
    tone: 'success',
    description: 'Your quote is approved. You can confirm and proceed to payment.',
  },
  awaiting_customer_approval: {
    label: 'Action required',
    tone: 'warning',
    description: 'Please review and approve this quote to continue.',
  },
  customer_approved: {
    label: 'Customer approved',
    tone: 'success',
    description: 'You approved this quote. Shipment preparation is in progress.',
  },
  rejected: {
    label: 'Rejected',
    tone: 'danger',
    description: 'This quote request was rejected. Contact support for alternatives.',
  },
  ready_for_shipment: {
    label: 'Ready for shipment',
    tone: 'success',
    description: 'The quote is complete and can move to shipment operations.',
  },
  converted: {
    label: 'Converted',
    tone: 'info',
    description: 'This quote has been converted into an active shipment.',
  },
};

export const QUOTE_STATUS_SEQUENCE = ['requested', 'under_review', 'approved', 'rejected'];

export const getQuoteStatusMeta = (status) => {
  const key = typeof status === 'string' ? status : '';
  return (
    QUOTE_STATUS_META[key] || {
      label: key || 'Unknown',
      tone: 'info',
      description: 'Status details are not available yet.',
    }
  );
};
