import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Package, Search, SlidersHorizontal, ArrowRight, Eye, RefreshCw, BarChart4, AlertTriangle, CheckCircle, Plane } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Shipment } from '../types';

interface ScreenTableauBordProps {
  shipments: Shipment[];
  onSelectShipment: (id: string) => void;
  onNavigate: (screen: any) => void;
}

// Chart data: Shipments count by country destination
const FREIGHT_VOLUME_DATA = [
  { dest: "USA", colis: 15 },
  { dest: "ALL", colis: 28 },
  { dest: "FRA", colis: 42 },
  { dest: "JAP", colis: 8 },
  { dest: "SIN", colis: 12 },
  { dest: "R-U", colis: 19 }
];

export default function ScreenTableauBord({
  shipments,
  onSelectShipment,
  onNavigate,
}: ScreenTableauBordProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'transit' | 'customs_hold' | 'delivered'>('all');

  // Search and Filter logic
  const filteredShipments = shipments.filter((ship) => {
    const matchesSearch =
      ship.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ship.senderCity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ship.receiverCity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ship.description.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'transit') {
      return ship.status === 'transit' || ship.status === 'livraison' || ship.status === 'preparation';
    }
    if (activeTab === 'customs_hold') {
      return ship.status === 'douane_bloque';
    }
    if (activeTab === 'delivered') {
      return ship.status === 'livre';
    }

    return true; // 'all'
  });

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-6" id="screen-tableau-bord">
      {/* 1. ANALYTICS CHARTS HERO ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Stats Widget */}
        <div className="bg-gradient-to-br from-indigo-900 via-indigo-850 to-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-300">Statistiques Logistiques</span>
            <h3 className="text-xl font-bold font-display">Performance de Transit</h3>
            <p className="text-xs text-indigo-200">Délai moyen de dédouanement DiaExpress : **1.8 heure** (Certifié OEA).</p>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-6 pt-6 border-t border-white/10 text-center font-mono">
            <div>
              <span className="text-[10px] text-indigo-300 block">Total</span>
              <span className="text-lg font-bold text-white">{shipments.length}</span>
            </div>
            <div>
              <span className="text-[10px] text-indigo-300 block">En transit</span>
              <span className="text-lg font-bold text-sky-300">{shipments.filter(s => s.status !== 'livre' && s.status !== 'douane_bloque').length}</span>
            </div>
            <div>
              <span className="text-[10px] text-indigo-300 block">Douane</span>
              <span className="text-lg font-bold text-amber-300">{shipments.filter(s => s.status === 'douane_bloque').length}</span>
            </div>
          </div>
        </div>

        {/* Volume chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-xs space-y-3">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <BarChart4 className="w-4 h-4 text-indigo-600" /> Flux de fret par zone de destination (Nombre d'envois)
          </h4>
          <div className="h-32 w-full" id="freight-volume-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={FREIGHT_VOLUME_DATA} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="dest" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip 
                  formatter={(value: any) => [`${value} colis`, 'Volume']}
                  contentStyle={{ background: '#0f172a', borderRadius: '6px', color: '#fff', fontSize: '11px', padding: '4px 8px' }}
                />
                <Bar dataKey="colis" fill="#4f46e5" radius={[3, 3, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 2. SHIPMENTS FILTER BAR */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* SEARCH FIELD */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par tracking, ville, contenu..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 rounded-xl text-xs transition-all text-slate-800"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              id="shipments-search-input"
            />
          </div>

          {/* FILTER TABS */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0" id="shipments-filter-tabs">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold shrink-0 cursor-pointer ${
                activeTab === 'all' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
              }`}
            >
              Tous ({shipments.length})
            </button>
            <button
              onClick={() => setActiveTab('transit')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold shrink-0 cursor-pointer ${
                activeTab === 'transit' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
              }`}
            >
              En transit ({shipments.filter(s => s.status !== 'livre' && s.status !== 'douane_bloque').length})
            </button>
            <button
              onClick={() => setActiveTab('customs_hold')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold shrink-0 cursor-pointer ${
                activeTab === 'customs_hold' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
              }`}
            >
              Bloqué Douane ({shipments.filter(s => s.status === 'douane_bloque').length})
            </button>
            <button
              onClick={() => setActiveTab('delivered')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold shrink-0 cursor-pointer ${
                activeTab === 'delivered' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
              }`}
            >
              Livré ({shipments.filter(s => s.status === 'livre').length})
            </button>
          </div>
        </div>

        {/* SHIPMENTS LIST TABLE */}
        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">Numéro de suivi</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Itinéraire (Ville)</th>
                <th className="py-3 px-3">Service</th>
                <th className="py-3 px-3">Contenu</th>
                <th className="py-3 px-3">Statut</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100" id="shipments-table-body">
              {filteredShipments.map((ship) => (
                <tr key={ship.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="py-3.5 px-3 font-mono font-bold text-indigo-700 group-hover:text-indigo-900 transition-colors">
                    {ship.trackingNumber}
                  </td>
                  <td className="py-3.5 px-3 text-slate-400 font-mono">
                    {ship.date}
                  </td>
                  <td className="py-3.5 px-3 text-slate-700 font-medium">
                    {ship.senderCity} → {ship.receiverCity}
                  </td>
                  <td className="py-3.5 px-3 uppercase text-[10px] font-semibold text-slate-500">
                    {ship.serviceType === 'air' ? 'Fret Aérien' : ship.serviceType === 'premium' ? 'Premium' : 'Standard'}
                  </td>
                  <td className="py-3.5 px-3 text-slate-500 truncate max-w-[150px]" title={ship.description}>
                    {ship.description}
                  </td>
                  <td className="py-3.5 px-3">
                    <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                      ship.status === 'douane_bloque'
                        ? 'bg-rose-50 text-rose-600 border border-rose-100'
                        : ship.status === 'livre'
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        : ship.status === 'livraison'
                        ? 'bg-blue-50 text-blue-600 border border-blue-100'
                        : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                    }`}>
                      {ship.status === 'douane_bloque' ? 'Bloqué Douane' :
                       ship.status === 'livre' ? 'Livré' :
                       ship.status === 'livraison' ? 'En livraison' : 'Transit'}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <button
                      onClick={() => {
                        onSelectShipment(ship.id);
                        onNavigate('details-exp');
                      }}
                      className="p-1.5 bg-slate-50 border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-300 rounded-lg shadow-sm transition-all cursor-pointer inline-flex items-center gap-1 font-semibold text-[10px]"
                      id={`btn-view-shipment-${ship.trackingNumber}`}
                    >
                      <Eye className="w-3.5 h-3.5" /> Suivre
                    </button>
                  </td>
                </tr>
              ))}
              {filteredShipments.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 italic">
                    Aucune expédition ne correspond à vos filtres ou à votre recherche.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
