"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { QuotesPanel } from "@/components/quotes";
import { ControlButton, WebGLError, useWebGLSupport, SettingsBar, PWAInstall } from "@/components/ui";
import { useRotationControl } from "@/hooks/use-rotation";
import { useMounted } from "@/hooks/use-mounted";
import { LoadingFallback } from "@/components/ui/LoadingFallback";

const Scene = dynamic(() => import("@/components/book").then(mod => ({ default: mod.Scene })), {
  ssr: false,
  loading: () => <LoadingFallback />,
});

const BACKGROUND_GRADIENT = 'radial-gradient(ellipse_75%_45%_at_28%_38%,rgba(212,175,55,0.045)_0%,transparent_50%),radial-gradient(ellipse_55%_35%_at_72%_68%,rgba(212,175,55,0.035)_0%,transparent_45%),radial-gradient(ellipse_100%_75%_at_50%_100%,rgba(15,15,35,0.55)_0%,transparent_50%)';
const GRID_PATTERN = 'linear-gradient(rgba(212,175,55,0.7)_1px,transparent_1px),linear-gradient(90deg,rgba(212,175,55,0.7)_1px,transparent_1px)';
const QUOTE_ROTATION_INTERVAL = 5000;
const QUOTE_COUNT = 8;
const BOOK_COVER_IMAGE = "/book-cover.jpg";
const BOOK_SPINE_IMAGE = "/book-spine.jpg";

function getInitialTheme(): "dark" | "light" {
  if (typeof window === "undefined") return "dark";
  const saved = localStorage.getItem("theme");
  if (saved === "light" || saved === "dark") return saved;
  return "dark";
}

export default function Home() {
  const mounted = useMounted();
  const hasWebGL = useWebGLSupport();
  const { isRotating, toggleRotation } = useRotationControl();
  const [activeQuote, setActiveQuote] = useState(0);
  const [webGLError, setWebGLError] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">(getInitialTheme);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'TOGGLE_ROTATION') {
        toggleRotation();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [toggleRotation]);

  useEffect(() => {
    document.body.classList.toggle("light-theme", theme === "light");
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveQuote((prev) => (prev + 1) % QUOTE_COUNT);
    }, QUOTE_ROTATION_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const handleRetry = useCallback(() => {
    setWebGLError(false);
    window.location.reload();
  }, []);

  if (hasWebGL === false || webGLError) {
    return <WebGLError onRetry={handleRetry} />;
  }

  const backgroundGradient = BACKGROUND_GRADIENT;
  const gridPattern = GRID_PATTERN;

  return (
    <main className="relative w-full h-screen overflow-hidden select-none bg-[#07070d]" role="main">
      <a href="#quotes" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-amber-600 focus:text-white focus:rounded-lg">
        Перейти к цитатам
      </a>
      <a href="#controls" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-amber-600 focus:text-white focus:rounded-lg focus:mt-14">
        Управление
      </a>
      <div className="absolute inset-0 pointer-events-none" style={{ background: backgroundGradient }} />

      <div className="absolute inset-0 pointer-events-none opacity-[0.012]" style={{ background: gridPattern, backgroundSize: '45px 45px' }} />

      <div className="relative z-10 h-full flex flex-col lg:flex-row">
        <div className="w-full lg:w-[58%] h-[50%] lg:h-full relative" role="region" aria-label="3D сцена с книгой">
          {mounted && (
            <Scene isRotating={isRotating} onError={() => setWebGLError(true)} coverImage={BOOK_COVER_IMAGE} spineImage={BOOK_SPINE_IMAGE} />
          )}

          <div id="controls">
            <ControlButton isRotating={isRotating} onClick={toggleRotation} />
          </div>

          <div className="absolute bottom-3 md:bottom-6 left-0 right-0 text-center pointer-events-none px-4">
            <div className="inline-block px-5 md:px-8 py-3 md:py-4 rounded-2xl backdrop-blur-lg bg-[rgba(8,8,16,0.72)] border border-[rgba(212,175,55,0.18)] shadow-[0_10px_35px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(212,175,55,0.12)]">
              <h1 className="text-base md:text-lg lg:text-xl text-amber-100 font-light tracking-wider">Ищешь смысл жизни?</h1>
              <p className="text-[9px] md:text-[11px] text-amber-400/55 mt-1 tracking-[0.12em] uppercase">Марк Аврелий & Стоицизм</p>
            </div>
          </div>
        </div>

        <div id="quotes" className="w-full lg:w-[42%] h-[50%] lg:h-full relative bg-gradient-to-b from-[rgba(10,10,18,0.97)] to-[rgba(5,5,10,0.99)] border-l border-[rgba(212,175,55,0.08)]" role="region" aria-label="Цитаты стоических философов">
          <div className="absolute top-0 left-0 right-0 h-20 pointer-events-none bg-gradient-to-b from-[rgba(10,10,18,1)] to-transparent" />
          <QuotesPanel activeQuote={activeQuote} setActiveQuote={setActiveQuote} />
          <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none bg-gradient-to-t from-[rgba(5,5,10,1)] to-transparent" />
        </div>
      </div>

      <div className="absolute top-3 left-3 flex items-center gap-1.5 pointer-events-none">
        <div className="w-6 h-px bg-gradient-to-r from-amber-500/20 to-transparent" />
        <div className="w-1 h-1 rounded-full bg-amber-500/12" />
      </div>

      <div className="absolute bottom-3 left-3 pointer-events-none">
        <p className="text-amber-600/15 text-[9px] tracking-[0.2em] uppercase font-light">Stoic Philosophy</p>
      </div>

      <SettingsBar theme={theme} onThemeChange={setTheme} />

      <PWAInstall />

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 2.5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.015); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(212,175,55,0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(212,175,55,0.35); }
      `}</style>
    </main>
  );
}
