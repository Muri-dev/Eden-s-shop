"use client";

import React from "react";
import { useToastStore } from "@/stores/toast.store";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none">
      {toasts.map((t) => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
          error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
          info: <Info className="w-5 h-5 text-eden-gold shrink-0" />,
        };

        const borderColors = {
          success: "border-emerald-200 bg-white",
          error: "border-rose-200 bg-white",
          warning: "border-amber-200 bg-white",
          info: "border-[#E5DDCF] bg-[#FAF8F5]",
        };

        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border ${borderColors[t.type]} transition-all duration-300 animate-in fade-in slide-in-from-bottom-3`}
          >
            {icons[t.type]}
            <div className="flex-1 min-w-0">
              {t.title && (
                <h4 className="text-sm font-semibold text-[#241813] mb-0.5">
                  {t.title}
                </h4>
              )}
              <p className="text-xs text-[#63534B] leading-relaxed">{t.message}</p>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-[#96867B] hover:text-[#241813] p-1 rounded transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
