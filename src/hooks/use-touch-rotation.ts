import { useEffect, useState } from "react";

interface TouchState {
  startX: number;
  startY: number;
  isDragging: boolean;
}

export function useTouchRotation() {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [touchState, setTouchState] = useState<TouchState>({
    startX: 0,
    startY: 0,
    isDragging: false,
  });

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      setTouchState({
        startX: touch.clientX,
        startY: touch.clientY,
        isDragging: true,
      });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchState.isDragging) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - touchState.startX;
      const deltaY = touch.clientY - touchState.startY;

      setRotation((prev) => ({
        x: prev.x + deltaY * 0.5,
        y: prev.y + deltaX * 0.5,
      }));

      setTouchState((prev) => ({
        ...prev,
        startX: touch.clientX,
        startY: touch.clientY,
      }));
    };

    const handleTouchEnd = () => {
      setTouchState((prev) => ({ ...prev, isDragging: false }));
    };

    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchmove", handleTouchMove, { passive: true });
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [touchState.isDragging]);

  return { rotation, setRotation };
}
