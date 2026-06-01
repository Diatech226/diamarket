import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchQuoteMeta } from '@diaexpress/shared/api/logistics';

const normalizeArray = (value) => (Array.isArray(value) ? value : []);

const normalizeTransportTypes = (meta) => {
  const direct = normalizeArray(meta?.transportTypes);
  if (direct.length) return direct;

  const fromRoutes = normalizeArray(meta?.origins).flatMap((originEntry) =>
    normalizeArray(originEntry?.destinations).flatMap((destinationEntry) =>
      normalizeArray(destinationEntry?.transportTypes).map((type) => ({
        id: String(type || '').toLowerCase(),
        name: String(type || ''),
      })),
    ),
  );

  const unique = new Map();
  fromRoutes.forEach((item) => {
    if (item.id) unique.set(item.id, { ...item, name: item.name || item.id });
  });
  return Array.from(unique.values());
};

const normalizePackageTypes = (meta) => {
  const direct = normalizeArray(meta?.packageTypes);
  if (direct.length) return direct;

  const fromRoutes = normalizeArray(meta?.origins).flatMap((originEntry) =>
    normalizeArray(originEntry?.destinations).flatMap((destinationEntry) => normalizeArray(destinationEntry?.packageTypes)),
  );

  const unique = new Map();
  fromRoutes.forEach((item) => {
    const id = item?.id || item?._id || item?.code || item?.name;
    if (id) unique.set(String(id), item);
  });
  return Array.from(unique.values());
};

const flattenMarketPoints = (marketPoints = []) =>
  normalizeArray(marketPoints).flatMap((country) =>
    normalizeArray(country?.points).map((point) => ({
      ...point,
      countryCode: country?.countryCode || '',
      countryName: country?.countryName || '',
      label: point?.label || point?.name || point?.city || '',
      id: point?.id || point?._id || '',
    })),
  );

const buildRouteRows = (origins = []) =>
  normalizeArray(origins).flatMap((originEntry) =>
    normalizeArray(originEntry?.destinations).map((destinationEntry) => ({
      origin: String(originEntry?.origin || ''),
      destination: String(destinationEntry?.destination || ''),
      transportTypes: normalizeArray(destinationEntry?.transportTypes).map((t) => String(t || '').toLowerCase()).filter(Boolean),
      packageTypes: normalizeArray(destinationEntry?.packageTypes),
    })),
  );

export const useQuoteFlowMeta = () => {
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadMeta = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchQuoteMeta();
      setMeta(response || {});
      setError('');
    } catch (err) {
      setError(err?.message || 'Unable to load quote options for now.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMeta();
  }, [loadMeta]);

  return {
    meta,
    loading,
    error,
    refresh: loadMeta,
    origins: normalizeArray(meta?.origins),
    routeRows: buildRouteRows(meta?.origins),
    destinations: normalizeArray(meta?.destinations),
    marketPoints: flattenMarketPoints(meta?.marketPoints),
    transportTypes: normalizeTransportTypes(meta),
    transportLines: normalizeArray(meta?.transportLines),
    packageTypes: normalizePackageTypes(meta),
  };
};
