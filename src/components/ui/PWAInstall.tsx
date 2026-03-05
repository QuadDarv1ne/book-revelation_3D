"use client";

import { useEffect, useState } from "react";

export function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setShowInstall(false);
      setDeferredPrompt(null);
    }
  };

  if (!showInstall) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-3 bg-[rgba(10,10,20,0.95)] backdrop-blur-xl border border-[rgba(212,175,55,0.2)] rounded-2xl shadow-2xl flex items-center gap-3">
      <span className="text-amber-100 text-sm">Установить приложение</span>
      <button
        onClick={handleInstall}
        className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-sm rounded-lg transition-colors"
      >
        Добавить
      </button>
      <button
        onClick={() => setShowInstall(false)}
        className="p-1 text-amber-400/60 hover:text-amber-400 transition-colors"
        aria-label="Закрыть"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
