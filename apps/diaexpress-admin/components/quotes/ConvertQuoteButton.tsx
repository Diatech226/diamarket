'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { convertQuoteToShipment } from '@/lib/api/quotes';
import type { Quote } from '@/src/types/logistics';

export function ConvertQuoteButton({ quote, onError }: { quote: Quote; onError?: (message: string) => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const disabled = quote.status !== 'approved' || Boolean(quote.shipmentId) || loading;

  const convert = async () => {
    try {
      setLoading(true);
      const result = await convertQuoteToShipment(quote._id);
      if (result?.shipment?._id) router.push(`/admin/shipments/${result.shipment._id}`);
    } catch (error) {
      onError?.((error as Error).message || 'Quote not eligible for shipment conversion');
    } finally {
      setLoading(false);
    }
  };

  return <Button variant="primary" onClick={convert} disabled={disabled}>{loading ? 'Conversion...' : 'Convertir en shipment'}</Button>;
}
