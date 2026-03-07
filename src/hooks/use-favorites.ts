"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

export function useFavorites() {
  const [favorites, setFavorites] = useState<number[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Экспорт избранных цитат в JSON
  const exportFavorites = useCallback(() => {
    if (favorites.length === 0) {
      return null;
    }
    
    const exportData = {
      version: "1.0",
      timestamp: new Date().toISOString(),
      favorites: favorites,
      total: favorites.length
    };
    
    return JSON.stringify(exportData, null, 2);
  }, [favorites]);

  // Импорт избранных цитат из JSON
  const importFavorites = useCallback((jsonString: string) => {
    try {
      const importData = JSON.parse(jsonString);
      
      // Валидация структуры данных
      if (!importData.favorites || !Array.isArray(importData.favorites)) {
        throw new Error("Неверный формат данных");
      }
      
      // Проверка, что все элементы массива - числа
      if (!importData.favorites.every((index: any) => typeof index === 'number' && index >= 0)) {
        throw new Error("Неверный формат индексов цитат");
      }
      
      setFavorites(importData.favorites);
      return { success: true, count: importData.favorites.length };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Неизвестная ошибка" };
    }
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("stoic-favorites");
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (error) {
      console.warn("Failed to load favorites:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem("stoic-favorites", JSON.stringify(favorites));
      } catch (error) {
        console.warn("Failed to save favorites:", error);
      }
    }
  }, [favorites, isLoaded]);

  const toggleFavorite = useCallback((index: number) => {
    setFavorites((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  }, []);

  const favoritesSet = useMemo(() => new Set(favorites), [favorites]);

  const isFavorite = useCallback(
    (index: number) => favoritesSet.has(index),
    [favoritesSet]
  );

  const clearFavorites = useCallback(() => {
    setFavorites([]);
  }, []);

  return {
    favorites,
    isLoaded,
    toggleFavorite,
    isFavorite,
    clearFavorites,
    favoritesSet,
    exportFavorites,
    importFavorites,
  };
}
