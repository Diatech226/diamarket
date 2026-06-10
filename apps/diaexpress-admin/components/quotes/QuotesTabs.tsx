'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { PendingQuotesTable } from './PendingQuotesTable';
import { QuoteCreateWizard } from './QuoteCreateWizard';
import { QuotesPage } from './QuotesPage';

type TabKey = 'all' | 'pending';

export function QuotesTabs() {
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [refreshKey, setRefreshKey] = useState(0);
  const [showCreate, setShowCreate] = useState(false);

  const tabs = useMemo(
    () => [
      { key: 'all' as const, label: 'Tous les devis' },
      { key: 'pending' as const, label: 'À valider' }
    ],
    []
  );

  const handleQuoteCreated = () => {
    setRefreshKey((value) => value + 1);
    setActiveTab('all');
    setShowCreate(false);
  };

  return (
    <div className="page-stack">
      <PageHeader
        title="Devis"
        description="Suivez et validez les demandes client, puis convertissez-les en expéditions."
        actions={
          <Button variant="primary" onClick={() => setShowCreate((value) => !value)}>
            {showCreate ? 'Fermer le formulaire' : 'Nouveau devis'}
          </Button>
        }
      />

      <div className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`tab ${activeTab === tab.key ? 'tab--active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'all' ? (
        <QuotesPage key={refreshKey} />
      ) : null}

      {activeTab === 'pending' ? (
        <PendingQuotesTable key={refreshKey} />
      ) : null}

      {showCreate ? (
        <div className="panel">
          <div className="panel__header">
            <div>
              <div className="panel__title">Créer un devis</div>
              <p className="panel__muted">Renseignez les informations client pour préparer une estimation.</p>
            </div>
            <div className="panel__actions">
              <Button variant="ghost" onClick={() => setShowCreate(false)}>
                Annuler
              </Button>
            </div>
          </div>

          <QuoteCreateWizard onQuoteCreated={handleQuoteCreated} />
        </div>
      ) : null}
    </div>
  );
}
