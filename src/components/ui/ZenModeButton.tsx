'use client';

import { memo, useCallback } from 'react';
import { useZenMode } from '@/hooks/use-zen-mode';

interface ZenModeButtonProps {
  onZenModeChange?: (isZenMode: boolean) => void;
}

export const ZenModeButton = memo(function ZenModeButton({
  onZenModeChange
}: ZenModeButtonProps) {
  const { isZenMode, toggleZenMode } = useZenMode({ autoSave: true });

  const handleClick = useCallback(() => {
    toggleZenMode();
    onZenModeChange?.(!isZenMode);
  }, [toggleZenMode, isZenMode, onZenModeChange]);

  return (
    <button
      onClick={handleClick}
      className={`
        p-2 rounded-lg transition-all duration-200
        ${isZenMode
          ? 'bg-blue-600 text-white hover:bg-blue-700'
          : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
        }
      `}
      aria-pressed={isZenMode}
      aria-label={isZenMode ? 'Выйти из режима фокусировки' : 'Включить режим фокусировки'}
      title={isZenMode ? 'Выйти из режима фокусировки (Z)' : 'Режим фокусировки (Z)'}
    >
      {isZenMode ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
          />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      )}
    </button>
  );
});

export default ZenModeButton;
