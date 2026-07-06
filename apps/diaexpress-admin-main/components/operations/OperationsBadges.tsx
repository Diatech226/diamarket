export function IncidentBadge({ severity, status }: { severity: string; status: string }) {
  const color = severity === 'critical' ? '#991b1b' : severity === 'high' ? '#b45309' : '#1d4ed8';
  return <span className="badge" style={{ background: color, color: 'white' }}>{severity} · {status}</span>;
}
export function SlaBadge({ status }: { status: string }) {
  const color = status === 'late' ? '#991b1b' : status === 'at_risk' ? '#b45309' : '#166534';
  return <span className="badge" style={{ background: color, color: 'white' }}>{status}</span>;
}
