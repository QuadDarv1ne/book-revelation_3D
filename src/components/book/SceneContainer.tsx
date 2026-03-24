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
  loading: () => <LoadingFallback showProgress={true} />,
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
  const [showLoading, setShowLoading] = useState(true);

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
      if (stats.loaded >= 3) {
        setShowLoading(false);
      }
    };
    const interval = setInterval(checkTextures, 100);
    return () => clearInterval(interval);
  }, []);

  if (sceneError) {
    return null;
  }

  return (
    <>
      {showLoading && (
        <div className="absolute inset-0 z-10">
          <LoadingFallback showProgress={true} onLoaded={() => setShowLoading(false)} />
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
        graphicsQuality={settings.graphicsQuality}
      />
    </>
  );
}
