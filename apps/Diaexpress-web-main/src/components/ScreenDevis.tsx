import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ClipboardList, ArrowLeft, ArrowRight, CheckCircle, HelpCircle, AlertCircle, Info } from 'lucide-react';

interface ScreenDevisProps {
  onNavigate: (screen: any) => void;
}

export default function ScreenDevis({
  onNavigate,
}: ScreenDevisProps) {
  const [originCountry, setOriginCountry] = useState('France');
  const [destCountry, setDestCountry] = useState('États-Unis');
  const [weight, setWeight] = useState<number>(10);
  const [cargoType, setCargoType] = useState('standard');
  const [transportMode, setTransportMode] = useState<'air' | 'road'>('road');
  const [quoteSuccess, setQuoteSuccess] = useState(false);

  // Simple pricing algorithm
  const weightFactor = weight * (transportMode === 'air' ? 8.5 : 2.5);
  const typeMultiplier = cargoType === 'hazardous' ? 1.6 : cargoType === 'fragile' ? 1.35 : 1.0;
  const transitCost = Math.round(weightFactor * typeMultiplier * 100) / 100;
  const customsBrokerageCost = transportMode === 'air' ? 45.00 : 15.00;
  const totalQuote = transitCost + customsBrokerageCost;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setQuoteSuccess(true);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4" id="screen-devis">
      {/* Back button */}
      <div className="mb-6">
        <button
          onClick={() => onNavigate('accueil')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          id="btn-devis-back"
        >
          <ArrowLeft className="w-4 h-4" /> Retour à l'Accueil
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* QUOTE FORM */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <ClipboardList className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-display text-slate-800">Demande de Devis Instantané</h2>
                <p className="text-sm text-slate-500">Estimez les coûts globaux de fret et de commission de douane</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Pays de départ</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={originCountry}
                    onChange={(e) => setOriginCountry(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Pays de destination</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={destCountry}
                    onChange={(e) => setDestCountry(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Poids total estimé (kg)</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={weight}
                    onChange={(e) => setWeight(Math.max(1, parseInt(e.target.value) || 1))}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Mode de Transport</label>
                  <select
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={transportMode}
                    onChange={(e) => setTransportMode(e.target.value as any)}
                  >
                    <option value="road">DiaExpress Routier Standard (Europe)</option>
                    <option value="air">Fret Aérien Express (International)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Type de marchandises</label>
                  <select
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={cargoType}
                    onChange={(e) => setCargoType(e.target.value)}
                  >
                    <option value="standard">Marchandises Standard</option>
                    <option value="fragile">Fragile / Haute valeur (Surcharge)</option>
                    <option value="hazardous">Produits Dangereux (Classe ADR)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Instructions d'expédition spéciales</label>
                <textarea
                  placeholder="Ex : Exige un hayon élévateur à la livraison, livraison après 18h..."
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {!quoteSuccess ? (
                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg transition-colors cursor-pointer text-center inline-block"
                  id="btn-calculate-devis"
                >
                  Calculer le prix estimé
                </button>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2" id="devis-success-notice">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Votre demande de cotation a été enregistrée. Un conseiller vous contactera pour valider le tarif ferme.</span>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* PRICE SUMMARY OVERVIEW */}
        <div>
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl flex flex-col justify-between h-full">
            <div>
              <h3 className="font-display font-semibold text-slate-200 border-b border-slate-800 pb-3 mb-4 text-sm flex items-center justify-between">
                <span>Simulation de cotation</span>
                <span className="text-xs text-indigo-400 font-mono">BETA</span>
              </h3>

              <div className="space-y-3.5 text-xs font-mono text-slate-300">
                <div className="flex justify-between">
                  <span>Origine → Dest :</span>
                  <span className="text-white text-right truncate max-w-[150px]" title={`${originCountry} -> ${destCountry}`}>
                    {originCountry} → {destCountry}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Fret principal :</span>
                  <span className="text-white">{transitCost.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between">
                  <span>Commission douane :</span>
                  <span className="text-white">{customsBrokerageCost.toFixed(2)} €</span>
                </div>
                {cargoType !== 'standard' && (
                  <div className="flex justify-between text-amber-400 font-bold">
                    <span>Surcharge type :</span>
                    <span>x{typeMultiplier}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-slate-800 pt-3 text-slate-400">
                  <span>Éco-participation :</span>
                  <span className="text-white">Gratuit (Charte OEA)</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-dashed border-slate-800 space-y-4">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Estimé HT :</span>
                <span className="text-2xl font-bold font-display text-emerald-400">{totalQuote.toFixed(2)} €</span>
              </div>
              
              <button
                type="button"
                onClick={() => onNavigate('creer-itineraire')}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition-all cursor-pointer text-center flex items-center justify-center gap-1.5"
                id="btn-devis-proceed"
              >
                Passer au formulaire d'envoi <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <p className="text-[9px] text-slate-400 text-center italic">Ces tarifs sont estimatifs et soumis à fluctuation des carburants.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
