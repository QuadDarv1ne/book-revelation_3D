"use client";

import { useBook3D } from "@/contexts/Book3DContext";

interface UseBookRotation {
  isRotating: boolean;
  toggleRotation: () => void;
}

export function useBookRotation(): UseBookRotation {
  const { isRotating, toggleRotation } = useBook3D();

  return {
    isRotating,
    toggleRotation,
  };
}
