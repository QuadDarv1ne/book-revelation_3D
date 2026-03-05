"use client";

export function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-full w-full">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-amber-400/30 border-t-amber-400 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-amber-100/60 text-sm tracking-wide">Загрузка 3D сцены...</p>
      </div>
    </div>
  );
}
