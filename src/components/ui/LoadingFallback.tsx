"use client";

import { useEffect, useState } from "react";

interface LoadingFallbackProps {
  message?: string;
  showProgress?: boolean;
}

export function LoadingFallback({ 
  message = "Загрузка 3D сцены...", 
  showProgress = true 
}: LoadingFallbackProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!showProgress) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      // Прогресс от 0 до 80% за первые 2 секунды
      const newProgress = Math.min(80, Math.floor((elapsed / 2000) * 80));
      setProgress(newProgress);
    }, 100);

    return () => clearInterval(interval);
  }, [showProgress]);

  return (
    <div 
      className="flex items-center justify-center h-full w-full"
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className="text-center max-w-xs mx-auto p-6 rounded-2xl bg-[rgba(10,10,20,0.8)] backdrop-blur-sm border border-amber-500/20">
        <div 
          className="w-12 h-12 border-4 border-amber-400/30 border-t-amber-400 rounded-full animate-spin mx-auto mb-4"
          aria-hidden="true"
        />
        <p className="text-amber-100/80 text-sm tracking-wide mb-3">{message}</p>
        
        {showProgress && (
          <div className="w-full h-1 bg-amber-900/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        )}
        
        <p className="text-amber-200/40 text-xs mt-3">
          {progress < 80 ? 'Инициализация...' : 'Почти готово...'}
        </p>
      </div>
    </div>
  );
}
