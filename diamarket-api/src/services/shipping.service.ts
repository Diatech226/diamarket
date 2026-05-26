export type ShippingEstimateInput = {
  totalAmount: number;
  totalWeight?: number;
  distanceKm?: number;
};

class ShippingService {
  private simulationMode = process.env.SHIPPING_SIMULATION_MODE !== 'false';

  async estimateShipping(orderData: ShippingEstimateInput) {
    if (this.simulationMode) {
      const base = 2500;
      const weightCost = (orderData.totalWeight || 1) * 400;
      const distanceCost = ((orderData.distanceKm || 20) / 10) * 300;
      return {
        provider: 'SIMULATED_PROVIDER',
        estimatedCost: Math.round(base + weightCost + distanceCost),
        estimatedDeliveryDays: 2,
        simulated: true,
      };
    }

    throw new Error('Real shipping provider is not configured yet');
  }

  async createShipment(orderData: { orderId: string; estimatedCost: number }) {
    if (this.simulationMode) {
      return {
        shipmentId: `SIM-${orderData.orderId}`,
        status: 'created',
        trackingNumber: `TRK-${Date.now()}`,
        simulated: true,
      };
    }

    throw new Error('Real shipping provider is not configured yet');
  }
}

export const shippingService = new ShippingService();
