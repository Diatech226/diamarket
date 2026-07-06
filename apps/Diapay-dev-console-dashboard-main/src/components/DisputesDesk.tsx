import React, { useState, useEffect } from "react";
import { Dispute } from "../types";
import { 
  ShieldAlert, 
  Upload, 
  Clock, 
  User, 
  Calendar, 
  FileText, 
  CheckCircle, 
  X, 
  Check, 
  AlertTriangle,
  Loader2,
  Trash2
} from "lucide-react";

interface DisputesDeskProps {
  onRefreshBalance: () => void;
}

export default function DisputesDesk({ onRefreshBalance }: DisputesDeskProps) {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [loading, setLoading] = useState(false);
  const [submittingEvidence, setSubmittingEvidence] = useState(false);
  const [acceptingDispute, setAcceptingDispute] = useState(false);
  
  // File upload simulation states
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [customFile, setCustomFile] = useState("");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/disputes");
      const data = await res.json();
      setDisputes(data);
      if (data.length > 0) {
        setSelectedDispute(data[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const handleUploadFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customFile) return;
    setUploadedFiles([...uploadedFiles, customFile]);
    setCustomFile("");
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const handleSubmitEvidence = async () => {
    if (!selectedDispute) return;
    setSubmittingEvidence(true);
    setActionSuccess(null);

    try {
      const res = await fetch(`/api/v1/disputes/${selectedDispute.id}/evidence`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          files: uploadedFiles.length > 0 ? uploadedFiles : ["signed_dakar_hub_receipt.pdf"]
        })
      });

      if (res.ok) {
        setActionSuccess("evidence_submitted");
        setUploadedFiles([]);
        fetchDisputes();
        setTimeout(() => setActionSuccess(null), 2500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingEvidence(false);
    }
  };

  const handleAcceptDispute = async () => {
    if (!selectedDispute) return;
    if (!window.confirm("Are you sure you want to concede this dispute? This will immediately refund the customer's payment from your escrow ledger balance and apply a card network dispute fee (15,000 XOF).")) {
      return;
    }

    setAcceptingDispute(true);
    setActionSuccess(null);

    try {
      const res = await fetch(`/api/v1/disputes/${selectedDispute.id}/accept`, {
        method: "POST"
      });

      if (res.ok) {
        setActionSuccess("dispute_conceded");
        onRefreshBalance();
        fetchDisputes();
        setTimeout(() => setActionSuccess(null), 2500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAcceptingDispute(false);
    }
  };

  return (
    <div id="disputes-desk-container" className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* List section */}
      <div className="lg:col-span-5 bg-white border border-gray-100 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
        <div>
          <h3 className="font-display font-semibold text-gray-800 text-lg mb-1">Acquirer Chargebacks & Disputes</h3>
          <p className="text-xs text-gray-400 mb-5">Acquiring banks trigger holdbacks automatically upon cardholder fraud reports.</p>

          <div className="space-y-3.5">
            {loading ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-gray-300" /></div>
            ) : disputes.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-10 font-medium">No disputes logged. Your operations are risk-free!</p>
            ) : (
              disputes.map((d) => (
                <div
                  key={d.id}
                  id={`dispute-item-${d.id}`}
                  onClick={() => setSelectedDispute(d)}
                  className={`p-4 rounded-xl border transition cursor-pointer ${
                    selectedDispute?.id === d.id
                      ? "border-indigo-600 bg-indigo-50/20 shadow-xs"
                      : "border-gray-100 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono text-[10px] text-gray-400 font-bold uppercase">{d.id}</span>
                    <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded uppercase ${
                      d.status === "needs_response"
                        ? "bg-rose-50 text-rose-700 animate-pulse border border-rose-100"
                        : d.status === "under_review"
                        ? "bg-amber-50 text-amber-700 border border-amber-100"
                        : "bg-green-50 text-green-700 border border-green-100"
                    }`}>
                      {d.status.replace("_", " ")}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-gray-800 line-clamp-1">{d.reason}</h4>
                  
                  <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-50 text-[10px] text-gray-500 font-mono">
                    <span>Target transaction:</span>
                    <strong className="text-slate-800">{d.paymentId}</strong>
                  </div>

                  <div className="flex justify-between items-baseline mt-2 font-display">
                    <span className="text-[10px] text-gray-400">Claim size:</span>
                    <strong className="text-sm font-bold text-rose-600">{d.amount.toLocaleString()} {d.currency}</strong>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-6 p-4 bg-rose-50/40 border border-rose-100 rounded-xl">
          <h4 className="text-xs font-bold text-rose-800 flex items-center gap-1.5 mb-1">
            <AlertTriangle size={13} /> Strict Resolution Deadlines
          </h4>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            Card scheme regulations (Visa/Mastercard) allot a strict <strong>8-day window</strong> to submit local delivery documentation before claim settlement locks permanently.
          </p>
        </div>
      </div>

      {/* Detail pane */}
      <div className="lg:col-span-7 bg-white border border-gray-100 rounded-3xl p-8 shadow-xs">
        {selectedDispute ? (
          <div className="space-y-6">
            {/* Header stats */}
            <div className="border-b border-gray-50 pb-5">
              <div className="flex justify-between items-center flex-wrap gap-2 mb-2">
                <span className="text-xs font-mono font-bold tracking-widest text-indigo-600 uppercase">Dispute Desk Workspace</span>
                <span className="text-xs font-mono bg-slate-100 px-2.5 py-1 rounded-md text-gray-600">
                  Ref: {selectedDispute.id}
                </span>
              </div>
              <h2 className="text-xl font-display font-semibold text-gray-800">{selectedDispute.reason}</h2>
              <p className="text-xs text-gray-400 mt-1">Acquired from Senegalese Visa processor terminal.</p>
            </div>

            {/* General parameters */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-500">
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase block mb-0.5">Claim Amount</span>
                <strong className="text-rose-600 text-sm font-bold">{selectedDispute.amount.toLocaleString()} {selectedDispute.currency}</strong>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase block mb-0.5">Customer</span>
                <strong className="text-slate-800">{selectedDispute.customerIdentifier}</strong>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase block mb-0.5">Dispute Opened</span>
                <strong className="text-slate-800">{selectedDispute.createdAt.substring(0, 10)}</strong>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase block mb-0.5">Response Deadline</span>
                <strong className="text-slate-800">{selectedDispute.deadline.substring(0, 10)}</strong>
              </div>
            </div>

            {/* Timeline progression */}
            <div>
              <h4 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider mb-3">Case History Timeline</h4>
              <div className="space-y-3 font-sans">
                {selectedDispute.timeline.map((item, index) => (
                  <div key={index} className="flex gap-3 text-xs">
                    <span className="text-gray-400 font-mono text-[10px] pt-0.5 whitespace-nowrap w-24 select-none">{item.date}</span>
                    <div className="flex flex-col items-center">
                      <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5 ${
                        item.type === "alert" ? "bg-rose-500" : "bg-indigo-600"
                      }`}></span>
                      {index < selectedDispute.timeline.length - 1 ? <span className="w-0.5 bg-gray-100 flex-1 my-1"></span> : null}
                    </div>
                    <div className="bg-slate-50/60 border border-slate-100 rounded-xl p-3 flex-1">
                      <strong className="text-gray-800 block text-[11px]">{item.title}</strong>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Panel based on status */}
            {selectedDispute.status !== "resolved" ? (
              <div className="space-y-4 pt-4 border-t border-gray-50">
                {/* Evidence uploads */}
                <div>
                  <h4 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider mb-2">Upload Verification Documentation</h4>
                  
                  {/* File Upload simulator */}
                  <form onSubmit={handleUploadFile} className="flex gap-2 mb-3">
                    <input 
                      type="text" 
                      id="file-name-input"
                      placeholder="e.g., signed_delivery_receipt_client.pdf"
                      value={customFile}
                      onChange={(e) => setCustomFile(e.target.value)}
                      className="flex-1 text-xs border border-gray-200 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50"
                    />
                    <button 
                      id="add-file-btn"
                      type="submit"
                      className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 rounded-xl transition"
                    >
                      Attach
                    </button>
                  </form>

                  {/* Attached files list */}
                  {uploadedFiles.length > 0 && (
                    <div className="bg-indigo-50/20 border border-indigo-100 rounded-xl p-3 space-y-1.5 mb-3">
                      <span className="text-[10px] text-indigo-600 font-bold block uppercase mb-1">Attached Files ({uploadedFiles.length})</span>
                      {uploadedFiles.map((file, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-white p-2 rounded-lg border border-gray-100 text-xs text-gray-700">
                          <span className="font-mono flex items-center gap-1.5">
                            <FileText size={12} className="text-slate-400" />
                            {file}
                          </span>
                          <button 
                            id={`remove-file-btn-${idx}`}
                            onClick={() => handleRemoveFile(idx)} 
                            className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded transition"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Drag drop mockup area */}
                  <div 
                    onClick={() => setUploadedFiles([...uploadedFiles, "delivery_bill_signed_dakar.pdf", "merchant_invoice_12019.pdf"])}
                    className="border-2 border-dashed border-gray-200 hover:border-indigo-500 bg-slate-50/50 hover:bg-indigo-50/10 p-6 rounded-2xl text-center cursor-pointer transition"
                  >
                    <Upload className="mx-auto text-gray-400 mb-2" size={20} />
                    <span className="text-xs font-semibold text-gray-700 block">Drag & drop files here</span>
                    <span className="text-[10px] text-gray-400 mt-1 block">or click to auto-attach standard proof (delivery invoice + receipts)</span>
                  </div>
                </div>

                {/* Submition statuses */}
                {actionSuccess === "evidence_submitted" && (
                  <div className="bg-green-100 text-green-700 border border-green-200 rounded-xl p-3 text-center text-xs font-semibold flex items-center justify-center gap-2">
                    <CheckCircle size={15} /> Evidence formal submission completed! Cases updated.
                  </div>
                )}

                {actionSuccess === "dispute_conceded" && (
                  <div className="bg-amber-100 text-amber-700 border border-amber-200 rounded-xl p-3 text-center text-xs font-semibold flex items-center justify-center gap-2">
                    <CheckCircle size={15} /> Case Conceded. Reversal entries dispatched.
                  </div>
                )}

                {/* Submit Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  <button
                    id="submit-dispute-evidence-btn"
                    onClick={handleSubmitEvidence}
                    disabled={submittingEvidence}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold p-3.5 rounded-xl transition flex items-center justify-center gap-1.5"
                  >
                    {submittingEvidence ? <Loader2 size={14} className="animate-spin" /> : null}
                    Submit Evidence to Acquirer
                  </button>
                  <button
                    id="concede-dispute-btn"
                    onClick={handleAcceptDispute}
                    disabled={acceptingDispute}
                    className="bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold p-3.5 rounded-xl transition flex items-center justify-center gap-1.5"
                  >
                    {acceptingDispute ? <Loader2 size={14} className="animate-spin" /> : null}
                    Concede Claim (Auto-Refund)
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-100 text-green-700 p-5 rounded-2xl text-center space-y-2">
                <CheckCircle className="mx-auto text-green-600" size={24} />
                <h4 className="text-sm font-semibold">Dispute Case Settled & Closed</h4>
                <p className="text-xs text-green-600/80 leading-relaxed">
                  The chargeback holds have been successfully processed, resolved and documented in your immutable general ledger.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center py-10">
            <ShieldAlert className="text-gray-300 mb-2" size={28} />
            <p className="text-xs text-gray-400">Please select a dispute from the left register panel to view detail timeline and respond.</p>
          </div>
        )}
      </div>
    </div>
  );
}
