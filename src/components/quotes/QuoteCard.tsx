"use client";

import type { Quote } from "@/types/quote";

interface QuoteCardProps {
  quote: Quote;
  index: number;
  isVisible: boolean;
  isActive: boolean;
  onClick: () => void;
}

export function QuoteCard({ quote, index, isVisible, isActive, onClick }: QuoteCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        transition-all duration-700 ease-out cursor-pointer
        transform ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}
      `}
      style={{
        transitionDelay: `${index * 100}ms`
      }}
    >
      <div
        className={`
          relative p-3.5 md:p-4 rounded-xl overflow-hidden
          transition-all duration-400
          ${isActive
            ? 'bg-gradient-to-r from-amber-900/55 via-amber-900/30 to-transparent border-l-[3px] border-amber-400'
            : 'bg-white/[0.04] border-l-[3px] border-transparent hover:bg-white/[0.08] hover:border-amber-600/30'
          }
        `}
      >
        {/* Active glow effect */}
        {isActive && (
          <>
            <div
              className="absolute inset-0 rounded-xl"
              style={{
                background: 'radial-gradient(ellipse at left, rgba(212, 175, 55, 0.28), transparent 65%)',
              }}
            />
            <div
              className="absolute -inset-0.5 rounded-xl opacity-30"
              style={{
                background: 'linear-gradient(90deg, rgba(212, 175, 55, 0.5), transparent)',
                filter: 'blur(10px)'
              }}
            />
          </>
        )}

        <p className={`
          text-sm md:text-[15px] leading-relaxed mb-2 relative z-10
          ${isActive ? 'text-amber-50' : 'text-gray-300'}
          transition-colors duration-400
        `}>
          &ldquo;{quote.text}&rdquo;
        </p>
        <div className="flex items-center gap-2 relative z-10">
          <p className={`
            text-xs md:text-sm
            ${isActive ? 'text-amber-300' : 'text-gray-500'}
            transition-colors duration-400 font-light tracking-wide
          `}>
            — {quote.author}
          </p>
          <span className={`
            text-[10px] px-1.5 py-0.5 rounded
            ${isActive ? 'bg-amber-600/30 text-amber-200' : 'bg-white/5 text-gray-600'}
            transition-colors duration-400
          `}>
            {quote.era}
          </span>
        </div>
      </div>
    </div>
  );
}
