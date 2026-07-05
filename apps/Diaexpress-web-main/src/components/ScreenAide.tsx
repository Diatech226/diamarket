import React, { useState } from 'react';
import { HelpCircle, Search, ChevronDown, ChevronUp, MessageSquare, PlusCircle, ArrowLeft, Send } from 'lucide-react';
import { SupportTicket } from '../types';

interface ScreenAideProps {
  onNavigate: (screen: any) => void;
  tickets: SupportTicket[];
  onAddResponse: (ticketId: string, message: string) => void;
}

const FAQS = [
  {
    q: "Pourquoi mon expédition internationale est-elle bloquée en douane ?",
    a: "Une expédition peut être retenue en douane pour plusieurs raisons : facture commerciale manquante ou incomplète, absence de code SH (Harmonized System Code), ou droits de douane non acquittés. Vous pouvez importer les justificatifs manquants depuis l'onglet 'Gestion des Documents'."
  },
  {
    q: "Qu'est-ce que le certificat OEA de DiaExpress ?",
    a: "DiaExpress dispose de l'agrément d'Opérateur Économique Agréé (OEA). Ce statut douanier accordé par l'Union Européenne certifie la conformité, la sécurité et la solvabilité de notre logistique. Il garantit un dédouanement accéléré et des contrôles physiques réduits pour vos colis."
  },
  {
    q: "Comment sont calculés les droits de douane et la TVA ?",
    a: "Les droits de douane dépendent de la valeur de la marchandise et de sa catégorie fiscale (HS Code). La TVA s'applique généralement à hauteur de 20% sur le montant total combinant la valeur déclarée et les droits de douane. DiaExpress intègre un calculateur officiel à l'étape 3 de votre création d'expédition."
  },
  {
    q: "Quels sont les délais de traitement des réclamations ?",
    a: "Les réclamations standards sont analysées par nos contrôleurs de fret sous un délai maximum de 48 heures ouvrées. En cas de litige douanier complexe, le dossier peut nécessiter une interaction avec les bureaux de transit sous 5 jours ouvrés."
  }
];

export default function ScreenAide({
  onNavigate,
  tickets,
  onAddResponse,
}: ScreenAideProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');

  const filteredFaqs = FAQS.filter(
    (faq) =>
      faq.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedTicket = tickets.find(t => t.id === selectedTicketId);

  const handleSendResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicketId || !responseText.trim()) return;
    onAddResponse(selectedTicketId, responseText);
    setResponseText('');
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4" id="screen-aide">
      {/* Back button */}
      <div className="mb-6">
        <button
          onClick={() => onNavigate('accueil')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          id="btn-aide-back"
        >
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* LEFT COLUMN: FAQ & SEARCH */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-display text-slate-800">Centre d'Aide & FAQ</h2>
                <p className="text-sm text-slate-500">Trouvez des réponses immédiates sur la logistique internationale</p>
              </div>
            </div>

            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher une question (douane, TVA, OEA...)"
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 rounded-lg text-sm transition-all text-slate-800"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                id="faq-search-input"
              />
            </div>

            {/* FAQ Accordion */}
            <div className="space-y-2" id="faq-accordion">
              {filteredFaqs.map((faq, idx) => (
                <div key={idx} className="border border-slate-100 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                    className="w-full px-4 py-3.5 bg-slate-50/50 hover:bg-slate-50 text-left flex justify-between items-center transition-colors cursor-pointer"
                  >
                    <span className="font-semibold text-slate-700 text-sm">{faq.q}</span>
                    {openFaqIndex === idx ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                  {openFaqIndex === idx && (
                    <div className="px-4 py-3.5 bg-white text-xs text-slate-500 leading-relaxed border-t border-slate-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
              {filteredFaqs.length === 0 && (
                <p className="text-center py-6 text-sm text-slate-400">Aucun résultat pour votre recherche.</p>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SUPPORT TICKETS LIST */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-indigo-600" /> Vos Tickets Support
              </h3>
              <button
                onClick={() => onNavigate('nouveau-ticket')}
                className="p-1 text-indigo-600 hover:text-indigo-800 transition-colors"
                title="Ouvrir un ticket"
                id="btn-open-ticket-wizard"
              >
                <PlusCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1" id="tickets-list">
              {tickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicketId(selectedTicketId === t.id ? null : t.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedTicketId === t.id
                      ? 'border-indigo-500 bg-indigo-50/30 shadow-xs'
                      : 'border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-mono text-slate-400 font-bold">#{t.id}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      t.status === 'resolu'
                        ? 'bg-emerald-50 text-emerald-600'
                        : t.status === 'en_cours'
                        ? 'bg-blue-50 text-blue-600'
                        : 'bg-amber-50 text-amber-700'
                    }`}>
                      {t.status === 'resolu' ? 'Résolu' : t.status === 'en_cours' ? 'En cours' : 'Ouvert'}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-800 mt-1 truncate">{t.subject}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">{t.date}</p>
                </div>
              ))}
              {tickets.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Aucun ticket ouvert.
                </div>
              )}
            </div>
          </div>

          {/* ACTIVE TICKET THREAD IN-PLACE PREVIEW */}
          {selectedTicket && (
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="font-bold text-slate-800 text-xs">Fil de discussion #{selectedTicket.id}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate">{selectedTicket.subject}</p>
              </div>

              {/* Message history */}
              <div className="space-y-3 max-h-[240px] overflow-y-auto pr-1 text-xs">
                {selectedTicket.responses.map((resp, i) => (
                  <div
                    key={i}
                    className={`p-2.5 rounded-xl max-w-[85%] ${
                      resp.sender === 'user'
                        ? 'bg-indigo-600 text-white ml-auto'
                        : 'bg-slate-100 text-slate-800 mr-auto'
                    }`}
                  >
                    <p className="leading-relaxed">{resp.message}</p>
                    <span className={`block text-[8px] text-right mt-1 ${resp.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'}`}>
                      {resp.date.substring(11, 16)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Quick reply form */}
              {selectedTicket.status !== 'resolu' && (
                <form onSubmit={handleSendResponse} className="flex gap-1">
                  <input
                    type="text"
                    placeholder="Écrire une réponse..."
                    className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    required
                  />
                  <button
                    type="submit"
                    className="p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
