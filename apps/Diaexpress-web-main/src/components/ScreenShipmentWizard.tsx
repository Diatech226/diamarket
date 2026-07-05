import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Package, ShieldAlert, ArrowLeft, ArrowRight, CheckCircle, Calculator, Info } from 'lucide-react';
import { Shipment, Address } from '../types';

interface ScreenShipmentWizardProps {
  step: 'itineraire' | 'service' | 'douane';
  onNavigate: (screen: any) => void;
  addresses: Address[];
  onAddShipment: (shipment: Shipment) => void;
}

export default function ScreenShipmentWizard({
  step,
  onNavigate,
  addresses,
  onAddShipment,
}: ScreenShipmentWizardProps) {
  // Wizard local state
  const [senderName, setSenderName] = useState('Dupont Industries');
  const [senderAddress, setSenderAddress] = useState('45 Avenue des Champs-Élysées');
  const [senderCity, setSenderCity] = useState('Paris');
  const [senderPostalCode, setSenderPostalCode] = useState('75008');
  const [senderCountry, setSenderCountry] = useState('France');

  const [receiverName, setReceiverName] = useState('');
  const [receiverAddress, setReceiverAddress] = useState('');
  const [receiverCity, setReceiverCity] = useState('');
  const [receiverPostalCode, setReceiverPostalCode] = useState('');
  const [receiverCountry, setReceiverCountry] = useState('');

  const [serviceType, setServiceType] = useState<'standard' | 'premium' | 'air'>('standard');
  const [weight, setWeight] = useState<number>(2.5);
  const [length, setLength] = useState<number>(30);
  const [width, setWidth] = useState<number>(20);
  const [height, setHeight] = useState<number>(15);
  const [description, setDescription] = useState('');

  const [itemCategory, setItemCategory] = useState<'electronique' | 'vetements' | 'documents' | 'autre'>('electronique');
  const [declaredValue, setDeclaredValue] = useState<number>(150);

  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [createdTrackingNum, setCreatedTrackingNum] = useState('');

  // Auto fill sender from saved address
  const handleSelectSenderAddress = (addrId: string) => {
    const addr = addresses.find((a) => a.id === addrId);
    if (addr) {
      setSenderName(addr.name);
      setSenderAddress(addr.addressLine);
      setSenderCity(addr.city);
      setSenderPostalCode(addr.postalCode);
      setSenderCountry(addr.country);
    }
  };

  // Auto fill receiver from saved address
  const handleSelectReceiverAddress = (addrId: string) => {
    const addr = addresses.find((a) => a.id === addrId);
    if (addr) {
      setReceiverName(addr.name);
      setReceiverAddress(addr.addressLine);
      setReceiverCity(addr.city);
      setReceiverPostalCode(addr.postalCode);
      setReceiverCountry(addr.country);
    }
  };

  // Customs calculations
  const getTaxRate = () => {
    switch (itemCategory) {
      case 'electronique': return 0.08; // 8%
      case 'vetements': return 0.12; // 12%
      case 'documents': return 0.00; // 0%
      case 'autre': return 0.05; // 5%
    }
  };

  const customsDuty = Math.round(declaredValue * getTaxRate() * 100) / 100;
  const tva = Math.round((declaredValue + customsDuty) * 0.20 * 100) / 100; // 20% TVA
  const serviceCost = serviceType === 'air' ? 180 : serviceType === 'premium' ? 75 : 35;
  const totalCost = Math.round((serviceCost + customsDuty + tva) * 100) / 100;

  const handleNextFromItineraire = (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiverName || !receiverAddress || !receiverCity || !receiverPostalCode || !receiverCountry) {
      alert('Veuillez remplir toutes les informations du destinataire.');
      return;
    }
    onNavigate('creer-service');
  };

  const handleNextFromService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description) {
      alert('Veuillez fournir une brève description du contenu.');
      return;
    }
    onNavigate('creer-douane');
  };

  const handleConfirmOrder = () => {
    const trackingNum = `DIA-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newShip: Shipment = {
      id: `ship-${Date.now()}`,
      trackingNumber: trackingNum,
      senderName,
      senderAddress,
      senderCity,
      senderPostalCode,
      senderCountry,
      receiverName,
      receiverAddress,
      receiverCity,
      receiverPostalCode,
      receiverCountry,
      serviceType,
      status: 'preparation',
      date: new Date().toISOString().split('T')[0],
      weight,
      length,
      width,
      height,
      declaredValue,
      customsDuty,
      tva,
      totalCost,
      description,
      statusHistory: [
        {
          status: 'preparation',
          label: 'Commande enregistrée',
          date: new Date().toISOString().replace('T', ' ').substring(0, 16),
          location: senderCity,
          description: 'Expédition créée et taxes de douane calculées. En attente de collecte.'
        }
      ]
    };

    onAddShipment(newShip);
    setCreatedTrackingNum(trackingNum);
    setShowSuccessOverlay(true);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Progress Stepper */}
      <div className="mb-8" id="shipping-stepper">
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-center flex-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
              step === 'itineraire' ? 'bg-indigo-600 text-white shadow-lg ring-4 ring-indigo-100' : 'bg-indigo-100 text-indigo-700'
            }`}>
              1
            </div>
            <span className="text-xs font-medium mt-2 text-gray-600">Itinéraire</span>
          </div>
          <div className="h-1 bg-gray-200 flex-1 -mt-5">
            <div className={`h-full bg-indigo-600 transition-all duration-300`} style={{ width: step === 'itineraire' ? '0%' : step === 'service' ? '50%' : '100%' }}></div>
          </div>
          <div className="flex flex-col items-center flex-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
              step === 'service' ? 'bg-indigo-600 text-white shadow-lg ring-4 ring-indigo-100' : step === 'douane' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-400'
            }`}>
              2
            </div>
            <span className="text-xs font-medium mt-2 text-gray-600">Service & Dimensions</span>
          </div>
          <div className="h-1 bg-gray-200 flex-1 -mt-5">
            <div className={`h-full bg-indigo-600 transition-all duration-300`} style={{ width: step === 'douane' ? '100%' : '0%' }}></div>
          </div>
          <div className="flex flex-col items-center flex-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
              step === 'douane' ? 'bg-indigo-600 text-white shadow-lg ring-4 ring-indigo-100' : 'bg-gray-100 text-gray-400'
            }`}>
              3
            </div>
            <span className="text-xs font-medium mt-2 text-gray-600">Douane & Taxes</span>
          </div>
        </div>
      </div>

      {/* STEP 1: ITINERAIRE */}
      {step === 'itineraire' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8"
          id="wizard-step-itineraire"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display text-slate-800">1. Définir l'itinéraire de livraison</h2>
              <p className="text-sm text-slate-500">Saisissez les coordonnées de l'expéditeur et du destinataire</p>
            </div>
          </div>

          <form onSubmit={handleNextFromItineraire} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* SENDER BOX */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-700">Expéditeur (Départ)</h3>
                  <select
                    className="text-xs bg-slate-50 border border-slate-200 text-slate-600 rounded-md py-1 px-2 focus:ring-1 focus:ring-indigo-500"
                    onChange={(e) => handleSelectSenderAddress(e.target.value)}
                    defaultValue=""
                  >
                    <option value="" disabled>Utiliser un carnet d'adresses</option>
                    {addresses.map((addr) => (
                      <option key={addr.id} value={addr.id}>{addr.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Nom / Entreprise</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Adresse postale</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      value={senderAddress}
                      onChange={(e) => setSenderAddress(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Code Postal</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        value={senderPostalCode}
                        onChange={(e) => setSenderPostalCode(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Ville</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        value={senderCity}
                        onChange={(e) => setSenderCity(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Pays</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      value={senderCountry}
                      onChange={(e) => setSenderCountry(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* RECEIVER BOX */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-700">Destinataire (Arrivée)</h3>
                  <select
                    className="text-xs bg-slate-50 border border-slate-200 text-slate-600 rounded-md py-1 px-2 focus:ring-1 focus:ring-indigo-500"
                    onChange={(e) => handleSelectReceiverAddress(e.target.value)}
                    defaultValue=""
                  >
                    <option value="" disabled>Sélectionner une adresse enregistrée</option>
                    {addresses.map((addr) => (
                      <option key={addr.id} value={addr.id}>{addr.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Nom du destinataire / Entreprise</label>
                    <input
                      type="text"
                      placeholder="Ex: John Doe"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      value={receiverName}
                      onChange={(e) => setReceiverName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Adresse postale</label>
                    <input
                      type="text"
                      placeholder="Ex: 10 Downing Street"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      value={receiverAddress}
                      onChange={(e) => setReceiverAddress(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Code Postal</label>
                      <input
                        type="text"
                        placeholder="Ex: SW1A 2AA"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        value={receiverPostalCode}
                        onChange={(e) => setReceiverPostalCode(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Ville</label>
                      <input
                        type="text"
                        placeholder="Ex: Londres"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        value={receiverCity}
                        onChange={(e) => setReceiverCity(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Pays</label>
                    <input
                      type="text"
                      placeholder="Ex: Royaume-Uni"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      value={receiverCountry}
                      onChange={(e) => setReceiverCountry(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => onNavigate('accueil')}
                className="px-5 py-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 font-medium text-sm transition-colors"
                id="btn-back-home"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors"
                id="btn-submit-itineraire"
              >
                Continuer vers le service <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* STEP 2: SERVICE & DIMENSIONS */}
      {step === 'service' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8"
          id="wizard-step-service"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display text-slate-800">2. Choisir le service & Dimensions du colis</h2>
              <p className="text-sm text-slate-500">Spécifiez la taille de votre paquet et le niveau d'urgence</p>
            </div>
          </div>

          <form onSubmit={handleNextFromService} className="space-y-6">
            {/* SERVICE SELECTION GRID */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">Service de livraison DiaExpress</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  onClick={() => setServiceType('standard')}
                  className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                    serviceType === 'standard'
                      ? 'border-indigo-600 bg-indigo-50/40 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-sm text-slate-800">DiaExpress Standard</span>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">3-5 Jours</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-4">Livraison routière économique et fiable à travers toute l'Europe.</p>
                  <span className="text-lg font-bold text-slate-800">Dès 35,00 €</span>
                </div>

                <div
                  onClick={() => setServiceType('premium')}
                  className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                    serviceType === 'premium'
                      ? 'border-indigo-600 bg-indigo-50/40 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-sm text-slate-800">DiaExpress Premium</span>
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">1-2 Jours</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-4">Livraison express prioritaire avec garantie de délai de livraison.</p>
                  <span className="text-lg font-bold text-slate-800">Dès 75,00 €</span>
                </div>

                <div
                  onClick={() => setServiceType('air')}
                  className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                    serviceType === 'air'
                      ? 'border-indigo-600 bg-indigo-50/40 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-sm text-slate-800">Fret Aérien Express</span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Le Lendemain</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-4">Transport aérien global ultra-rapide pour vos colis urgents de valeur.</p>
                  <span className="text-lg font-bold text-slate-800">Dès 180,00 €</span>
                </div>
              </div>
            </div>

            {/* WEIGHT & DIMENSIONS */}
            <div className="bg-slate-50 rounded-xl p-4 space-y-4">
              <h3 className="font-semibold text-slate-700 text-sm">Caractéristiques physiques du colis</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Poids (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={weight}
                    onChange={(e) => setWeight(parseFloat(e.target.value) || 0.1)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Longueur (cm)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={length}
                    onChange={(e) => setLength(parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Largeur (cm)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={width}
                    onChange={(e) => setWidth(parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Hauteur (cm)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={height}
                    onChange={(e) => setHeight(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Description du contenu (Requis pour la douane)</label>
              <textarea
                placeholder="Ex: Échantillons commerciaux de pièces de rechange automobile"
                rows={3}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => onNavigate('creer-itineraire')}
                className="flex items-center gap-2 px-5 py-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 font-medium text-sm transition-colors"
                id="btn-back-itineraire"
              >
                <ArrowLeft className="w-4 h-4" /> Retour
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors"
                id="btn-submit-service"
              >
                Continuer vers la Douane <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* STEP 3: DOUANE (CALCUL TAXES) */}
      {step === 'douane' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8"
          id="wizard-step-douane"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display text-slate-800">3. Douane & Calculateur de Taxes</h2>
              <p className="text-sm text-slate-500">Déclarer la valeur du colis pour estimer la TVA et les droits d'importation</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* CUSTOMS DECLARATION FORM */}
            <div className="space-y-5">
              <h3 className="font-semibold text-slate-700 text-sm">Déclaration douanière</h3>
              
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Catégorie de marchandises</label>
                <select
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={itemCategory}
                  onChange={(e) => setItemCategory(e.target.value as any)}
                >
                  <option value="electronique">Électronique / Haute Technologie (Droits de douane : 8%)</option>
                  <option value="vetements">Vêtements / Textiles (Droits de douane : 12%)</option>
                  <option value="documents">Documents professionnels (Exonéré de taxes)</option>
                  <option value="autre">Autres marchandises commerciales (Droits de douane : 5%)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Valeur déclarée (€ EUR)</label>
                <input
                  type="number"
                  min="0"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={declaredValue}
                  onChange={(e) => setDeclaredValue(Math.max(0, parseFloat(e.target.value) || 0))}
                  required
                />
              </div>

              <div className="p-3.5 bg-amber-50 rounded-lg border border-amber-100 flex gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 leading-relaxed">
                  DiaExpress est certifié **OEA (Opérateur Économique Agréé)**. Toutes les déclarations de douane sont transmises automatiquement aux autorités fiscales nationales pour accélérer les procédures de dédouanement de vos expéditions.
                </p>
              </div>
            </div>

            {/* REAL-TIME TAX CALCULATOR TICKET */}
            <div className="bg-slate-900 text-white rounded-xl p-5 shadow-inner flex flex-col justify-between">
              <div>
                <h4 className="font-display font-semibold text-slate-200 border-b border-slate-800 pb-3 mb-4 text-sm flex items-center justify-between">
                  <span>Détail des frais logistiques</span>
                  <span className="text-xs text-indigo-400 font-mono">Calcul en direct</span>
                </h4>

                <div className="space-y-2 text-sm font-mono text-slate-300">
                  <div className="flex justify-between">
                    <span>Frais d'expédition ({serviceType.toUpperCase()}) :</span>
                    <span className="text-white">{serviceCost.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Droits de Douane estimés ({Math.round(getTaxRate() * 100)}%) :</span>
                    <span className="text-white">{customsDuty.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between pb-3 border-b border-slate-800">
                    <span>TVA à l'importation (20%) :</span>
                    <span className="text-white">{tva.toFixed(2)} €</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-dashed border-slate-800">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Tout Compris :</span>
                  <span className="text-2xl font-bold font-display text-emerald-400">{totalCost.toFixed(2)} €</span>
                </div>
                <p className="text-[10px] text-slate-400 text-right italic">Calculateur DiaExpress V3.1. Tous droits inclus.</p>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => onNavigate('creer-service')}
              className="flex items-center gap-2 px-5 py-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 font-medium text-sm transition-colors"
              id="btn-back-service"
            >
              <ArrowLeft className="w-4 h-4" /> Retour
            </button>
            <button
              type="button"
              onClick={handleConfirmOrder}
              className="flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg shadow-md hover:shadow-lg transition-all"
              id="btn-confirm-shipping"
            >
              Confirmer & Payer l'envoi <CheckCircle className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* SUCCESS OVERLAY */}
      {showSuccessOverlay && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl max-w-md w-full p-6 text-center shadow-2xl border border-slate-100"
          >
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold font-display text-slate-900 mb-2">Expédition validée !</h3>
            <p className="text-sm text-slate-500 mb-4">
              Votre colis a été enregistré avec succès sous le numéro de suivi :
            </p>
            <div className="bg-slate-50 font-mono text-indigo-700 font-bold px-4 py-2 rounded-lg border border-indigo-100 text-lg mb-6 tracking-widest inline-block">
              {createdTrackingNum}
            </div>
            
            <p className="text-xs text-slate-400 mb-6">
              Une facture d'un montant de <strong className="text-slate-700">{totalCost.toFixed(2)} €</strong> a été générée et débitée de votre compte.
            </p>

            <button
              onClick={() => {
                setShowSuccessOverlay(false);
                onNavigate('tableau-bord');
              }}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm shadow-md transition-colors"
              id="btn-close-success-overlay"
            >
              Aller au Tableau de Bord
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
