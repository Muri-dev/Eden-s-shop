"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global application error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-20 bg-[#FAF7F2]">
      <div className="w-20 h-20 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mb-6">
        <AlertTriangle className="w-10 h-10 text-rose-600" />
      </div>

      <span className="text-[11px] uppercase tracking-[0.3em] font-semibold text-rose-700 mb-2">
        Atelier Notice
      </span>

      <h1 className="font-serif text-3xl sm:text-4xl text-[#241813] font-normal mb-4">
        An Unanticipated Interruption Occurred
      </h1>

      <p className="text-sm text-[#63534B] max-w-md mb-8 leading-relaxed">
        Our technical concierges have been alerted. Please attempt to refresh the display or re-authenticate your session.
      </p>

      <Button variant="primary" size="lg" onClick={() => reset()}>
        <RefreshCw className="w-4 h-4 mr-2" />
        Reload Experience
      </Button>
    </div>
  );
}
