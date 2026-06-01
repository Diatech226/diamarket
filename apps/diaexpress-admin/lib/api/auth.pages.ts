import type { NextApiRequest } from 'next';
import { getAuth } from '@clerk/nextjs/server';

/**
 * Pages Router helper. Use this only in `pages/` and `pages/api/*`.
 */
export function getPagesAuth(req: NextApiRequest) {
  return getAuth(req);
}
