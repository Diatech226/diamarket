const events = [
  { id: 'evt_test_provider_paid', type: 'payment.paid', status: 'processed', source: 'provider', attempts: 1 },
  { id: 'evt_test_retrying', type: 'refund.succeeded', status: 'processed', source: 'internal', attempts: 3 },
];
export default function EventsPage() { return <main><h1>Webhook event log</h1><p>Audit trail for provider, internal, merchant test, and sandbox events. Payloads are sanitized and secrets are never displayed.</p><table><thead><tr><th>Event</th><th>Type</th><th>Source</th><th>Status</th><th>Attempts</th></tr></thead><tbody>{events.map((event)=><tr key={event.id}><td>{event.id}</td><td>{event.type}</td><td>{event.source}</td><td>{event.status}</td><td>{event.attempts}</td></tr>)}</tbody></table></main>; }
