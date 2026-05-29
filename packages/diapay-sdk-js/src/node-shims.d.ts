declare module 'crypto' {
  export function createHmac(algorithm: string, key: string): { update(value: string): { digest(encoding: string): string } };
  export function timingSafeEqual(left: any, right: any): boolean;
}
declare const Buffer: { from(value: string): any };
