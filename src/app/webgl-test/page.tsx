"use client";

import { useEffect, useState } from "react";
import { checkWebGLSupport, type WebGLInfo } from "@/lib/webgl-check";

export default function WebGLTestPage() {
  const [webglInfo, setWebglInfo] = useState<WebGLInfo | null>(null);

  useEffect(() => {
    const info = checkWebGLSupport();
    setWebglInfo(prevInfo => {
      if (prevInfo === null) {
        return info;
      }
      return prevInfo;
    });
  }, []);

  if (!webglInfo) {
    return (
      <div className="min-h-screen bg-[#07070d] text-amber-100 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-400/30 border-t-amber-400 rounded-full mx-auto mb-4 animate-spin" />
          <p className="text-lg">Проверка WebGL...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07070d] text-amber-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-amber-200">Тест WebGL</h1>
        
        <div className={`p-6 rounded-xl border ${
          webglInfo.supported 
            ? 'bg-green-900/20 border-green-500/50' 
            : 'bg-red-900/20 border-red-500/50'
        }`}>
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-4 h-4 rounded-full ${
              webglInfo.supported ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <h2 className="text-xl font-semibold">
              {webglInfo.supported ? 'WebGL поддерживается' : 'WebGL НЕ поддерживается'}
            </h2>
          </div>

          {webglInfo.supported ? (
            <div className="space-y-2 text-amber-100/80">
              <p><strong className="text-amber-200">Версия:</strong> {webglInfo.version}</p>
              <p><strong className="text-amber-200">Renderer:</strong> {webglInfo.renderer}</p>
              <p><strong className="text-amber-200">Vendor:</strong> {webglInfo.vendor}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-red-300">
                <strong>Ошибка:</strong> {webglInfo.error || 'Неизвестная ошибка'}
              </p>
              
              <div className="bg-red-900/30 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 text-red-200">Возможные решения:</h3>
                <ol className="list-decimal list-inside space-y-1 text-red-300/80">
                  <li>Обновите драйверы видеокарты</li>
                  <li>Проверьте настройки браузера (chrome://settings/system)</li>
                  <li>Убедитесь, что аппаратное ускорение включено</li>
                  <li>Попробуйте другой браузер</li>
                  <li>Проверьте chrome://gpu для статуса WebGL</li>
                </ol>
              </div>

              <a 
                href="chrome://gpu" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Открыть chrome://gpu
              </a>
            </div>
          )}
        </div>

        <div className="mt-8 p-6 bg-amber-900/20 border border-amber-500/30 rounded-xl">
          <h3 className="font-semibold mb-2 text-amber-200">Диагностика:</h3>
          <pre className="text-xs text-amber-100/60 overflow-auto bg-black/30 p-4 rounded">
            {JSON.stringify(webglInfo, null, 2)}
          </pre>
        </div>

        <div className="mt-6 flex gap-4">
          <a 
            href="/"
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
          >
            На главную
          </a>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-amber-100 rounded-lg transition-colors"
          >
            Перепроверить
          </button>
        </div>
      </div>
    </div>
  );
}
