import React, { useState } from "react";
import { Mail, ShieldAlert, CheckCircle, RotateCcw, ChevronRight, User } from "lucide-react";

export default function NotificationEmails() {
  const [activeTemplate, setActiveTemplate] = useState<"dispute" | "receipt" | "refund">("dispute");

  return (
    <div id="email-templates-hub" className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* Selector list left */}
      <div className="lg:col-span-4 bg-white border border-gray-100 rounded-2xl p-6 shadow-xs">
        <h3 className="font-display font-semibold text-gray-800 text-lg mb-1">Transactional Notifications</h3>
        <p className="text-xs text-gray-400 mb-5">Preview automated notification layouts dispatched to merchants and clients.</p>

        <div className="space-y-2">
          {/* Dispute Mailer Option */}
          <div 
            id="email-tab-dispute"
            onClick={() => setActiveTemplate("dispute")}
            className={`p-3.5 rounded-xl border transition cursor-pointer text-left ${
              activeTemplate === "dispute" 
                ? "border-red-600 bg-red-50/20" 
                : "border-gray-100 hover:border-gray-300 bg-white"
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-mono text-red-600 font-bold">MERCHANT ACTION REQUIRED</span>
              <ShieldAlert size={14} className="text-red-500" />
            </div>
            <h4 className="text-xs font-semibold text-gray-800">New Dispute Case Opened</h4>
            <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">Immediate response requested to protect escrow balances.</p>
          </div>

          {/* Receipt Mailer Option */}
          <div 
            id="email-tab-receipt"
            onClick={() => setActiveTemplate("receipt")}
            className={`p-3.5 rounded-xl border transition cursor-pointer text-left ${
              activeTemplate === "receipt" 
                ? "border-green-600 bg-green-50/20" 
                : "border-gray-100 hover:border-gray-300 bg-white"
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-mono text-green-600 font-bold">CUSTOMER BILLING</span>
              <CheckCircle size={14} className="text-green-500" />
            </div>
            <h4 className="text-xs font-semibold text-gray-800">Payment Settled Receipt</h4>
            <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">Receipt dispatch triggered automatically upon network clearing.</p>
          </div>

          {/* Refund Mailer Option */}
          <div 
            id="email-tab-refund"
            onClick={() => setActiveTemplate("refund")}
            className={`p-3.5 rounded-xl border transition cursor-pointer text-left ${
              activeTemplate === "refund" 
                ? "border-indigo-600 bg-indigo-50/20" 
                : "border-gray-100 hover:border-gray-300 bg-white"
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-mono text-indigo-600 font-bold">FINANCIAL TRANSACTION</span>
              <RotateCcw size={14} className="text-indigo-500" />
            </div>
            <h4 className="text-xs font-semibold text-gray-800">Refund Settlement Succeeded</h4>
            <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">Notifies client and vendor of successful general ledger adjustments.</p>
          </div>
        </div>
      </div>

      {/* Preview panel right */}
      <div className="lg:col-span-8 bg-slate-50 border border-slate-200/60 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
        
        {/* Mock Browser/Email client Frame */}
        <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden text-left">
          {/* Header */}
          <div className="bg-slate-100 p-4 border-b border-slate-200 text-xs font-mono text-slate-500 space-y-1">
            <p>From: <strong className="text-slate-800">Diapay Core Alerts &lt;no-reply@diapay.net&gt;</strong></p>
            <p>To: <strong className="text-slate-800">{activeTemplate === "dispute" ? "developer@diamarket.sn" : "moussa.diop@dakar-tech.net"}</strong></p>
            <p>Subject: <strong className="text-slate-800">
              {activeTemplate === "dispute" && "[Action Required] New Chargeback Dispute Raised - Case #disp_01"}
              {activeTemplate === "receipt" && "Your Payment of 450,000 XOF to Acme Senegal was Successful"}
              {activeTemplate === "refund" && "Confirmation: Refund of 150,000 XOF Processed Successfully"}
            </strong></p>
          </div>

          {/* Email Body Area */}
          <div className="p-8 max-w-xl mx-auto space-y-6">
            
            {/* Logo */}
            <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
              <span className="text-lg font-display font-bold tracking-tight text-slate-900">Dia<span className="text-indigo-600">pay</span></span>
              <span className="text-[10px] font-mono text-slate-400">IMMEDIATE AUTOMATED DELIVERY</span>
            </div>

            {/* Content Switcher */}
            {activeTemplate === "dispute" && (
              <div className="space-y-4">
                <div className="bg-red-50 text-red-700 border border-red-100 rounded-xl p-4 flex gap-3">
                  <ShieldAlert className="flex-shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <strong className="text-red-800 block text-sm">Dispute Action Required: 450,000 XOF on Hold</strong>
                    <p className="leading-relaxed">An acquiring financial system has raised a chargeback alert for unrecognized card usage. Reconciliations are paused.</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600">
                  <p>Hello Developer Desk,</p>
                  <p>A card scheme dispute has been logged against your account on <strong>2026-07-02</strong>. The disputed funds have been moved from your clearable escrow balances to hold states.</p>
                  
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 font-mono space-y-1 text-[11px]">
                    <p>Dispute Reference: <strong className="text-slate-800">disp_01</strong></p>
                    <p>Payer Identifier: <strong className="text-slate-800">+221 78 123 45 67</strong></p>
                    <p>Claim amount: <strong className="text-slate-800">450,000 XOF</strong></p>
                    <p>Reason code: <strong className="text-slate-800">FRAUD_UNRECOGNIZED_PAYMENT</strong></p>
                    <p>Resolution Deadline: <strong className="text-red-600">2026-07-10 17:00 UTC</strong></p>
                  </div>

                  <p>To avoid forfeiture of this dispute, please visit your developer Disputes Desk dashboard to upload delivery receipts or conceding proof files.</p>
                </div>

                <div className="pt-4 text-center">
                  <a href="#disputes-desk" className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold text-xs py-3 px-6 rounded-xl transition shadow-sm">
                    Open Disputes Desk Workspace
                  </a>
                </div>
              </div>
            )}

            {activeTemplate === "receipt" && (
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle size={24} />
                  </div>
                  <h3 className="text-lg font-display font-bold text-slate-800">Payment Confirmation Receipt</h3>
                  <p className="text-xs text-slate-400">Order ID: ORD-9912 | Reference: TRX-TSN01984</p>
                </div>

                <div className="space-y-3.5 text-xs text-slate-600">
                  <p>Hello Moussa Diop,</p>
                  <p>Your mobile money transaction was settled successfully with the local telecommunication provider. Your order details reside below:</p>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 font-mono space-y-1 text-[11px]">
                    <p>Merchant Vendor: <strong className="text-slate-800">Acme Senegal S.A.R.L.</strong></p>
                    <p>Payer Phone: <strong className="text-slate-800">+221 77 452 89 12</strong></p>
                    <p>Operator Gateway: <strong className="text-slate-800 uppercase">Orange Money</strong></p>
                    <p>Cleared Amount: <strong className="text-green-600 font-bold">450,000 XOF</strong></p>
                  </div>

                  <p>This transaction has been executed under the unified Diapay multi-operator contract securely. Charges on your statement will read 'DIAPAY* ACME_SN'.</p>
                </div>

                <div className="pt-4 text-center border-t border-slate-100">
                  <a href="#support-desk" className="inline-block bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-3 px-6 rounded-xl transition shadow-sm">
                    Query Support Lookup Portal
                  </a>
                </div>
              </div>
            )}

            {activeTemplate === "refund" && (
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <RotateCcw size={22} />
                  </div>
                  <h3 className="text-lg font-display font-bold text-slate-800">Refund Settlement Processed</h3>
                  <p className="text-xs text-slate-400">Refund Ref: REF-TSN0184A | original txn: txn_06</p>
                </div>

                <div className="space-y-3.5 text-xs text-slate-600">
                  <p>Hello Customer,</p>
                  <p>We are writing to confirm that a refund has been initiated by the developer panel, settled in your cellular operator mobile money balance:</p>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 font-mono space-y-1 text-[11px]">
                    <p>Refunded Amount: <strong className="text-indigo-600 font-bold">150,000 XOF</strong></p>
                    <p>Target Device Phone: <strong className="text-slate-800">+221 77 987 65 43</strong></p>
                    <p>Original Item: <strong className="text-slate-800">Premium Marketplace Order</strong></p>
                    <p>Settlement Date: <strong className="text-slate-800">2026-06-30 15:05 UTC</strong></p>
                  </div>

                  <p>Standard mobile operator refund clearance times vary between 1 and 4 minutes. Your balance will adjust automatically.</p>
                </div>

                <div className="pt-4 text-center border-t border-slate-100 text-[10px] text-slate-400 font-mono">
                  DiaPay Payment Orchestration Engine. Senegal, West Africa.
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Info label footer */}
        <div className="mt-5 p-4 bg-white/60 border border-slate-200/50 rounded-2xl text-[10px] text-slate-500 leading-relaxed">
          Automated mail notifications are dispatched through Diapay SMTP proxy APIs, eliminating the need for custom coding for standard invoice receipt and dispute management templates.
        </div>
      </div>
    </div>
  );
}
