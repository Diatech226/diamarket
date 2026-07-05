import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CreditCard, ArrowLeft, CheckCircle, TrendingUp, DollarSign, Calendar, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { InvoiceItem } from '../types';

interface ScreenPaiementsProps {
  invoices: InvoiceItem[];
  onPayInvoice: (invoiceId: string) => void;
  onNavigate: (screen: any) => void;
}

// Chart data
const MONTHLY_SPEND_DATA = [
  { month: "Jan", spend: 350 },
  { month: "Féb", spend: 420 },
  { month: "Mar", spend: 290 },
  { month: "Avr", spend: 610 },
  { month: "Mai", spend: 750 },
  { month: "Jun", spend: 580 },
  { month: "Jul", spend: 645.4 }
];

export default function ScreenPaiements({
  invoices,
  onPayInvoice,
  onNavigate,
}: ScreenPaiementsProps) {
  const [successMsg, setSuccessMsg] = useState('');

  const totalSpent = invoices
    .filter((inv) => inv.status === 'paye')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const pendingAmount = invoices
    .filter((inv) => inv.status === 'en_attente')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const handlePay = (invId: string, amount: number) => {
    onPayInvoice(invId);
    setSuccessMsg(`Paiement de ${amount.toFixed(2)} € validé avec succès !`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 space-y-6" id="screen-paiements">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('accueil')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          id="btn-payments-back"
        >
          <ArrowLeft className="w-4 h-4" /> Retour à l'Accueil
        </button>
      </div>

      {/* STATS OVERVIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="payments-metrics">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Montant total réglé</p>
            <h4 className="text-2xl font-bold text-slate-800 font-mono mt-0.5">{totalSpent.toFixed(2)} €</h4>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-amber-50 text-amber-700 rounded-xl">
            <TrendingUp className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Factures en attente</p>
            <h4 className="text-2xl font-bold text-slate-800 font-mono mt-0.5">{pendingAmount.toFixed(2)} €</h4>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-5 rounded-2xl text-white shadow-md flex items-center gap-4">
          <div className="p-3.5 bg-white/10 rounded-xl">
            <CreditCard className="w-6 h-6 text-indigo-400" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-indigo-200 font-medium uppercase tracking-wider">Moyen de prélèvement</p>
            <h4 className="text-sm font-semibold text-slate-100 mt-1">Visa Business •••• 9245</h4>
          </div>
        </div>
      </div>

      {/* CHARTS & BILLING DETAILS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spend Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-xs space-y-4">
          <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-indigo-600" /> Analyse mensuelle des dépenses fret
          </h3>
          <div className="h-64 w-full" id="monthly-spend-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY_SPEND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip 
                  formatter={(value: any) => [`${value} €`, 'Dépense']} 
                  contentStyle={{ background: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="spend" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Saved payment details card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-800 text-sm pb-3 border-b border-slate-100 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-indigo-600" /> Informations bancaires
            </h3>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Titulaire :</span>
                <span className="font-bold text-slate-800">DUPONT LOGISTICS LTD</span>
              </div>
              <div className="flex justify-between">
                <span>IBAN Prélèvement :</span>
                <span className="font-mono">FR76 3000 ... 4920</span>
              </div>
              <div className="flex justify-between">
                <span>Type de compte :</span>
                <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-bold">PRO DEBIT</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl mt-4 space-y-1 border border-slate-100">
            <span className="text-[10px] font-bold uppercase text-slate-400">Rappel Facturation</span>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Vos factures sont prélevées automatiquement sous un délai de 30 jours fin de mois. Tout retard engendre des pénalités de douane de 1.5%.
            </p>
          </div>
        </div>
      </div>

      {/* INVOICES TABLE */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-display text-slate-800">Historique des Factures</h2>
            <p className="text-sm text-slate-500">Consultez l'historique complet de vos règlements de douane et fret routier</p>
          </div>
        </div>

        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold"
          >
            {successMsg}
          </motion.div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-2">Référence</th>
                <th className="py-3 px-2">Expédition liée</th>
                <th className="py-3 px-2">Montant</th>
                <th className="py-3 px-2">Émission</th>
                <th className="py-3 px-2">Échéance</th>
                <th className="py-3 px-2">Statut</th>
                <th className="py-3 px-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100" id="invoices-table-body">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-2 font-bold text-slate-800">
                    {inv.id}
                  </td>
                  <td className="py-3.5 px-2 font-mono text-indigo-700 font-medium">
                    {inv.trackingNumber}
                  </td>
                  <td className="py-3.5 px-2 font-mono font-bold text-slate-800">
                    {inv.amount.toFixed(2)} €
                  </td>
                  <td className="py-3.5 px-2 text-slate-500 font-mono">
                    {inv.date}
                  </td>
                  <td className="py-3.5 px-2 text-slate-500 font-mono">
                    {inv.dueDate}
                  </td>
                  <td className="py-3.5 px-2">
                    <span className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                      inv.status === 'paye'
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        : 'bg-amber-50 text-amber-700 border border-amber-100'
                    }`}>
                      {inv.status === 'paye' ? 'Réglé' : 'À payer'}
                    </span>
                  </td>
                  <td className="py-3.5 px-2 text-right">
                    {inv.status === 'en_attente' ? (
                      <button
                        onClick={() => handlePay(inv.id, inv.amount)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] rounded-lg shadow-sm transition-colors cursor-pointer"
                        id={`btn-pay-invoice-${inv.id}`}
                      >
                        Payer maintenant
                      </button>
                    ) : (
                      <span className="text-slate-400 font-medium italic text-[10px]">Aucune action</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
