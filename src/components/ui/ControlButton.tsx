"use client";

import { useI18n } from "@/hooks/use-i18n";

interface ControlButtonProps {
  isRotating: boolean;
  onClick: () => void;
}

function PauseIcon() {
  return (
    <svg className="w-4 h-4 sm:w-3.5 sm:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg className="w-4 h-4 sm:w-3.5 sm:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

export function ControlButton({ isRotating, onClick }: ControlButtonProps) {
  const { t } = useI18n();
  
  return (
    <button
      onClick={onClick}
      className="px-4 py-2.5 sm:px-3 sm:py-1.5 rounded-lg backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-[rgba(10,10,20,0.6)] focus-visible:ring-4 focus-visible:ring-amber-300 min-h-[48px] min-w-[48px] sm:min-h-[44px] sm:min-w-[44px]"
      style={{
        background: 'rgba(10, 10, 20, 0.85)',
        border: '2px solid rgba(212, 175, 55, 0.4)',
      }}
      aria-label={isRotating ? t('control.pause') : t('control.play')}
      aria-pressed={isRotating}
      type="button"
    >
      <span className="text-sm sm:text-xs text-amber-300 tracking-wider uppercase flex items-center gap-1.5 sm:gap-1 font-medium">
        {isRotating ? (
          <>
            <PauseIcon />
            <span className="hidden sm:inline">{t('menu.pause')}</span>
          </>
        ) : (
          <>
            <PlayIcon />
            <span className="hidden sm:inline">{t('control.rotation')}</span>
          </>
        )}
      </span>
    </button>
  );
}
