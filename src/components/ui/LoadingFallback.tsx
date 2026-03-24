"use client";

import { useEffect, useState, useCallback } from "react";
import { textureManager } from "@/lib/textures/texture-manager";

interface LoadingFallbackProps {
  message?: string;
  showProgress?: boolean;
  onLoaded?: () => void;
}

export function LoadingFallback({
  message = "Загрузка 3D сцены...",
  showProgress = true,
  onLoaded
}: LoadingFallbackProps) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Инициализация...");

  const checkProgress = useCallback(() => {
    const stats = textureManager.getCacheStats();
    const totalTextures = 3; // cover, spine, back
    const loadedPercent = Math.round((stats.loaded / totalTextures) * 100);

    if (loadedPercent >= 100) {
      setProgress(100);
      setStatus("Готово!");
      setTimeout(() => onLoaded?.(), 300);
    } else {
      setProgress(loadedPercent);
      setStatus(`Загрузка текстур: ${loadedPercent}%`);
    }
  }, [onLoaded]);

  useEffect(() => {
    if (!showProgress) return;

    const interval = setInterval(checkProgress, 100);

    // Timeout fallback: force complete after 10 seconds
    const timeout = setTimeout(() => {
      setProgress(100);
      setStatus("Готово!");
      setTimeout(() => onLoaded?.(), 300);
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [showProgress, checkProgress, onLoaded]);

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
          <>
            <div
              className="w-full h-2 bg-amber-900/30 rounded-full overflow-hidden"
              role="progressbar"
              aria-label="Прогресс загрузки"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
              aria-valuetext={`${progress}% загружено`}
            >
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-amber-200/50 text-xs mt-3">{status}</p>
          </>
        )}

        {!showProgress && (
          <p className="text-amber-200/40 text-xs mt-3">Инициализация...</p>
        )}
      </div>
    </div>
  );
}
