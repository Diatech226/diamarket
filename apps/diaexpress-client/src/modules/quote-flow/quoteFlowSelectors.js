const toNumber = (value) => Number.parseFloat(value || '0') || 0;

export const hasValidRoute = (draft) => Boolean(draft?.route?.origin && draft?.route?.destination);
export const hasValidTransport = (draft) => Boolean(draft?.transport?.transportType);
export const buildEstimateSignature = (draft) =>
  JSON.stringify({
    route: {
      origin: draft?.route?.origin || '',
      destination: draft?.route?.destination || '',
      originMarketPointId: draft?.route?.originMarketPointId || '',
      destinationMarketPointId: draft?.route?.destinationMarketPointId || '',
    },
    transport: {
      transportType: draft?.transport?.transportType || '',
      transportLineId: draft?.transport?.transportLineId || '',
    },
    cargo: {
      packageTypeId: draft?.cargo?.packageTypeId || '',
      weight: String(draft?.cargo?.weight || ''),
      volume: String(draft?.cargo?.volume || ''),
      length: String(draft?.cargo?.length || ''),
      width: String(draft?.cargo?.width || ''),
      height: String(draft?.cargo?.height || ''),
    },
  });

export const hasValidCargo = (draft) => {
  const cargo = draft?.cargo || {};
  const transportType = draft?.transport?.transportType;
  const dimensionsComplete = toNumber(cargo.length) > 0 && toNumber(cargo.width) > 0 && toNumber(cargo.height) > 0;

  if (transportType === 'air') return Boolean(cargo.packageTypeId || toNumber(cargo.weight) > 0 || dimensionsComplete);
  if (transportType === 'sea') return Boolean(cargo.packageTypeId || toNumber(cargo.volume) > 0 || dimensionsComplete);
  return Boolean(cargo.packageTypeId || toNumber(cargo.weight) > 0 || toNumber(cargo.volume) > 0 || dimensionsComplete);
};

export const hasValidEstimate = (draft) => hasValidCargo(draft);
export const hasSuccessfulEstimate = (draft) =>
  draft?.estimate?.status === 'success' &&
  draft?.estimate?.signature &&
  draft?.estimate?.signature === buildEstimateSignature(draft) &&
  Number.isFinite(Number(draft?.estimate?.estimatedPrice)) &&
  Number(draft?.estimate?.estimatedPrice) >= 0 &&
  Boolean(draft?.estimate?.quoteDraftPayload);
