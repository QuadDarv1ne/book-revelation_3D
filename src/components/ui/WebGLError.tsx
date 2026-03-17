"use client";

import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

export function WebGLError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex items-center justify-center h-full w-full p-8">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 border-4 border-red-400/30 border-t-red-400 rounded-full mx-auto mb-4" />
        <h3 className="text-amber-700 dark:text-amber-100 text-lg mb-2 font-semibold">WebGL не поддерживается</h3>
        <p className="text-amber-900/80 dark:text-amber-100/80 text-sm mb-4">
          Ваш браузер не поддерживает WebGL или эта функция отключена.
          Попробуйте обновить страницу или использовать другой браузер.
        </p>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-amber-700 hover:bg-amber-800 dark:bg-amber-600/80 dark:hover:bg-amber-600 text-white text-sm rounded-lg transition-colors font-medium"
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
        // Пробуем получить WebGL контекст с разными опциями
        const gl = canvas.getContext("webgl", { 
          alpha: true, 
          antialias: true,
          powerPreference: "high-performance"
        }) || 
        canvas.getContext("experimental-webgl", {
          alpha: true,
          antialias: true,
        }) ||
        canvas.getContext("webgl2", {
          alpha: true,
          antialias: true,
        });
        
        // Проверяем, не потерян ли контекст
        if (gl && 'isContextLost' in gl) {
          const isLost = gl.isContextLost();
          return !isLost;
        }
        return !!gl;
      } catch (error) {
        console.warn('WebGL support check failed:', error);
        return false;
      }
    },
    () => false
  );
}
