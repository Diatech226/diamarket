export const diaexpressTokens = {
  colors: {
    graphite: '#111827', logisticNavy: '#17324D', trackingCyan: '#00B8D9', deliveredGreen: '#2ECC71', transitOrange: '#FF9F1C', exceptionRed: '#E63946', parcelSand: '#D9B382', coldWhite: '#F8FAFC', interfaceGray: '#E5E7EB', hubViolet: '#8B5CF6', amberDelay: '#F59E0B', returnedBrown: '#9A6B3F', pickedUpBlue: '#38BDF8',
  },
  spacing: { xs: '0.25rem', sm: '0.5rem', md: '1rem', lg: '1.5rem', xl: '2rem', xxl: '3rem' },
  radius: { sm: '0.625rem', md: '0.875rem', lg: '1.25rem', xl: '1.75rem', pill: '999px' },
  shadow: { card: '0 20px 50px rgba(17, 24, 39, 0.10)', lift: '0 28px 70px rgba(23, 50, 77, 0.18)' },
  typography: { base: "Inter, Manrope, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", display: "Manrope, Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  statusColors: {
    quote: { submitted: '#00B8D9', under_review: '#FF9F1C', info_requested: '#D9B382', priced: '#17324D', approved: '#2ECC71', rejected: '#E63946', expired: '#E5E7EB', converted_to_shipment: '#111827', cancelled: '#E5E7EB' },
    shipment: { created: '#00B8D9', awaiting_pickup: '#FF9F1C', picked_up: '#38BDF8', at_origin_hub: '#8B5CF6', in_transit: '#17324D', at_destination_hub: '#8B5CF6', out_for_delivery: '#FB8500', delivered: '#2ECC71', delivery_failed: '#E63946', delayed: '#F59E0B', returned: '#9A6B3F', cancelled: '#4B5563' },
  },
  transportColors: { air: '#00B8D9', sea: '#17324D', road: '#FF9F1C', local: '#2ECC71' },
};

export const getReadableTextColor = (hex) => ['#E5E7EB', '#D9B382', '#FF9F1C', '#F59E0B', '#38BDF8', '#00B8D9', '#2ECC71'].includes(hex) ? '#111827' : '#F8FAFC';
