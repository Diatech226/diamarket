export const idOf = (item) => item?._id || item?.id || '';
export const refOf = (item, prefix = 'DX') => item?.reference || item?.trackingCode || item?.trackingNumber || (idOf(item) ? `${prefix}-${idOf(item).slice(-8).toUpperCase()}` : '—');
export const formatDate = (value) => { if (!value) return '—'; const d = new Date(value); return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('fr-FR'); };
export const formatDateTime = (value) => { if (!value) return '—'; const d = new Date(value); return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString('fr-FR'); };
export const money = (value, currency = 'EUR') => value === undefined || value === null || value === '' ? '—' : `${Number(value).toLocaleString('fr-FR')} ${currency}`;
export const routeOf = (record) => ({ origin: record?.origin?.city || record?.origin || record?.pickupAddress?.city || record?.quoteId?.origin || '—', destination: record?.destination?.city || record?.destination || record?.deliveryAddress?.city || record?.quoteId?.destination || '—' });
export const amountOf = (q) => q?.price ?? q?.amount ?? q?.pricing?.total ?? q?.estimatedPrice;
