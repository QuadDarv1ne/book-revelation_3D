import { useState, useCallback } from "react";

export function useRotationControl() {
  const [isRotating, setIsRotating] = useState(true);
  const toggleRotation = useCallback(() => setIsRotating(prev => !prev), []);
  return { isRotating, toggleRotation, setIsRotating };
}
