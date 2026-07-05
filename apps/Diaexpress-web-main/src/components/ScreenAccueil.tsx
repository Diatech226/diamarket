import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  PlusCircle, 
  Search, 
  TrendingUp, 
  Package, 
  Plane, 
  HelpCircle, 
  FileText, 
  MapPin, 
  AlertTriangle, 
  ArrowRight, 
  CreditCard,
  History,
  FileCheck,
  ShieldCheck,
  ClipboardList
} from 'lucide-react';
import { Shipment, UserProfile } from '../types';

interface ScreenAccueilProps {
  onNavigate: (screen: any) => void;
  profile: UserProfile;
  shipments: Shipment[];
  onSelectShipment: (id: string) => void;
}

export default function ScreenAccueil({
  onNavigate,
  profile,
  shipments,
  onSelectShipment,
}: ScreenAccueilProps) {
  const [trackNumberInput, setTrackNumberInput] = useState('');
  const [trackError, setTrackError] = useState('');

  // Stats
  const totalCount = shipments.length;
  const transitCount = shipments.filter(s => s.status === 'transit' || s.status === 'livraison').length;
  const deliveredCount = shipments.filter(s => s.status === 'livre').length;
  const holdCount = shipments.filter(s => s.status === 'douane_bloque').length;

  const handleQuickTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackNumberInput.trim()) return;
    
    const found = shipments.find(
      (s) => s.trackingNumber.toUpperCase().trim() === trackNumberInput.toUpperCase().trim()
    );
    if (found) {
      onSelectShipment(found.id);
      onNavigate('details-exp');
      setTrackError('');
    } else {
      setTrackError("Aucun colis trouvé avec ce numéro. Essayez 'DIA-2026-003'");
    }
  };

  return (
    <div className="space-y-8 py-6 px-4 max-w-6xl mx-auto" id="screen-accueil">
      {/* 1. HERO BANNER */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-3xl p-6 md:p-10 shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-400/20">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Certifié OEA Commission de Douane
          </span>
          <h1 className="text-3xl md:text-4xl font-bold font-display leading-tight">
            Bonjour, <span className="text-indigo-200">{profile.name}</span>
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Gérez vos flux d'expéditions internationales, calculez vos droits de douane en temps réel et déposez vos documents de transport en toute sécurité.
          </p>

          {/* Quick Tracking Widget */}
          <form onSubmit={handleQuickTrack} className="flex flex-col sm:flex-row gap-2 max-w-lg pt-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Numéro de suivi (ex : DIA-2026-003)..."
                className="w-full pl-9 pr-4 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 hover:border-white/40 focus:bg-white focus:text-slate-950 focus:outline-none rounded-xl text-sm transition-all text-white placeholder-slate-400"
                value={trackNumberInput}
                onChange={(e) => {
                  setTrackNumberInput(e.target.value);
                  if (trackError) setTrackError('');
                }}
                id="tracking-search-input"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium text-sm transition-colors cursor-pointer shadow-md"
              id="btn-quick-track-submit"
            >
              Suivre un colis
            </button>
          </form>
          {trackError && (
            <p className="text-rose-300 text-xs font-medium font-mono pt-1" id="track-search-error">{trackError}</p>
          )}
        </div>

        {/* Decorative elements */}
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-15 hidden md:block">
          <Plane className="w-64 h-64 text-white absolute -right-10 -bottom-10 rotate-12" />
        </div>
      </div>

      {/* 2. STATS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="quick-stats-grid">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Envois</p>
            <h4 className="text-xl font-bold text-slate-800">{totalCount}</h4>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Plane className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">En Transit</p>
            <h4 className="text-xl font-bold text-slate-800">{transitCount}</h4>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Retenu Douane</p>
            <h4 className="text-xl font-bold text-slate-800">{holdCount}</h4>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Colis Livrés</p>
            <h4 className="text-xl font-bold text-slate-800">{deliveredCount}</h4>
          </div>
        </div>
      </div>

      {/* 3. CORE QUICK ACTIONS */}
      <div>
        <h3 className="font-display font-semibold text-slate-800 mb-4 flex items-center gap-2 text-lg">
          <ClipboardList className="w-5 h-5 text-indigo-600" /> Actions Logistiques
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="home-actions-grid">
          {/* Create Shipment */}
          <button
            onClick={() => onNavigate('creer-itineraire')}
            className="group text-left bg-white p-5 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all flex flex-col justify-between h-40 cursor-pointer"
            id="action-btn-create-shipment"
          >
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white rounded-xl flex items-center justify-center transition-colors">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 text-sm group-hover:text-indigo-700 transition-colors">Créer une expédition</h4>
              <p className="text-xs text-slate-500 mt-1">Calculateur de taxes & douane en 3 étapes.</p>
            </div>
          </button>

          {/* Request Quote */}
          <button
            onClick={() => onNavigate('devis')}
            className="group text-left bg-white p-5 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all flex flex-col justify-between h-40 cursor-pointer"
            id="action-btn-request-quote"
          >
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white rounded-xl flex items-center justify-center transition-colors">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 text-sm group-hover:text-indigo-700 transition-colors">Demander un devis</h4>
              <p className="text-xs text-slate-500 mt-1">Évaluation tarifaire instantanée pour fret international.</p>
            </div>
          </button>

          {/* Air Freight */}
          <button
            onClick={() => onNavigate('fret-aerien')}
            className="group text-left bg-white p-5 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all flex flex-col justify-between h-40 cursor-pointer"
            id="action-btn-air-cargo"
          >
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white rounded-xl flex items-center justify-center transition-colors">
              <Plane className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 text-sm group-hover:text-indigo-700 transition-colors">Fret Aérien Express</h4>
              <p className="text-xs text-slate-500 mt-1">Expédition fret aérien lourd et urgent par avion.</p>
            </div>
          </button>

          {/* Documents manager */}
          <button
            onClick={() => onNavigate('documents')}
            className="group text-left bg-white p-5 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all flex flex-col justify-between h-40 cursor-pointer"
            id="action-btn-documents"
          >
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white rounded-xl flex items-center justify-center transition-colors">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 text-sm group-hover:text-indigo-700 transition-colors">Gestion Documents</h4>
              <p className="text-xs text-slate-500 mt-1">Factures commerciales, déclarations et AWB.</p>
            </div>
          </button>
        </div>
      </div>

      {/* 4. RECENTS & EXTRA INFO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Shipments Feed */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-600" /> Suivi récent des colis
            </h3>
            <button
              onClick={() => onNavigate('tableau-bord')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              Voir tout <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100" id="recent-shipments-feed">
            {shipments.slice(0, 3).map((ship) => (
              <div
                key={ship.id}
                onClick={() => {
                  onSelectShipment(ship.id);
                  onNavigate('details-exp');
                }}
                className="py-3.5 flex items-center justify-between hover:bg-slate-50 px-2 rounded-xl transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg text-xs font-semibold ${
                    ship.status === 'douane_bloque'
                      ? 'bg-rose-50 text-rose-600'
                      : ship.status === 'livre'
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-indigo-50 text-indigo-600'
                  }`}>
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-mono text-xs font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">
                      {ship.trackingNumber}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-medium truncate max-w-[200px] sm:max-w-xs">
                      De : {ship.senderCity} → {ship.receiverCity} ({ship.receiverCountry})
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                    ship.status === 'douane_bloque'
                      ? 'bg-rose-50 text-rose-600 border border-rose-100'
                      : ship.status === 'livre'
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                      : ship.status === 'livraison'
                      ? 'bg-blue-50 text-blue-600 border border-blue-100'
                      : 'bg-amber-50 text-amber-700 border border-amber-100'
                  }`}>
                    {ship.status === 'douane_bloque' ? 'Bloqué Douane' :
                     ship.status === 'livre' ? 'Livré' :
                     ship.status === 'livraison' ? 'En livraison' : 'Transit'}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1 font-mono">{ship.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Support & Billing card combo */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl p-5 border border-indigo-100 shadow-xs flex flex-col justify-between h-44">
            <div>
              <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md mb-2">Facturation</span>
              <h4 className="font-semibold text-slate-800 text-sm">Gestion des factures</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">Retrouvez toutes vos factures, relevés d'exportation et gérez vos moyens de paiement.</p>
            </div>
            <button
              onClick={() => onNavigate('paiements')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1 mt-2 cursor-pointer self-start"
            >
              Mes paiements <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between h-44">
            <div>
              <div className="flex gap-2 items-center mb-2">
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">Assistance</span>
                <span className="text-[10px] text-indigo-600 font-mono font-medium">Réponse sous 2h</span>
              </div>
              <h4 className="font-semibold text-slate-800 text-sm">Besoin d'aide logistique ?</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">Déposez un ticket d'aide ou contactez notre cellule d'accompagnement de douane.</p>
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => onNavigate('aide')}
                className="text-xs font-semibold text-slate-600 hover:text-indigo-600 cursor-pointer"
              >
                Centre d'aide
              </button>
              <span className="text-slate-300">|</span>
              <button
                onClick={() => onNavigate('nouveau-ticket')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
              >
                Ouvrir un ticket
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
