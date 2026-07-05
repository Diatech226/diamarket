import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Plus, Trash2, ArrowLeft, Home, Building2 } from 'lucide-react';
import { Address } from '../types';

interface ScreenAdressesProps {
  addresses: Address[];
  onAddAddress: (address: Address) => void;
  onDeleteAddress: (id: string) => void;
  onNavigate: (screen: any) => void;
}

export default function ScreenAdresses({
  addresses,
  onAddAddress,
  onDeleteAddress,
  onNavigate,
}: ScreenAdressesProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [label, setLabel] = useState('');
  const [name, setName] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('France');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label || !name || !addressLine || !city || !postalCode || !country) {
      alert('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    const newAddr: Address = {
      id: `addr-${Date.now()}`,
      label,
      name,
      addressLine,
      city,
      postalCode,
      country,
      phone
    };

    onAddAddress(newAddr);
    setShowAddForm(false);
    
    // reset form
    setLabel('');
    setName('');
    setAddressLine('');
    setCity('');
    setPostalCode('');
    setPhone('');
    alert('Adresse enregistrée dans le carnet !');
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4" id="screen-adresses">
      {/* Back & Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => onNavigate('accueil')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          id="btn-adresses-back"
        >
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition-all shadow-sm cursor-pointer"
          id="btn-toggle-add-address"
        >
          <Plus className="w-4 h-4" /> {showAddForm ? 'Fermer le formulaire' : 'Nouvelle adresse'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ADD ADDRESS FORM (Shown conditionally) */}
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4 h-fit md:col-span-1"
          >
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-indigo-600" /> Ajouter au carnet
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] font-medium text-slate-500 mb-0.5">Libellé (ex : Bureau Marseille) *</label>
                <input
                  type="text"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-medium text-slate-500 mb-0.5">Nom de l'Entreprise / Contact *</label>
                <input
                  type="text"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-medium text-slate-500 mb-0.5">Adresse postale *</label>
                <input
                  type="text"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-medium text-slate-500 mb-0.5">Code Postal *</label>
                  <input
                    type="text"
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-slate-500 mb-0.5">Ville *</label>
                  <input
                    type="text"
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-medium text-slate-500 mb-0.5">Pays *</label>
                <input
                  type="text"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-medium text-slate-500 mb-0.5">Téléphone</label>
                <input
                  type="text"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                id="btn-save-address"
              >
                Enregistrer l'adresse
              </button>
            </form>
          </motion.div>
        )}

        {/* ADDRESSES BOOK GRID */}
        <div className={`space-y-4 md:col-span-2 ${!showAddForm ? 'md:col-span-3' : ''}`}>
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-display text-slate-800">Carnet d'Adresses - DiaExpress</h2>
                <p className="text-sm text-slate-500">Enregistrez vos points d'enlèvement réguliers et filiales d'import/export</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="addresses-grid">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className="p-5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-between hover:shadow-xs hover:border-slate-200 transition-all relative group"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 uppercase">
                        <Building2 className="w-3 h-3" /> {addr.label}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{addr.name}</h4>
                      <p className="text-xs text-slate-500 mt-1">{addr.addressLine}</p>
                      <p className="text-xs text-slate-500">{addr.postalCode} {addr.city}, {addr.country}</p>
                    </div>
                  </div>

                  {addr.phone && (
                    <p className="text-[10px] text-slate-400 mt-3 font-mono">Tél : {addr.phone}</p>
                  )}

                  {/* Delete button */}
                  <button
                    onClick={() => {
                      if (confirm(`Supprimer l'adresse '${addr.label}' ?`)) {
                        onDeleteAddress(addr.id);
                      }
                    }}
                    className="absolute top-4 right-4 p-1.5 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg shadow-sm border border-slate-150 transition-colors cursor-pointer"
                    title="Supprimer l'adresse"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {addresses.length === 0 && (
              <div className="text-center py-12 text-slate-400 text-sm">
                Aucune adresse enregistrée dans le carnet d'adresses.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
