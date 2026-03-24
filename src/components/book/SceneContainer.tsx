"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { LoadingFallback } from "@/components/ui/LoadingFallback";
import { useBook3D } from "@/contexts/Book3DContext";
import { useUserSettings } from "@/hooks/use-user-settings";
import { type Book } from "@/data/books";
import { textureManager } from "@/lib/textures/texture-manager";

const Scene = dynamic(() => import("@/components/book").then(mod => ({ default: mod.Scene })), {
  ssr: false,
  loading: () => <LoadingFallback />,
});

interface SceneContainerProps {
  book: Book;
  rotationSpeed: number;
  onError: () => void;
}

export function SceneContainer({ book, rotationSpeed, onError }: SceneContainerProps) {
  const { isRotating, toggleRotation } = useBook3D();
  const { settings } = useUserSettings();
  const [sceneError, setSceneError] = useState(false);
  const [texturesLoaded, setTexturesLoaded] = useState({ cover: false, spine: false, back: false });

  const handleSceneError = useCallback(() => {
    setSceneError(true);
    onError();
  }, [onError]);

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
    textureManager.preloadBookTextures(
      book.coverImage,
      book.spineImage,
      book.backCoverImage
    ).catch(() => {
      // Игнорируем ошибки предзагрузки
    });
  }, [book.coverImage, book.spineImage, book.backCoverImage]);

  // Отслеживание прогресса загрузки текстур
  useEffect(() => {
    const checkTextures = () => {
      const stats = textureManager.getCacheStats();
      const loaded = stats.loaded >= 3;
      if (loaded) {
        setTexturesLoaded({ cover: true, spine: true, back: true });
      }
    };
    const interval = setInterval(checkTextures, 100);
    return () => clearInterval(interval);
  }, []);

  if (sceneError) {
    return null;
  }

  const allTexturesLoaded = texturesLoaded.cover && texturesLoaded.spine && texturesLoaded.back;

  return (
    <>
      {!allTexturesLoaded && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin" />
            <span className="text-xs text-amber-400/70 tracking-wider">Загрузка текстур...</span>
          </div>
        </div>
      )}
      <Scene
        isRotating={isRotating}
        onError={handleSceneError}
        coverImage={book.coverImage}
        spineImage={book.spineImage}
        backCoverImage={book.backCoverImage}
        theme={settings.theme}
        onKeyboardRotate={toggleRotation}
        rotationSpeed={rotationSpeed}
      />
    </>
  );
}
