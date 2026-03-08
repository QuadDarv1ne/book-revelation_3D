"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from "react";

export type ThemeType = "dark" | "light" | "blue" | "purple" | "ambient" | "relax" | "auto" | "auto-time";

export type BookImages = {
  cover?: string;
  spine?: string;
  backCover?: string;
};

interface Book3DContextType {
  // Вращение
  isRotating: boolean;
  toggleRotation: () => void;
  setRotation: (rotating: boolean) => void;

  // Тема
  theme: ThemeType;
  setTheme: (theme: ThemeType | ((prev: ThemeType) => ThemeType)) => void;

  // Изображения книги
  bookImages: BookImages;
  setBookImages: (images: BookImages | ((prev: BookImages) => BookImages)) => void;

  // Масштаб камеры
  cameraZoom: number;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  setZoom: (zoom: number) => void;

  // Загрузка
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Ошибки
  error: string | null;
  setError: (error: string | null) => void;
}

const Book3DContext = createContext<Book3DContextType | undefined>(undefined);

interface Book3DProviderProps {
  children: ReactNode;
  initialTheme?: ThemeType;
  initialBookImages?: BookImages;
}

export function Book3DProvider({ 
  children, 
  initialTheme = "dark",
  initialBookImages = {}
}: Book3DProviderProps) {
  const [isRotating, setIsRotating] = useState(true);
  const [theme, setTheme] = useState<ThemeType>(initialTheme);
  const [bookImages, setBookImagesState] = useState<BookImages>(initialBookImages);
  
  const setBookImages = useCallback((images: BookImages | ((prev: BookImages) => BookImages)) => {
    setBookImagesState(prev => {
      if (typeof images === 'function') {
        return (images as (prev: BookImages) => BookImages)(prev);
      }
      return images;
    });
  }, []);
  const [cameraZoom, setCameraZoom] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleRotation = useCallback(() => {
    setIsRotating(prev => !prev);
  }, []);

  const setRotation = useCallback((rotating: boolean) => {
    setIsRotating(rotating);
  }, []);

  const zoomIn = useCallback(() => {
    setCameraZoom(prev => Math.min(prev + 0.2, 2));
  }, []);

  const zoomOut = useCallback(() => {
    setCameraZoom(prev => Math.max(prev - 0.2, 0.5));
  }, []);

  const resetZoom = useCallback(() => {
    setCameraZoom(1);
  }, []);

  const setZoom = useCallback((zoom: number) => {
    setCameraZoom(Math.max(0.5, Math.min(zoom, 2)));
  }, []);

  const value = useMemo(() => ({
    isRotating,
    toggleRotation,
    setRotation,
    theme,
    setTheme,
    bookImages,
    setBookImages,
    cameraZoom,
    zoomIn,
    zoomOut,
    resetZoom,
    setZoom,
    isLoading,
    setIsLoading,
    error,
    setError,
  }), [
    isRotating,
    toggleRotation,
    setRotation,
    theme,
    setTheme,
    bookImages,
    setBookImages,
    cameraZoom,
    zoomIn,
    zoomOut,
    resetZoom,
    setZoom,
    isLoading,
    error,
  ]);

  return (
    <Book3DContext.Provider value={value}>
      {children}
    </Book3DContext.Provider>
  );
}

export function useBook3D(): Book3DContextType {
  const context = useContext(Book3DContext);
  if (context === undefined) {
    throw new Error("useBook3D must be used within a Book3DProvider");
  }
  return context;
}

export function useBook3DSelector<T>(selector: (state: Book3DContextType) => T): T {
  const context = useContext(Book3DContext);
  if (context === undefined) {
    throw new Error("useBook3DSelector must be used within a Book3DProvider");
  }
  return selector(context);
}
