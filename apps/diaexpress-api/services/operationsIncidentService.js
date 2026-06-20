const Shipment = require('../models/Shipment');
const ShipmentIncident = require('../models/ShipmentIncident');
const Hub = require('../models/Hub');
const { ApiError } = require('../utils/http');
const { OPERATIONS_EVENTS, publishOperationsEvent } = require('../src/lib/events/operationsHooks');
const notificationService = require('./notificationService');
const { NOTIFICATION_EVENTS } = require('../src/lib/events/notificationEvents');

const DEFAULT_HUBS = [
  ['Ouagadougou','Ouagadougou','Burkina Faso'], ['Bobo-Dioulasso','Bobo-Dioulasso','Burkina Faso'],
  ['Abidjan','Abidjan','Côte d’Ivoire'], ['Accra','Accra','Ghana'], ['Lomé','Lomé','Togo'],
  ['Montréal','Montréal','Canada'], ['Guangzhou','Guangzhou','China'],
];
const SLA_RULES = { air: 7*24, sea: 45*24, road: 10*24, express: 72, default: 14*24 };
const HOUR = 60*60*1000;
function actor(req) { return req?.identity?.principalId || req?.user?.email || req?.user?.id || 'admin'; }
function modeOf(shipment) { return String(shipment?.serviceType || shipment?.transportSnapshot?.type || shipment?.routeSnapshot?.transportType || 'default').toLowerCase(); }
function lastUpdate(shipment) { const a=shipment.trackingUpdates||[]; return a.length ? new Date(a[a.length-1].timestamp) : new Date(shipment.updatedAt || shipment.createdAt); }
function computeSla(shipment, now = new Date()) {
  const mode = SLA_RULES[modeOf(shipment)] ? modeOf(shipment) : 'default';
  const start = new Date(shipment.dispatchedAt || shipment.createdAtOperational || shipment.createdAt || now);
  const deadline = shipment.estimatedDelivery ? new Date(shipment.estimatedDelivery) : new Date(start.getTime() + SLA_RULES[mode]*HOUR);
  const remaining = deadline.getTime() - now.getTime();
  const status = remaining < 0 ? 'late' : remaining <= Math.max(12, SLA_RULES[mode]*0.2)*HOUR ? 'at_risk' : 'on_time';
  return { deadline, status, rule: mode };
}
function detectAlerts(shipment, now = new Date()) {
  const alerts = new Set(shipment.operationsAlerts || []);
  const lu = lastUpdate(shipment);
  if (shipment.status === 'delayed') alerts.add('delayed');
  if (['in_transit','picked_up','at_origin_hub','at_destination_hub'].includes(shipment.status) && now - lu > 72*HOUR) alerts.add('stuck_in_transit');
  if (!['delivered','returned','cancelled'].includes(shipment.status) && now - lu > 48*HOUR) alerts.add('missing_update');
  if (shipment.status === 'delivery_failed' && now - lu > 12*HOUR) alerts.add('delivery_failed_pending');
  if (shipment.status === 'out_for_delivery' && now - lu > 10*HOUR) alerts.add('delayed');
  return [...alerts];
}
async function listIncidents(q={}) { const filter={}; ['type','severity','status','assignedTo'].forEach(k=>{if(q[k]) filter[k]=q[k]}); if(q.search) filter.trackingNumber=new RegExp(q.search,'i'); return ShipmentIncident.find(filter).sort({ createdAt:-1 }).limit(Math.min(Number(q.limit)||200,500)).lean(); }
async function createIncident(input, identity={}) { const shipment=await Shipment.findById(input.shipmentId) || await Shipment.findOne({trackingCode: input.trackingNumber}); if(!shipment) throw new ApiError(404,'SHIPMENT_NOT_FOUND','Shipment introuvable'); const inc=await ShipmentIncident.create({ shipmentId: shipment._id, trackingNumber: shipment.trackingCode, type: input.type||'other', severity: input.severity||'medium', status: input.status||'open', title: input.title||'Incident opérationnel', description: input.description||'', reportedBy: input.reportedBy||identity.principalId||'admin', assignedTo: input.assignedTo||null, assignedTeam: input.assignedTeam||null, location: input.location||shipment.currentLocation||null, nextAction: input.nextAction||null, customerVisible: !!input.customerVisible }); publishOperationsEvent(OPERATIONS_EVENTS.INCIDENT_CREATED,{incidentId:String(inc._id),shipmentId:String(shipment._id),trackingNumber:shipment.trackingCode,type:inc.type}); await notificationService.notify({ eventType: NOTIFICATION_EVENTS.IncidentCreated, template: 'incident_created', type: 'incident', relatedType: 'ShipmentIncident', relatedId: inc._id, channels: ['in_app'], metadata: { trackingNumber: shipment.trackingCode, severity: inc.severity } }); return inc; }
async function updateIncident(id, patch) { const inc=await ShipmentIncident.findById(id); if(!inc) throw new ApiError(404,'INCIDENT_NOT_FOUND','Incident introuvable'); Object.assign(inc, patch); if(patch.comment) inc.comments.push({ message: patch.comment, author: patch.commentAuthor || 'admin', visibility: patch.commentVisibility || 'internal' }); await inc.save(); return inc; }
async function resolveIncident(id, { resolution, close }={}) { const inc=await ShipmentIncident.findById(id); if(!inc) throw new ApiError(404,'INCIDENT_NOT_FOUND','Incident introuvable'); inc.status = close ? 'closed' : 'resolved'; inc.resolution = resolution || inc.resolution || 'Résolu'; inc.resolvedAt = inc.resolvedAt || new Date(); await inc.save(); publishOperationsEvent(OPERATIONS_EVENTS.INCIDENT_RESOLVED,{incidentId:String(inc._id),shipmentId:String(inc.shipmentId),trackingNumber:inc.trackingNumber}); return inc; }
async function ensureDefaultHubs() { for (const [name,city,country] of DEFAULT_HUBS) await Hub.updateOne({name}, {$setOnInsert:{name,city,country,code:city.slice(0,3).toUpperCase(),capacity:0,active:true}}, {upsert:true}); }
async function listHubs() { await ensureDefaultHubs(); const hubs=await Hub.find().sort({city:1}).lean(); const incidents=await ShipmentIncident.find({status:{$in:['open','in_progress']}}).lean(); const shipments=await Shipment.find({}).select('trackingCode status assignedHub currentLocation').lean(); return hubs.map(h=>({...h, shipmentsPresent: shipments.filter(s=>s.assignedHub===h.name || s.currentLocation===h.city).length, shipmentsIncoming: shipments.filter(s=>s.status==='in_transit' && s.assignedHub===h.name).length, shipmentsOutgoing: shipments.filter(s=>['awaiting_pickup','at_origin_hub','out_for_delivery'].includes(s.status) && s.assignedHub===h.name).length, incidents: incidents.filter(i=>i.location===h.city || i.location===h.name).length})); }
async function upsertHub(input,id) { return id ? Hub.findByIdAndUpdate(id,input,{new:true,upsert:false}) : Hub.create(input); }
async function assignShipment(id,input,identity={}) { const shipment=await Shipment.findById(id); if(!shipment) throw new ApiError(404,'SHIPMENT_NOT_FOUND','Shipment introuvable'); ['assignedAgent','assignedTeam','assignedHub'].forEach(k=>{ if(input[k]!==undefined) shipment[k]=input[k]; }); shipment.assignedAt=new Date(); shipment.assignedBy=identity.principalId||'admin'; await shipment.save(); return shipment; }
async function transitionReturn(id,input={}) { const shipment=await Shipment.findById(id); if(!shipment) throw new ApiError(404,'SHIPMENT_NOT_FOUND','Shipment introuvable'); if(shipment.status!=='delivery_failed') throw new ApiError(409,'INVALID_RETURN_SOURCE','Retour/réessai seulement depuis delivery_failed'); if(!input.reason || !input.comment) throw new ApiError(400,'VALIDATION_ERROR','reason et comment obligatoires'); shipment.status=input.nextStatus === 'out_for_delivery' ? 'out_for_delivery' : 'returned'; shipment.returnReason=input.reason; shipment.returnComment=input.comment; shipment.returnCustomerVisible=!!input.customerVisible; shipment.returnedAt=shipment.status==='returned'?new Date():shipment.returnedAt; shipment.trackingUpdates.push({status:shipment.status,eventType:shipment.status==='returned'?'return_initiated':'delivery_retry',note:input.customerVisible?input.comment:'Mise à jour opérationnelle',source:'admin',timestamp:new Date()}); await shipment.save(); if(shipment.status==='returned') publishOperationsEvent(OPERATIONS_EVENTS.RETURN_INITIATED,{shipmentId:String(shipment._id),trackingNumber:shipment.trackingCode}); return shipment; }
async function operationsSnapshot() { const shipments=await Shipment.find().sort({updatedAt:-1}).limit(500).lean(); const incidents=await ShipmentIncident.find().sort({createdAt:-1}).limit(500).lean(); const enriched=shipments.map(s=>({...s,sla:computeSla(s),operationsAlerts:detectAlerts(s)})); return { shipments: enriched, incidents, alerts: enriched.flatMap(s=>(s.operationsAlerts||[]).map(type=>({type,shipmentId:s._id,trackingNumber:s.trackingCode,status:s.status,assignedAgent:s.assignedAgent,assignedHub:s.assignedHub}))), sla: { on_time: enriched.filter(s=>s.sla.status==='on_time').length, at_risk: enriched.filter(s=>s.sla.status==='at_risk').length, late: enriched.filter(s=>s.sla.status==='late').length, averageDeliveryHours: 0, topLateRoutes: [], hubsWithIncidents: [] } }; }
module.exports={ listIncidents, createIncident, updateIncident, resolveIncident, listHubs, upsertHub, assignShipment, transitionReturn, operationsSnapshot, computeSla, detectAlerts };
