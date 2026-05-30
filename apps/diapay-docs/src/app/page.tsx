const providerMatrix = [
  { method: 'mobile-money', provider: 'mock-mobile-money', useCase: 'Orange Money, MTN MoMo, Wave, Moov', sandbox: 'phone=70000000 succès, phone=70000001 échec' },
  { method: 'bank-card', provider: 'mock-bank-card', useCase: 'Cartes tokenisées via PSP/acquéreur', sandbox: '4242 succès, 4000 0000 0000 0002 refus' },
  { method: 'bank-transfer', provider: 'mock-bank-transfer', useCase: 'Instructions de virement et réconciliation', sandbox: 'processing avec instructions sandbox' },
  { method: 'crypto', provider: 'mock-crypto', useCase: 'USDC / réseaux crypto futurs', sandbox: 'wallet_address sandbox, aucun wallet réel' },
];

export default function DocsHome() {
  return (
    <main style={{ maxWidth: 960, margin: '0 auto', padding: 32, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <p style={{ color: '#0f766e', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>Diapay Docs</p>
      <h1>Architecture providers de paiement</h1>
      <p>Diapay expose une interface commune pour connecter mobile money, carte bancaire, virement bancaire, crypto et des providers futurs. Les connecteurs actuels sont des mocks sandbox: aucune API sensible ni credential réel n’est intégré.</p>

      <h2>Endpoints</h2>
      <ul>
        <li><code>GET /api/v1/payment-methods</code> liste les moyens supportés.</li>
        <li><code>GET /api/v1/providers</code> retourne les descriptors des providers actifs.</li>
        <li><code>POST /api/v1/payments</code> route le paiement vers le provider associé à <code>method</code>.</li>
      </ul>

      <h2>Providers sandbox</h2>
      <div style={{ display: 'grid', gap: 16 }}>
        {providerMatrix.map((provider) => (
          <section key={provider.provider} style={{ border: '1px solid #e2e8f0', borderRadius: 20, padding: 20 }}>
            <h3 style={{ margin: 0 }}>{provider.method}</h3>
            <p><strong>Provider:</strong> {provider.provider}</p>
            <p><strong>Cas d’usage:</strong> {provider.useCase}</p>
            <p><strong>Sandbox:</strong> {provider.sandbox}</p>
          </section>
        ))}
      </div>

      <h2>Exemple SDK</h2>
      <pre style={{ background: '#020617', color: '#a7f3d0', padding: 20, borderRadius: 20, overflowX: 'auto' }}><code>{`const providers = await diapay.listProviders();
const payment = await diapay.createPayment({
  amount: 125000,
  currency: 'XOF',
  method: 'mobile-money',
  phone: '70000000',
  metadata: { orderId: 'ORD-123' },
});`}</code></pre>
    </main>
  );
}
