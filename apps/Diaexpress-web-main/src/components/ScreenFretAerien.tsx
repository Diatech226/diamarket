import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plane, ArrowLeft, ArrowRight, Calculator, CheckCircle, Info, ShieldCheck } from 'lucide-react';

interface ScreenFretAerienProps {
  onNavigate: (screen: any) => void;
}

const AIRPORTS = [
  { code: "CDG", name: "Paris Charles de Gaulle (France)" },
  { code: "JFK", name: "New York John F. Kennedy (USA)" },
  { code: "NRT", name: "Tokyo Narita (Japon)" },
  { code: "LHR", name: "Londres Heathrow (Royaume-Uni)" },
  { code: "FRA", name: "Francfort-sur-le-Main (Allemagne)" },
  { code: "SIN", name: "Singapour Changi (Singapour)" }
];

export default function ScreenFretAerien({
  onNavigate,
}: ScreenFretAerienProps) {
  const [origin, setOrigin] = useState('CDG');
  const [destination, setDestination] = useState('JFK');
  const [weight, setWeight] = useState<number>(120);
  const [volume, setVolume] = useState<number>(0.8);
  const [cargoType, setCargoType] = useState('general');

  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Estimates
  const baseRate = origin === destination ? 0 : 4.5; // per kg
  const fuelSurcharge = 1.25; // per kg
  const securityFee = 0.35; // per kg
  const handlingFee = 75.00; // flat rate

  const weightCost = weight * baseRate;
  const fuelCost = weight * fuelSurcharge;
  const securityCost = weight * securityFee;
  const cargoTypeMultiplier = cargoType === 'hazardous' ? 1.5 : cargoType === 'temperature' ? 1.3 : cargoType === 'fragile' ? 1.2 : 1.0;

  const subtotal = (weightCost + fuelCost + securityCost) * cargoTypeMultiplier + handlingFee;
  const tva = subtotal * 0.20;
  const totalFret = Math.round((subtotal + tva) * 100) / 100;

  const handleBookCargo = () => {
    setBookingSuccess(true);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4" id="screen-fret-aerien">
      {/* Back button */}
      <div className="mb-6">
        <button
          onClick={() => onNavigate('accueil')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          id="btn-fret-back"
        >
          <ArrowLeft className="w-4 h-4" /> Retour à l'Accueil
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ESTIMATOR FORM */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <Plane className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-display text-slate-800">Fret Aérien - DiaExpress</h2>
                <p className="text-sm text-slate-500">Calculateur de cargaison aérienne commerciale et lourde</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Aéroport d'origine</label>
                  <select
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                  >
                    {AIRPORTS.map((ap) => (
                      <option key={ap.code} value={ap.code} disabled={ap.code === destination}>
                        {ap.code} - {ap.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Aéroport de destination</label>
                  <select
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  >
                    {AIRPORTS.map((ap) => (
                      <option key={ap.code} value={ap.code} disabled={ap.code === origin}>
                        {ap.code} - {ap.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Poids de la cargaison (kg)</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={weight}
                    onChange={(e) => setWeight(Math.max(1, parseFloat(e.target.value) || 1))}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Volume estimé (m³)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={volume}
                    onChange={(e) => setVolume(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Nature de la marchandise</label>
                  <select
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={cargoType}
                    onChange={(e) => setCargoType(e.target.value)}
                  >
                    <option value="general">Cargaison Générale (Standard)</option>
                    <option value="hazardous">Produits Dangereux (ADR Classe 9)</option>
                    <option value="fragile">Marchandises Fragiles / Haute valeur</option>
                    <option value="temperature">Sous Température Contrôlée</option>
                  </select>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
                <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Assurance Cargo & Brokerage Inclus
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Notre fret aérien intègre d'office une assurance dommages à hauteur de **25 000 €** par lettre de transport aérien (AWB), ainsi que le traitement douanière accéléré via notre portail de transit certifié.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* PRICING RESULTS & ACTION */}
        <div>
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl flex flex-col justify-between h-full">
            <div>
              <h3 className="font-display font-semibold text-slate-200 border-b border-slate-800 pb-3 mb-4 text-sm flex items-center justify-between">
                <span>Calculateur de fret AWB</span>
                <span className="text-xs text-indigo-400 font-mono">Simulateur</span>
              </h3>

              <div className="space-y-2 text-xs font-mono text-slate-300">
                <div className="flex justify-between">
                  <span>Fret de Base :</span>
                  <span className="text-white">{(weightCost).toFixed(2)} €</span>
                </div>
                <div className="flex justify-between">
                  <span>Surcharge Carburant :</span>
                  <span className="text-white">{(fuelCost).toFixed(2)} €</span>
                </div>
                <div className="flex justify-between">
                  <span>Surcharge Sécurité :</span>
                  <span className="text-white">{(securityCost).toFixed(2)} €</span>
                </div>
                {cargoType !== 'general' && (
                  <div className="flex justify-between text-amber-400">
                    <span>Surcharge Spécifique :</span>
                    <span>x{cargoTypeMultiplier}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Frais Aéroportuaire :</span>
                  <span className="text-white">{handlingFee.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-2 text-slate-400">
                  <span>TVA (20%) :</span>
                  <span className="text-white">{tva.toFixed(2)} €</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-dashed border-slate-800 space-y-4">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Fret Estimé :</span>
                <span className="text-2xl font-bold font-display text-emerald-400">{totalFret.toFixed(2)} €</span>
              </div>

              {!bookingSuccess ? (
                <button
                  onClick={handleBookCargo}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition-all cursor-pointer shadow-md text-center inline-block"
                  id="btn-book-air-cargo"
                >
                  Réserver ce vol cargo
                </button>
              ) : (
                <div className="bg-emerald-950 border border-emerald-800 p-3 rounded-xl text-center space-y-1">
                  <span className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1">
                    <CheckCircle className="w-4 h-4" /> Demande transmise !
                  </span>
                  <p className="text-[10px] text-emerald-200 leading-relaxed">
                    Un conseiller DiaExpress Fret Aérien va vous appeler sous 30 minutes pour finaliser l'enlèvement.
                  </p>
                </div>
              )}
              <p className="text-[9px] text-slate-400 text-center italic">Calcul basé sur les grilles IATA Juillet 2026.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
