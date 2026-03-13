"use client";

import { useCallback } from "react";
import { useBook3D, ThemeType } from "@/contexts/Book3DContext";

interface UseBookRotation {
  isRotating: boolean;
  toggleRotation: () => void;
  rotationSpeed: number;
}

export function useBookRotation(): UseBookRotation {
  const { isRotating, toggleRotation } = useBook3D();
  const rotationSpeed = 0.5;

  return {
    isRotating,
    toggleRotation,
    rotationSpeed,
  };
}

interface UseTheme {
  theme: ThemeType;
  setTheme: (theme: ThemeType | ((prev: ThemeType) => ThemeType)) => void;
  availableThemes: readonly string[];
  nextTheme: () => void;
  previousTheme: () => void;
}

const AVAILABLE_THEMES = ["dark", "light", "blue", "purple", "ambient", "relax", "auto", "auto-time"] as const;

export function useTheme(): UseTheme {
  const { theme, setTheme } = useBook3D();

  const nextTheme = useCallback(() => {
    setTheme((prev: ThemeType) => {
      const currentIndex = AVAILABLE_THEMES.indexOf(prev);
      const nextIndex = (currentIndex + 1) % AVAILABLE_THEMES.length;
      return AVAILABLE_THEMES[nextIndex] as ThemeType;
    });
  }, [setTheme]);

  const previousTheme = useCallback(() => {
    setTheme((prev: ThemeType) => {
      const currentIndex = AVAILABLE_THEMES.indexOf(prev);
      const previousIndex = currentIndex <= 0 ? AVAILABLE_THEMES.length - 1 : currentIndex - 1;
      return AVAILABLE_THEMES[previousIndex] as ThemeType;
    });
  }, [setTheme]);

  return {
    theme,
    setTheme,
    availableThemes: AVAILABLE_THEMES,
    nextTheme,
    previousTheme,
  };
}

interface UseBookTextures {
  coverImage: string | undefined;
  spineImage: string | undefined;
  backCoverImage: string | undefined;
  setCoverImage: (url: string | undefined) => void;
  setSpineImage: (url: string | undefined) => void;
  setBackCoverImage: (url: string | undefined) => void;
  resetImages: () => void;
}

export function useBookTextures(): UseBookTextures {
  const { bookImages, setBookImages } = useBook3D();

  const setCoverImage = useCallback((url: string | undefined) => {
    setBookImages(prev => ({ ...prev, cover: url }));
  }, [setBookImages]);

  const setSpineImage = useCallback((url: string | undefined) => {
    setBookImages(prev => ({ ...prev, spine: url }));
  }, [setBookImages]);

  const setBackCoverImage = useCallback((url: string | undefined) => {
    setBookImages(prev => ({ ...prev, backCover: url }));
  }, [setBookImages]);

  const resetImages = useCallback(() => {
    setBookImages({});
  }, [setBookImages]);

  return {
    coverImage: bookImages.cover,
    spineImage: bookImages.spine,
    backCoverImage: bookImages.backCover,
    setCoverImage,
    setSpineImage,
    setBackCoverImage,
    resetImages,
  };
}
