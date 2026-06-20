'use client';

import { QuoteStatusBadge } from './QuoteStatusBadge';
import type { QuoteStatus } from '@/src/types/logistics';

export function StatusBadge({ status }: { status: QuoteStatus | string }) {
  return <QuoteStatusBadge status={status as QuoteStatus} />;
}
