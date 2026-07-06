import { apiClient } from '@/lib/api/client';

export type Incident = { _id:string; trackingNumber:string; type:string; severity:string; status:string; title:string; assignedTo?:string; assignedTeam?:string; location?:string; nextAction?:string; createdAt:string };
export type Hub = { _id:string; name:string; city:string; country:string; capacity:number; shipmentsPresent:number; shipmentsIncoming:number; shipmentsOutgoing:number; incidents:number };
export type OpsShipment = { _id:string; trackingCode:string; status:string; assignedAgent?:string; assignedHub?:string; clientSnapshot?:{name?:string; email?:string}; sla?:{status:string; deadline:string}; operationsAlerts?:string[]; createdAt:string };
export async function fetchIncidents(params: Record<string,string> = {}) { return apiClient<{items:Incident[]}>('api/admin/operations/incidents', { searchParams: params }); }
export async function fetchHubs() { return apiClient<{items:Hub[]}>('api/admin/operations/hubs'); }
export async function fetchOperationsBoard() { return apiClient<{shipments:OpsShipment[]; incidents:Incident[]; alerts:unknown[]}>('api/admin/operations/board'); }
export async function fetchSlaDashboard() { return apiClient<{on_time:number; at_risk:number; late:number; averageDeliveryHours:number; topLateRoutes:unknown[]; hubsWithIncidents:unknown[]}>('api/admin/operations/sla'); }
