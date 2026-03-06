"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

export function useFavorites() {
  const [favorites, setFavorites] = useState<number[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

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
  };
}
