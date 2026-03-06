"use client";

function subscribe() {
  return () => {};
}

export function WebGLError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex items-center justify-center h-full w-full p-8">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 border-4 border-red-400/30 border-t-red-400 rounded-full mx-auto mb-4" />
        <h3 className="text-amber-100 text-lg mb-2">WebGL не поддерживается</h3>
        <p className="text-amber-100/60 text-sm mb-4">
          Ваш браузер не поддерживает WebGL или эта функция отключена.
          Попробуйте обновить страницу или использовать другой браузер.
        </p>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-amber-600/80 hover:bg-amber-600 text-white text-sm rounded-lg transition-colors"
        >
          Попробовать снова
        </button>
      </div>
    </div>
  );
}

export function useWebGLSupport() {
  return useSyncExternalStore(
    subscribe,
    () => {
      try {
        const canvas = document.createElement("canvas");
        const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        return !!gl;
      } catch {
        return false;
      }
    },
    () => false
  );
}
