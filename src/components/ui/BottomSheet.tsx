"use client";

import { useEffect, useRef, useCallback } from "react";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number>(0);
  const touchCurrentY = useRef<number>(0);

  // Закрытие по swipe вниз
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchCurrentY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback(() => {
    const diff = touchCurrentY.current - touchStartY.current;
    if (diff > 100) { // Swipe вниз на 100px+
      onClose();
    }
    touchStartY.current = 0;
    touchCurrentY.current = 0;
  }, [onClose]);

  // Закрытие по Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Блокировка скролла body
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.inset = '0';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.inset = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.inset = '';
    };
  }, [isOpen]);

  // Закрытие по клику на overlay
  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:hidden"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={handleOverlayClick}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />

      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        className="relative w-full max-h-[85vh] bg-[rgba(15,15,25,0.98)] rounded-t-3xl shadow-[0_-16px_48px_rgba(0,0,0,0.6)] overflow-hidden animate-slide-up"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Handle bar */}
        <div className="flex items-center justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-amber-500/30 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-5 pb-3 border-b border-[rgba(212,175,55,0.15)] bg-gradient-to-r from-amber-900/20 to-transparent">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-light text-amber-100 tracking-wide">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-amber-500/10 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Закрыть"
              type="button"
            >
              <svg className="w-5 h-5 text-amber-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-amber-500/60 mt-0.5 tracking-[0.12em] uppercase">Свайпните вниз для закрытия</p>
        </div>

        {/* Content */}
        <div className="overflow-y-auto custom-scrollbar max-h-[65vh]">
          {children}
        </div>
      </div>
    </div>
  );
}
