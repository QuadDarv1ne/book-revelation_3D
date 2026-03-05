"use client";

import { useState, useEffect, useCallback } from "react";

export function useFavorites() {
  const [favorites, setFavorites] = useState<number[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("stoic-favorites");
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (error) {
      console.warn("Failed to load favorites:", error);
    }
    setIsLoaded(true);
  }, []);

  // Save favorites to localStorage when changed
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

  const isFavorite = useCallback(
    (index: number) => favorites.includes(index),
    [favorites]
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
  };
}
