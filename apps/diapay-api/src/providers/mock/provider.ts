export const mockProvider = {
  async createPayment(payload: Record<string, unknown>) {
    return { id: `pay_${Date.now()}`, status: 'requires_action', provider: 'mock', payload };
  },
  async getPayment(id: string) { return { id, status: 'succeeded', provider: 'mock' }; },
  async cancelPayment(id: string) { return { id, status: 'canceled', provider: 'mock' }; },
  async refundPayment(id: string) { return { id, status: 'refunded', provider: 'mock' }; }
};
