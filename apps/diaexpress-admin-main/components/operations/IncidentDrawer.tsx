import { IncidentBadge } from './OperationsBadges';
import type { Incident } from '@/src/services/api/operations';
export function IncidentDrawer({ incident }: { incident: Incident }) { return <section className="card"><h3>{incident.title}</h3><IncidentBadge severity={incident.severity} status={incident.status} /><p>Tracking: {incident.trackingNumber}</p><p>Responsable: {incident.assignedTo || incident.assignedTeam || 'À assigner'}</p><p>Action suivante: {incident.nextAction || 'Qualifier et traiter'}</p></section>; }
