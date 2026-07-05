import React, { useState } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, ArrowLeft, Send, ShieldAlert, CheckCircle, Package } from 'lucide-react';
import { Shipment } from '../types';

interface ScreenLitigeProps {
  shipments: Shipment[];
  onNavigate: (screen: any) => void;
  onRaiseDispute: (shipmentId: string, description: string, amount: number) => void;
}

export default function ScreenLitige({
  shipments,
  onNavigate,
  onRaiseDispute,
}: ScreenLitigeProps) {
  const [selectedShipId, setSelectedShipId] = useState('');
  const [issueType, setIssueType] = useState('damaged');
  const [requestedAmount, setRequestedAmount] = useState<number>(100);
  const [disputeDesc, setDisputeDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Filter non-delivered shipments, or any shipments really
  const eligibleShipments = shipments.filter(s => s.status !== 'litige');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShipId || !disputeDesc.trim()) {
      alert('Veuillez remplir les informations requises.');
      return;
    }

    setSubmitting(true);
    
    // Simulate API delay
    setTimeout(() => {
      onRaiseDispute(selectedShipId, disputeDesc, requestedAmount);
      setSubmitting(false);
      alert('Litige enregistré ! Un inspecteur de fret DiaExpress va étudier les preuves sous 48h.');
      onNavigate('tableau-bord');
    }, 1000);
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-4" id="screen-litige">
      {/* Back button */}
      <div className="mb-6">
        <button
          onClick={() => onNavigate('accueil')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          id="btn-litige-back"
        >
          <ArrowLeft className="w-4 h-4" /> Retour à l'Accueil
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-xs"
      >
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-display text-slate-800">Déclarer un Litige ou Sinistre</h2>
            <p className="text-sm text-slate-500">Déposez une demande de compensation financière ou d'arbitrage de transit</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Associer à l'expédition *</label>
            <select
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
              value={selectedShipId}
              onChange={(e) => setSelectedShipId(e.target.value)}
              required
            >
              <option value="" disabled>Sélectionner un envoi en cours ou livré</option>
              {eligibleShipments.map((ship) => (
                <option key={ship.id} value={ship.id}>
                  {ship.trackingNumber} ({ship.receiverCity} - {ship.description})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Type de désagrément / sinistre *</label>
              <select
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                required
              >
                <option value="damaged">Marchandise détériorée ou endommagée</option>
                <option value="missing">Colis ou contenu manquant à l'arrivée</option>
                <option value="delayed">Retard de livraison excessif (Remboursement fret)</option>
                <option value="taxes">Erreur ou litige sur calcul taxes douanières</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Montant de compensation réclamé (€) *</label>
              <input
                type="number"
                min="10"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={requestedAmount}
                onChange={(e) => setRequestedAmount(Math.max(10, parseInt(e.target.value) || 10))}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Description détaillée des faits *</label>
            <textarea
              placeholder="Précisez l'état du carton à la livraison, la durée du retard ou les anomalies de taxes constatées..."
              rows={5}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={disputeDesc}
              onChange={(e) => setDisputeDesc(e.target.value)}
              required
            />
          </div>

          {/* SIMULATED PICTURE EVIDENCE UPLOADER */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Uploader des photos de preuve (Optionnel)</label>
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:bg-slate-50 transition-colors cursor-pointer text-slate-400">
              <span className="text-xs font-medium">Glisser-déposer des clichés d'emballages endommagés...</span>
              <p className="text-[10px] text-slate-400 mt-1">Formats PDF, JPG, PNG acceptés.</p>
            </div>
          </div>

          <div className="p-3.5 bg-rose-50 rounded-lg border border-rose-100 flex gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <p className="text-xs text-rose-800 leading-relaxed">
              DiaExpress dispose d'une **garantie d'assurance AXA Cargo** couvrant jusqu'à **50 000 €** par transit de fret. Vos photos et déclarations font l'objet d'un archivage légal pour accréditation.
            </p>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors cursor-pointer disabled:bg-rose-300"
              id="btn-litige-submit"
            >
              {submitting ? 'Traitement en cours...' : 'Déclarer le sinistre'} <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
