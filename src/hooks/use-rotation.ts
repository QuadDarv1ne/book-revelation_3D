import { useState, useCallback, useEffect } from "react";

export function useRotationControl() {
  const [isRotating, setIsRotating] = useState(() => {
    if (typeof window === "undefined") return true;
    const saved = localStorage.getItem("rotation");
    return saved !== null ? saved === "true" : true;
  });

  const toggleRotation = useCallback(() => {
    setIsRotating(prev => {
      const newValue = !prev;
      localStorage.setItem("rotation", String(newValue));
      return newValue;
    });
  }, []);

  const setRotation = useCallback((rotating: boolean) => {
    setIsRotating(rotating);
    localStorage.setItem("rotation", String(rotating));
  }, []);

  // Sync with keyboard shortcut (Space)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " && e.target === document.body) {
        e.preventDefault();
        toggleRotation();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleRotation]);

  return { isRotating, toggleRotation, setRotation };
}
