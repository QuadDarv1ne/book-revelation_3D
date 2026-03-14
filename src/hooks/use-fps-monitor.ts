"use client";

import { useState, useEffect, useRef, useCallback } from 'react';

interface FPSStats {
  fps: number;
  frameTime: number;
  min: number;
  max: number;
  avg: number;
}

export function useFPSMonitor(enabled = true): FPSStats & { reset: () => void } {
  const [fps, setFps] = useState(60);
  const [frameTime, setFrameTime] = useState(16.67);
  const [min, setMin] = useState(60);
  const [max, setMax] = useState(60);
  
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef<number>(0);
  const minRef = useRef(60);
  const maxRef = useRef(60);
  const totalFramesRef = useRef(0);
  const totalTimeRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);

  // Инициализация при монтировании
  useEffect(() => {
    lastTimeRef.current = performance.now();
  }, []);

  const reset = useCallback(() => {
    frameCountRef.current = 0;
    lastTimeRef.current = performance.now();
    minRef.current = 60;
    maxRef.current = 60;
    totalFramesRef.current = 0;
    totalTimeRef.current = 0;
    setFps(60);
    setFrameTime(16.67);
    setMin(60);
    setMax(60);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const measure = () => {
      const now = performance.now();
      const delta = now - lastTimeRef.current;
      
      frameCountRef.current++;
      totalFramesRef.current++;
      totalTimeRef.current += delta;

      if (delta > 0) {
        const currentFps = 1000 / delta;
        if (currentFps < minRef.current) minRef.current = currentFps;
        if (currentFps > maxRef.current) maxRef.current = currentFps;
      }

      if (now - lastTimeRef.current >= 1000) {
        const avg = totalTimeRef.current > 0 
          ? (totalFramesRef.current / totalTimeRef.current) * 1000 
          : 60;
        
        setFps(frameCountRef.current);
        setFrameTime(1000 / frameCountRef.current);
        setMin(Math.round(minRef.current));
        setMax(Math.round(maxRef.current));
        setFps(Math.round(avg));
        
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }

      rafIdRef.current = requestAnimationFrame(measure);
    };

    rafIdRef.current = requestAnimationFrame(measure);

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [enabled]);

  const avg = Math.round(totalFramesRef.current > 0 
    ? (totalFramesRef.current / totalTimeRef.current) * 1000 
    : 60);

  return {
    fps,
    frameTime: Math.round(frameTime * 100) / 100,
    min,
    max,
    avg,
    reset,
  };
}
