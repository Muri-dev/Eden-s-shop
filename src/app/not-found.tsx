import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Compass, ArrowRight, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-20 bg-[#FAF7F2]">
      <div className="w-20 h-20 rounded-full bg-[#FAF2E6] border border-[#DFC8A8] flex items-center justify-center mb-6 shadow-xs">
        <Compass className="w-10 h-10 text-[#A6875C]" />
      </div>

      <span className="text-[11px] uppercase tracking-[0.3em] font-semibold text-[#A6875C] mb-2">
        Error 404 • Lost in the Archives
      </span>

      <h1 className="font-serif text-3xl sm:text-5xl text-[#241813] font-normal mb-4">
        The Requested Piece Cannot Be Found
      </h1>

      <p className="text-sm text-[#63534B] max-w-md mb-8 leading-relaxed">
        The creation, catalogue archive, or wing you are looking for has either been consigned to a private collector or moved to another vault.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Link href="/">
          <Button variant="primary" size="lg">
            <Home className="w-4 h-4 mr-2" />
            Return to Grand Salon
          </Button>
        </Link>
        <Link href="/shop">
          <Button variant="secondary" size="lg">
            Explore All Collections
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
