import React from 'react';
import { X, CheckCircle2, ShieldCheck, Printer } from 'lucide-react';

function HandoverReceiptModal({ isOpen, receipt, onClose }) {
  if (!isOpen || !receipt) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/95 backdrop-blur-md max-w-lg w-full rounded-3xl shadow-2xl border border-white/40 overflow-hidden print:border-none print:shadow-none print:bg-white print:my-0">
        
        {/* Certificate Banner Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white p-6 text-center relative print:from-white print:to-white print:text-slate-900 print:border-b-2 print:border-slate-300">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white print:hidden p-1 rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 print:hidden">
            <CheckCircle2 className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-extrabold text-xl print:text-2xl print:font-black">Official Handover Receipt</h3>
          <p className="text-emerald-100 text-xs mt-1 print:text-slate-500">Receipt ID: {receipt.receiptNo}</p>
        </div>

        {/* Certificate Core Data */}
        <div className="p-6 space-y-6">
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 text-sm space-y-3.5 print:bg-white print:border-none print:p-0">
            <div className="flex justify-between border-b border-slate-200 pb-2.5 print:border-slate-300">
              <span className="text-slate-400 font-medium print:text-slate-500">Item Reclaimed</span>
              <span className="font-bold text-slate-800 text-right max-w-[220px] truncate">{receipt.postTitle || receipt.post?.title}</span>
            </div>
            
            <div className="flex justify-between border-b border-slate-200 pb-2.5 print:border-slate-300">
              <span className="text-slate-400 font-medium print:text-slate-500">Claimant (Owner)</span>
              <span className="font-bold text-slate-800">
                {receipt.owner?.username || 'Owner'}
              </span>
            </div>

            <div className="flex justify-between border-b border-slate-200 pb-2.5 print:border-slate-300">
              <span className="text-slate-400 font-medium print:text-slate-500">Discoverer (Finder)</span>
              <span className="font-bold text-slate-800">
                {receipt.finder?.username || 'Finder'}
              </span>
            </div>

            <div className="flex justify-between border-b border-slate-200 pb-2.5 print:border-slate-300">
              <span className="text-slate-400 font-medium print:text-slate-500">Handover Date</span>
              <span className="font-bold text-slate-800">
                {receipt.receivedDate ? new Date(receipt.receivedDate).toLocaleDateString() : new Date().toLocaleDateString()}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-medium print:text-slate-500">Verification Code</span>
              <span className="font-extrabold text-emerald-600 tracking-wider font-mono bg-emerald-50 px-3 py-1 rounded-xl text-sm border border-emerald-100/50 print:bg-white print:border-none">
                {receipt.verificationCode}
              </span>
            </div>
          </div>

          {receipt.notes && (
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 print:text-slate-500">Handover Notes</h4>
              <p className="p-3.5 bg-slate-50 text-slate-600 rounded-xl text-xs italic border border-slate-100 print:bg-white print:border-l-4 print:border-slate-300 print:rounded-none">
                "{receipt.notes}"
              </p>
            </div>
          )}

          {/* Verification Badge */}
          <div className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-2 border-t border-slate-100 pt-5 print:mt-10">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Cryptographically verified handover transaction logging.</span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 print:hidden">
            <button 
              onClick={() => window.print()}
              className="flex-grow py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" /> Print Receipt
            </button>
            <button 
              onClick={onClose}
              className="flex-grow py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition shadow-md shadow-emerald-100"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HandoverReceiptModal;
