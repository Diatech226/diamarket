import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MessageSquare, ArrowLeft, Send, ShieldAlert } from 'lucide-react';
import { SupportTicket } from '../types';

interface ScreenNouveauTicketProps {
  onNavigate: (screen: any) => void;
  onAddTicket: (ticket: SupportTicket) => void;
}

export default function ScreenNouveauTicket({
  onNavigate,
  onAddTicket,
}: ScreenNouveauTicketProps) {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<'facturation' | 'retard' | 'colis_endommage' | 'autre'>('retard');
  const [urgency, setUrgency] = useState<'faible' | 'moyenne' | 'elevee'>('moyenne');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      alert('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    const newTicket: SupportTicket = {
      id: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      subject,
      category,
      description,
      status: 'ouvert',
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      urgency,
      responses: [
        {
          sender: 'user',
          message: description,
          date: new Date().toISOString().replace('T', ' ').substring(0, 16)
        }
      ]
    };

    onAddTicket(newTicket);
    alert('Votre ticket a été créé avec succès ! Nos équipes de transit vont l\'étudier sous 2 heures.');
    onNavigate('aide');
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-4" id="screen-nouveau-ticket">
      {/* Back button */}
      <div className="mb-6">
        <button
          onClick={() => onNavigate('aide')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          id="btn-ticket-back"
        >
          <ArrowLeft className="w-4 h-4" /> Retour au Centre d'Aide
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-xs"
      >
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-display text-slate-800">Ouvrir un Nouveau Ticket</h2>
            <p className="text-sm text-slate-500">Contactez l'assistance technique et douanière DiaExpress</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Catégorie du problème *</label>
              <select
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                required
              >
                <option value="retard">Retard de livraison / Transit</option>
                <option value="facturation">Facturation / Douane / Taxes</option>
                <option value="colis_endommage">Colis endommagé / Litige physique</option>
                <option value="autre">Autre demande générale</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Degré d'urgence *</label>
              <select
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as any)}
                required
              >
                <option value="faible">Faible (Sous 24h)</option>
                <option value="moyenne">Moyenne (Sous 4h)</option>
                <option value="elevee">Élevée (Prioritaire - Sous 2h)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Sujet / Titre *</label>
            <input
              type="text"
              placeholder="Ex : Facture manquante pour l'envoi DIA-2026-003"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Description détaillée *</label>
            <textarea
              placeholder="Saisissez précisément votre problème, incluez les références d'expédition si besoin..."
              rows={6}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="p-3.5 bg-indigo-50 rounded-lg border border-indigo-100 flex gap-2">
            <ShieldAlert className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <p className="text-xs text-indigo-800 leading-relaxed">
              DiaExpress dispose d'une équipe dédiée aux affaires douanières disponible 24/7 pour débloquer les documents de transport non valides aux frontières.
            </p>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors cursor-pointer"
              id="btn-ticket-submit"
            >
              Soumettre le ticket <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
