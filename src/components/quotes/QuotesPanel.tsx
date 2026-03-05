"use client";

import { useEffect, useState } from "react";
import { quotes } from "@/data/quotes";
import { QuoteCard } from "./QuoteCard";

interface QuotesPanelProps {
  activeQuote: number;
  setActiveQuote: (n: number) => void;
}

export function QuotesPanel({ activeQuote, setActiveQuote }: QuotesPanelProps) {
  const [visibleQuotes, setVisibleQuotes] = useState<number[]>([]);

  useEffect(() => {
    const showQuote = (index: number) => {
      if (index < quotes.length) {
        const timer = setTimeout(() => {
          setVisibleQuotes(prev => [...prev, index]);
          showQuote(index + 1);
        }, 300);
        return timer;
      }
      return undefined;
    };

    const initialTimer = setTimeout(() => showQuote(0), 500);
    return () => {
      clearTimeout(initialTimer);
    };
  }, []);

  return (
    <div className="h-full flex flex-col justify-center p-5 md:p-7 lg:p-8">
      {/* Header */}
      <div className="mb-4 md:mb-5">
        <h2 className="text-xl md:text-2xl lg:text-3xl font-light text-amber-100 mb-1.5 tracking-wide">
          В чём наше благо?
        </h2>
        <p className="text-xs md:text-sm text-amber-500/65 tracking-[0.18em] uppercase font-light">
          Марк Аврелий & Эпиктет
        </p>
        <div className="flex items-center gap-2 mt-3">
          <div className="w-8 h-px bg-gradient-to-r from-amber-400/55 to-transparent" />
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400/45" />
        </div>
      </div>

      {/* Quotes List */}
      <div className="space-y-2 md:space-y-2.5 max-h-[50vh] md:max-h-[420px] overflow-y-auto pr-1.5 custom-scrollbar">
        {quotes.map((quote, index) => (
          <QuoteCard
            key={index}
            quote={quote}
            index={index}
            isVisible={visibleQuotes.includes(index)}
            isActive={activeQuote === index}
            onClick={() => setActiveQuote(index)}
          />
        ))}
      </div>

      {/* Footer decoration */}
      <div className="mt-4 md:mt-5 flex items-center gap-2 text-amber-600/35">
        <div className="w-2.5 h-px bg-amber-500/25" />
        <span className="text-[9px] md:text-[10px] tracking-[0.25em] uppercase">Stoic Wisdom</span>
        <div className="flex-1 h-px bg-gradient-to-r from-amber-500/25 to-transparent" />
      </div>
    </div>
  );
}
