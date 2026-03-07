"use client";

import { useCallback, useMemo } from "react";
import { useBook3D, ThemeType } from "@/contexts/Book3DContext";
import * as THREE from "three";

interface UseCameraControls {
  cameraZoom: number;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  setZoom: (zoom: number) => void;
  fov: number;
  position: THREE.Vector3;
  updatePosition: (pos: Partial<THREE.Vector3>) => void;
}

const DEFAULT_CAMERA_POSITION = new THREE.Vector3(0, 1.25, 4.0);
const BASE_FOV = 38;

/**
 * Хук для управления камерой в 3D сцене
 */
export function useCameraControls(): UseCameraControls {
  const { cameraZoom, zoomIn, zoomOut, resetZoom } = useBook3D();

  const setZoom = useCallback((_zoom: number) => {
    // Будет реализовано через контекст при необходимости
    console.warn("setZoom not yet implemented in context");
  }, []);

  const fov = useMemo(() => {
    return BASE_FOV / cameraZoom;
  }, [cameraZoom]);

  const position = useMemo(() => {
    return DEFAULT_CAMERA_POSITION.clone().multiplyScalar(cameraZoom);
  }, [cameraZoom]);

  const updatePosition = useCallback((_pos: Partial<THREE.Vector3>) => {
    // Будет реализовано через контекст при необходимости
    console.warn("updatePosition not yet implemented in context");
  }, []);

  return {
    cameraZoom,
    zoomIn,
    zoomOut,
    resetZoom,
    setZoom,
    fov,
    position,
    updatePosition,
  };
}

/**
 * Хук для управления вращением книги
 */
interface UseBookRotation {
  isRotating: boolean;
  toggleRotation: () => void;
  setRotation: (rotating: boolean) => void;
  rotationSpeed: number;
  setRotationSpeed: (speed: number) => void;
}

export function useBookRotation(): UseBookRotation {
  const { isRotating, toggleRotation, setRotation } = useBook3D();
  const rotationSpeed = 0.5; // Можно вынести в контекст при необходимости

  const setRotationSpeed = useCallback((_speed: number) => {
    // Будет реализовано через контекст при необходимости
    console.warn("setRotationSpeed not yet implemented in context");
  }, []);

  return {
    isRotating,
    toggleRotation,
    setRotation,
    rotationSpeed,
    setRotationSpeed,
  };
}

/**
 * Хук для управления темой сцены
 */
interface UseTheme {
  theme: ThemeType;
  setTheme: (theme: ThemeType | ((prev: ThemeType) => ThemeType)) => void;
  availableThemes: string[];
  nextTheme: () => void;
  previousTheme: () => void;
}

const AVAILABLE_THEMES = ["dark", "light", "blue", "purple", "ambient", "relax", "auto"];

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

/**
 * Хук для управления текстурами книги
 */
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
