"use client";

import { Suspense, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Scene } from "@/components/book";
import { QuotesPanel } from "@/components/quotes";
import { ControlButton, WebGLError, useWebGLSupport } from "@/components/ui";
import { useRotationControl } from "@/hooks/use-rotation";
import { useMounted } from "@/hooks/use-mounted";

export default function Home() {
  const mounted = useMounted();
  const hasWebGL = useWebGLSupport();
  const { isRotating, toggleRotation } = useRotationControl();
  const [activeQuote, setActiveQuote] = useState(0);
  const [webGLError, setWebGLError] = useState(false);

  // Auto-cycle quotes
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveQuote((prev) => (prev + 1) % 8);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleRetry = () => {
    setWebGLError(false);
    window.location.reload();
  };

  if (hasWebGL === false || webGLError) {
    return <WebGLError onRetry={handleRetry} />;
  }

  return (
    <main
      className="relative w-full h-screen overflow-hidden select-none"
      style={{
        background: "linear-gradient(145deg, #07070d 0%, #0e0e18 35%, #090914 65%, #040408 100%)",
      }}
    >
      {/* Background ambient effects */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 75% 45% at 28% 38%, rgba(212, 175, 55, 0.045) 0%, transparent 50%),
            radial-gradient(ellipse 55% 35% at 72% 68%, rgba(212, 175, 55, 0.035) 0%, transparent 45%),
            radial-gradient(ellipse 100% 75% at 50% 100%, rgba(15, 15, 35, 0.55) 0%, transparent 50%)
          `,
        }}
      />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.012]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(212, 175, 55, 0.7) 1px, transparent 1px),
            linear-gradient(90deg, rgba(212, 175, 55, 0.7) 1px, transparent 1px)
          `,
          backgroundSize: "45px 45px",
        }}
      />

      {/* Main content container */}
      <div className="relative z-10 h-full flex flex-col lg:flex-row">
        {/* 3D Canvas Section */}
        <div className="w-full lg:w-[58%] h-[50%] lg:h-full relative">
          {mounted && (
            <Canvas
              camera={{ position: [0, 1.25, 4.0], fov: 38 }}
              shadows
              dpr={[1, 2]}
              gl={{
                antialias: true,
                alpha: true,
                powerPreference: "high-performance",
              }}
              onError={() => setWebGLError(true)}
            >
              <Suspense fallback={null}>
                <Scene isRotating={isRotating} />
              </Suspense>
            </Canvas>
          )}

          {/* Control Button */}
          <ControlButton isRotating={isRotating} onClick={toggleRotation} />

          {/* Book Title Overlay */}
          <div className="absolute bottom-3 md:bottom-6 left-0 right-0 text-center pointer-events-none px-4">
            <div
              className="inline-block px-5 md:px-8 py-3 md:py-4 rounded-2xl backdrop-blur-lg"
              style={{
                background: "rgba(8, 8, 16, 0.72)",
                border: "1px solid rgba(212, 175, 55, 0.18)",
                boxShadow: "0 10px 35px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(212, 175, 55, 0.12)",
              }}
            >
              <h1 className="text-base md:text-lg lg:text-xl text-amber-100 font-light tracking-wider">
                В чём наше благо?
              </h1>
              <p className="text-[9px] md:text-[11px] text-amber-400/55 mt-1 tracking-[0.12em] uppercase">
                Марк Аврелий & Эпиктет
              </p>
            </div>
          </div>
        </div>

        {/* Quotes Panel */}
        <div
          className="w-full lg:w-[42%] h-[50%] lg:h-full relative"
          style={{
            background: "linear-gradient(180deg, rgba(10, 10, 18, 0.97) 0%, rgba(5, 5, 10, 0.99) 100%)",
            borderLeft: "1px solid rgba(212, 175, 55, 0.08)",
          }}
        >
          {/* Top gradient fade */}
          <div
            className="absolute top-0 left-0 right-0 h-20 pointer-events-none"
            style={{
              background: "linear-gradient(180deg, rgba(10, 10, 18, 1) 0%, transparent 100%)",
            }}
          />

          <QuotesPanel activeQuote={activeQuote} setActiveQuote={setActiveQuote} />

          {/* Bottom gradient fade */}
          <div
            className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
            style={{
              background: "linear-gradient(0deg, rgba(5, 5, 10, 1) 0%, transparent 100%)",
            }}
          />
        </div>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-3 left-3 flex items-center gap-1.5 pointer-events-none">
        <div className="w-6 h-px bg-gradient-to-r from-amber-500/20 to-transparent" />
        <div className="w-1 h-1 rounded-full bg-amber-500/12" />
      </div>

      <div className="absolute bottom-3 left-3 pointer-events-none">
        <p className="text-amber-600/15 text-[9px] tracking-[0.2em] uppercase font-light">
          Stoic Philosophy
        </p>
      </div>

      {/* Custom scrollbar styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 2.5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.015);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(212, 175, 55, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(212, 175, 55, 0.35);
        }
      `}</style>
    </main>
  );
}
