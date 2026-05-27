export class DiapaySDK {
  constructor(private baseUrl: string, private apiKey: string) {}
  private headers() { return { 'Content-Type': 'application/json', Authorization: `Bearer ${this.apiKey}` }; }
  async createPayment(payload: Record<string, unknown>) { return fetch(`${this.baseUrl}/api/v1/payments`, { method: 'POST', headers: this.headers(), body: JSON.stringify(payload) }).then(r => r.json()); }
  async getPayment(id: string) { return fetch(`${this.baseUrl}/api/v1/payments/${id}`, { headers: this.headers() }).then(r => r.json()); }
  verifyWebhook(rawBody: string, signature: string) { return Boolean(rawBody && signature); }
  async refundPayment(id: string) { return fetch(`${this.baseUrl}/api/v1/payments/${id}/refund`, { method: 'POST', headers: this.headers() }).then(r => r.json()); }
  async cancelPayment(id: string) { return fetch(`${this.baseUrl}/api/v1/payments/${id}/cancel`, { method: 'POST', headers: this.headers() }).then(r => r.json()); }
}
