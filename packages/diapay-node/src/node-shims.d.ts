declare const process: { env: Record<string, string | undefined> };
declare const Buffer: { from(input: string): { length: number } };
declare module 'crypto' {
  export function createHmac(algorithm: string, secret: string): { update(input: string): { digest(encoding: 'hex'): string } };
  export function timingSafeEqual(left: { length: number }, right: { length: number }): boolean;
}
