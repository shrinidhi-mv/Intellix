import React from 'react';
import { X, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

export default function SourceModal({ isOpen, onClose, sources, title = "Verified Knowledge Base Sources" }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col max-h-[85vh] transition-colors">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-stone-50/80 dark:bg-stone-850">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-white">{title}</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Direct evidence retrieved from local ChromaDB vector store
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto space-y-4 divide-y divide-stone-100 dark:divide-stone-800">
          {(!sources || sources.length === 0) ? (
            <div className="text-center py-8 text-stone-500 dark:text-stone-400 text-sm">
              No specific source chunks referenced for this response.
            </div>
          ) : (
            sources.map((src, i) => (
              <div key={i} className={i > 0 ? "pt-4" : ""}>
                <div className="flex items-start justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-semibold text-sm text-stone-900 dark:text-stone-100">{src.title}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      Match: {Math.round(src.score * 100)}%
                    </span>
                  </div>
                </div>

                <div className="text-xs text-stone-500 dark:text-stone-400 mb-2 font-mono flex items-center space-x-1">
                  <span>File:</span>
                  <code className="text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded text-[11px]">
                    {src.document_id}
                  </code>
                  <span className="text-stone-300 dark:text-stone-700">•</span>
                  <span>Category: {src.category}</span>
                </div>

                <div className="bg-stone-50 dark:bg-stone-800/60 border border-stone-200/70 dark:border-stone-700/60 rounded-2xl p-4 text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed font-sans whitespace-pre-line">
                  {src.snippet || src.text}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-850 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Strict Anti-Hallucination Policy Active</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
