"use client";

import { useEffect, useState, useCallback } from "react";
import { useI18n } from "@/hooks/use-i18n";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => void;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    // Проверка iOS для показа инструкций
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !((window as unknown) as Record<string, unknown>).MSStream;
    setIsIOS(ios);

    // Для iOS показываем подсказку сразу
    if (ios) {
      const hasDismissed = localStorage.getItem("pwa-ios-dismissed");
      if (!hasDismissed) {
        setShowInstall(true);
      }
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      const promptEvent = e as BeforeInstallPromptEvent;
      promptEvent.preventDefault();
      
      // Проверяем, не отклонял ли пользователь ранее
      const hasDismissed = localStorage.getItem("pwa-install-dismissed");
      if (!hasDismissed) {
        setDeferredPrompt(promptEvent);
        setShowInstall(true);
      }
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
      localStorage.removeItem("pwa-install-dismissed");
    }
  };

  const handleDismiss = useCallback(() => {
    setShowInstall(false);
    if (isIOS) {
      localStorage.setItem("pwa-ios-dismissed", "true");
    } else {
      localStorage.setItem("pwa-install-dismissed", "true");
    }
  }, [isIOS]);

  if (!showInstall) return null;

  if (isIOS) {
    return (
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md px-5 py-4 bg-[rgba(10,10,20,0.98)] backdrop-blur-xl border border-[rgba(212,175,55,0.25)] rounded-2xl shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 flex-shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-amber-100 font-medium text-sm mb-1">Установка на iOS</h3>
            <ol className="text-xs text-amber-200/70 space-y-1 mb-3">
              <li>1. Нажмите <strong className="text-amber-100">«Поделиться»</strong> ⬇️</li>
              <li>2. Выберите <strong className="text-amber-100">«На экран «Домой»</strong> 📲</li>
            </ol>
            <button
              onClick={handleDismiss}
              className="w-full py-2 text-xs text-amber-400/60 hover:text-amber-300 transition-colors"
              type="button"
            >
              Не показывать
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-3 bg-[rgba(10,10,20,0.95)] backdrop-blur-xl border border-[rgba(212,175,55,0.2)] rounded-2xl shadow-2xl flex items-center gap-3">
      <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      </div>
      <span className="text-amber-100 text-sm">{t('pwa.install')}</span>
      <button
        onClick={handleInstall}
        className="px-4 py-1.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-sm rounded-lg transition-all shadow-lg shadow-amber-500/20"
      >
        {t('pwa.add')}
      </button>
      <button
        onClick={handleDismiss}
        className="p-1 text-amber-400/60 hover:text-amber-400 transition-colors"
        aria-label={t('common.close')}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
