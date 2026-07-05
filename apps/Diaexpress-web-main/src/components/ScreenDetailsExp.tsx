import React from 'react';
import { motion } from 'motion/react';
import { Package, ArrowLeft, AlertTriangle, FileText, MapPin, Truck, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { Shipment, DocumentItem } from '../types';

interface ScreenDetailsExpProps {
  shipmentId: string | null;
  shipments: Shipment[];
  documents: DocumentItem[];
  onNavigate: (screen: any) => void;
  onSelectShipment: (id: string | null) => void;
}

export default function ScreenDetailsExp({
  shipmentId,
  shipments,
  documents,
  onNavigate,
  onSelectShipment,
}: ScreenDetailsExpProps) {
  const shipment = shipments.find((s) => s.id === shipmentId);

  const handleBack = () => {
    onSelectShipment(null);
    onNavigate('tableau-bord'); // fallback
  };

  if (!shipment) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-slate-400 mx-auto" />
        <h3 className="text-lg font-bold text-slate-800">Aucun colis sélectionné</h3>
        <p className="text-sm text-slate-500">Sélectionnez un colis depuis l'accueil ou le tableau de bord pour afficher ses détails de transit.</p>
        <button
          onClick={() => onNavigate('accueil')}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-xs transition-all cursor-pointer"
        >
          Retourner à l'Accueil
        </button>
      </div>
    );
  }

  // Filter documents belonging to this shipment
  const associatedDocs = documents.filter((doc) => doc.shipmentId === shipment.id);

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 space-y-6" id="screen-details-exp">
      {/* Header Back bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          id="btn-details-back"
        >
          <ArrowLeft className="w-4 h-4" /> Retour au Tableau de Bord
        </button>

        {shipment.status !== 'livre' && shipment.status !== 'litige' && (
          <button
            onClick={() => onNavigate('litige')}
            className="flex items-center gap-1 px-3 py-1.5 border border-rose-200 hover:bg-rose-50 text-rose-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
            id="btn-trigger-dispute"
          >
            <AlertTriangle className="w-4 h-4" /> Déclarer un litige
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: SHIPMENT OVERVIEW & ROUTE */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs space-y-6">
            {/* Status & Tracking Title */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-mono text-lg font-bold text-slate-800 tracking-wider">{shipment.trackingNumber}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Enregistré le {shipment.date} • {shipment.description}</p>
                </div>
              </div>

              <span className={`inline-block self-start sm:self-center text-xs font-bold px-3 py-1.5 rounded-full uppercase ${
                shipment.status === 'douane_bloque'
                  ? 'bg-rose-50 text-rose-600 border border-rose-100'
                  : shipment.status === 'livre'
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                  : shipment.status === 'livraison'
                  ? 'bg-blue-50 text-blue-600 border border-blue-100'
                  : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
              }`}>
                {shipment.status === 'douane_bloque' ? 'Bloqué en Douane' :
                 shipment.status === 'livre' ? 'Livré' :
                 shipment.status === 'livraison' ? 'En livraison' : 'En transit'}
              </span>
            </div>

            {/* ITINERARY ROUTE PATH */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block mb-1">Expéditeur</span>
                <p className="font-bold text-slate-800 text-sm">{shipment.senderName}</p>
                <p className="text-xs text-slate-500 mt-1">{shipment.senderAddress}</p>
                <p className="text-xs text-slate-500">{shipment.senderPostalCode} {shipment.senderCity}, {shipment.senderCountry}</p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block mb-1">Destinataire</span>
                <p className="font-bold text-slate-800 text-sm">{shipment.receiverName}</p>
                <p className="text-xs text-slate-500 mt-1">{shipment.receiverAddress}</p>
                <p className="text-xs text-slate-500">{shipment.receiverPostalCode} {shipment.receiverCity}, {shipment.receiverCountry}</p>
              </div>
            </div>

            {/* WEIGHT & COST SUMMARY */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div className="border border-slate-100 p-3.5 rounded-xl">
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">Poids</span>
                <span className="text-sm font-bold text-slate-800 font-mono mt-0.5 block">{shipment.weight} kg</span>
              </div>
              <div className="border border-slate-100 p-3.5 rounded-xl">
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">Service</span>
                <span className="text-sm font-bold text-slate-800 uppercase mt-0.5 block">{shipment.serviceType}</span>
              </div>
              <div className="border border-slate-100 p-3.5 rounded-xl">
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">Valeur Déclarée</span>
                <span className="text-sm font-bold text-slate-800 font-mono mt-0.5 block">{shipment.declaredValue.toFixed(2)} €</span>
              </div>
              <div className="border border-slate-100 p-3.5 rounded-xl bg-indigo-50/20 border-indigo-100/40">
                <span className="text-[10px] text-indigo-700 font-semibold uppercase tracking-wider block">Frais payés</span>
                <span className="text-sm font-extrabold text-indigo-700 font-mono mt-0.5 block">{shipment.totalCost.toFixed(2)} €</span>
              </div>
            </div>

            {/* CUSTOMS SPECIAL ADVICE */}
            {shipment.status === 'douane_bloque' && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl space-y-2" id="customs-blocker-warning">
                <h4 className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" /> Alerte Douanière - Documents Manquants
                </h4>
                <p className="text-xs text-rose-700 leading-relaxed">
                  Cette marchandise exige une facture commerciale détaillée. Veuillez importer ce justificatif via l'onglet **Gestion des Documents** (ou le menu latéral) pour que notre transitaire agréé transmette le fichier aux autorités de douane de Roissy CDG et débloque l'expédition.
                </p>
                <button
                  onClick={() => onNavigate('documents')}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-semibold transition-colors mt-2 cursor-pointer inline-block"
                >
                  Déposer les documents requis
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: TIMELINE PROGRESSION */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs space-y-4">
            <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
              <Truck className="w-4 h-4 text-indigo-600" /> Historique de suivi
            </h3>

            {/* VERTICAL TIMELINE STEPPER */}
            <div className="relative pl-6 space-y-6 border-l border-slate-200 mt-4 font-sans" id="details-tracking-timeline">
              {shipment.statusHistory.map((hist, idx) => (
                <div key={idx} className="relative">
                  {/* Point icon */}
                  <span className={`absolute -left-[31px] top-1 w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 bg-white ${
                    idx === 0 
                      ? 'border-indigo-600 bg-indigo-50 ring-4 ring-indigo-50' 
                      : 'border-slate-300'
                  }`}>
                    {idx === 0 ? (
                      <span className="w-2 h-2 bg-indigo-600 rounded-full animate-ping"></span>
                    ) : (
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
                    )}
                  </span>

                  <div>
                    <div className="flex justify-between items-baseline">
                      <h4 className={`text-xs font-bold ${idx === 0 ? 'text-indigo-700' : 'text-slate-700'}`}>
                        {hist.label}
                      </h4>
                      <span className="text-[9px] text-slate-400 font-mono">{hist.date.substring(5, 16)}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">{hist.location}</p>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{hist.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ASSOCIATED PAPERS */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs space-y-3">
            <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
              <FileText className="w-4 h-4 text-indigo-600" /> Documents de transport
            </h3>

            <div className="space-y-2" id="associated-docs-list">
              {associatedDocs.map((doc) => (
                <div key={doc.id} className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs text-slate-600 font-medium truncate" title={doc.name}>{doc.name}</span>
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono shrink-0 ml-1">{doc.size}</span>
                </div>
              ))}
              {associatedDocs.length === 0 && (
                <p className="text-[11px] text-slate-400 italic text-center py-2">Aucun fichier déposé pour cette expédition.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
