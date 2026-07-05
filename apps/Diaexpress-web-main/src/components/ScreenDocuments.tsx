import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { FileText, ArrowLeft, Upload, Trash2, CheckCircle, Package, Info, AlertTriangle } from 'lucide-react';
import { DocumentItem, Shipment } from '../types';

interface ScreenDocumentsProps {
  documents: DocumentItem[];
  shipments: Shipment[];
  onAddDocument: (doc: DocumentItem) => void;
  onDeleteDocument: (id: string) => void;
  onNavigate: (screen: any) => void;
}

export default function ScreenDocuments({
  documents,
  shipments,
  onAddDocument,
  onDeleteDocument,
  onNavigate,
}: ScreenDocumentsProps) {
  const [selectedShipmentId, setSelectedShipmentId] = useState('');
  const [docType, setDocType] = useState('Facture Commerciale');
  const [dragActive, setDragActive] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleManualSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleFileProcess = (file: File) => {
    const sizeInKB = Math.round(file.size / 1024);
    const sizeStr = sizeInKB > 1000 ? `${(sizeInKB / 1024).toFixed(1)} MB` : `${sizeInKB} KB`;

    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}`,
      name: file.name,
      type: docType,
      size: sizeStr,
      uploadDate: new Date().toISOString().split('T')[0],
      shipmentId: selectedShipmentId || undefined
    };

    onAddDocument(newDoc);
    setUploadSuccessMsg(`Fichier '${file.name}' importé avec succès !`);
    setTimeout(() => setUploadSuccessMsg(''), 4000);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6" id="screen-documents">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('accueil')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          id="btn-docs-back"
        >
          <ArrowLeft className="w-4 h-4" /> Retour à l'Accueil
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* DRAG AND DROP UPLOADER CONTAINER */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-indigo-600" /> Téléverser un justificatif
            </h3>

            {/* Form Settings */}
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-medium text-slate-500 mb-1">Rattacher à une expédition</label>
                <select
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700"
                  value={selectedShipmentId}
                  onChange={(e) => setSelectedShipmentId(e.target.value)}
                >
                  <option value="">Document général d'entreprise</option>
                  {shipments.map((ship) => (
                    <option key={ship.id} value={ship.id}>
                      {ship.trackingNumber} ({ship.receiverCity})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-medium text-slate-500 mb-1">Type de Document</label>
                <select
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700"
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                >
                  <option value="Facture Commerciale">Facture Commerciale</option>
                  <option value="Déclaration de Douane">Déclaration de Douane</option>
                  <option value="Lettre de Voiture (AWB)">Lettre de Voiture (AWB / LTA)</option>
                  <option value="Certificat d'Origine">Certificat d'Origine EUR-1</option>
                  <option value="Packing List">Packing List / Liste de Colisage</option>
                </select>
              </div>
            </div>

            {/* Drag & Drop zone */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={triggerFileInput}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[140px] ${
                dragActive
                  ? 'border-indigo-600 bg-indigo-50/50'
                  : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50/50'
              }`}
              id="document-drag-drop-zone"
            >
              <Upload className="w-8 h-8 text-slate-400 mb-2" />
              <p className="text-xs font-semibold text-slate-700">Glissez-déposez votre fichier ici</p>
              <p className="text-[10px] text-slate-400 mt-1">Ou cliquez pour parcourir vos dossiers</p>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleManualSelect}
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
              />
            </div>

            {/* Success feedback */}
            {uploadSuccessMsg && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-2.5 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-lg text-[10px] font-medium flex items-center gap-1.5"
                id="doc-upload-success-alert"
              >
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{uploadSuccessMsg}</span>
              </motion.div>
            )}
          </div>
        </div>

        {/* DOCUMENTS LIST */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-display text-slate-800">Gestion des Documents</h2>
                <p className="text-sm text-slate-500">Justificatifs légaux d'exportation, certificats d'origine et factures douanières</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-2">Document</th>
                    <th className="py-3 px-2">Type</th>
                    <th className="py-3 px-2">Expédition liée</th>
                    <th className="py-3 px-2">Taille</th>
                    <th className="py-3 px-2">Date</th>
                    <th className="py-3 px-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100" id="documents-table-body">
                  {documents.map((doc) => {
                    const linkedShip = shipments.find((s) => s.id === doc.shipmentId);
                    return (
                      <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-2 font-semibold text-slate-800 truncate max-w-[140px]" title={doc.name}>
                          {doc.name}
                        </td>
                        <td className="py-3 px-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                            {doc.type}
                          </span>
                        </td>
                        <td className="py-3 px-2 font-mono text-indigo-700 font-medium">
                          {linkedShip ? linkedShip.trackingNumber : <span className="text-slate-400 italic">Général</span>}
                        </td>
                        <td className="py-3 px-2 font-mono text-slate-400">
                          {doc.size}
                        </td>
                        <td className="py-3 px-2 text-slate-500 font-mono">
                          {doc.uploadDate}
                        </td>
                        <td className="py-3 px-2 text-right">
                          <button
                            onClick={() => {
                              if (confirm(`Supprimer le document '${doc.name}' ?`)) {
                                onDeleteDocument(doc.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-all cursor-pointer inline-block"
                            title="Supprimer le document"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {documents.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400 italic">
                        Aucun document téléversé.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
