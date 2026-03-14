"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useUserSettings } from "./use-user-settings";
import type { Quote } from "@/types/quote";

export function useFavorites() {
  const { settings, updateSettings } = useUserSettings();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const favorites = useMemo(() => settings.favorites, [settings.favorites]);

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

  const importFavorites = useCallback((jsonString: string) => {
    try {
      const importData = JSON.parse(jsonString);

      if (!importData.favorites || !Array.isArray(importData.favorites)) {
        throw new Error("Неверный формат данных");
      }

      if (!importData.favorites.every((q: Quote) => typeof q.text === 'string' && typeof q.author === 'string')) {
        throw new Error("Неверный формат цитат");
      }

      updateSettings('favorites', importData.favorites);
      return { success: true, count: importData.favorites.length };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Неизвестная ошибка" };
    }
  }, [updateSettings]);

  const exportFavoritesToFile = useCallback((exportData: string, showToast: (msg: string, type: "success" | "error" | "info") => void, captureMessage: (msg: string, level?: "info" | "warning" | "error") => void) => {
    try {
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `stoic-favorites-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast("Избранные цитаты экспортированы", "success");
      captureMessage("Favorites exported", "info");
    } catch (error) {
      showToast("Ошибка при экспорте", "error");
      throw error;
    }
  }, []);

  const importFavoritesFromFile = useCallback((jsonString: string, showToast: (msg: string, type: "success" | "error" | "info") => void, captureMessage: (msg: string, level?: "info" | "warning" | "error") => void, captureException: (error: Error) => void) => {
    const result = importFavorites(jsonString);

    if (result.success) {
      showToast(`Успешно импортировано ${result.count} цитат`, "success");
      captureMessage(`Favorites imported: ${result.count}`, "info");
    } else {
      captureException(new Error(result.error));
      showToast(`Ошибка импорта: ${result.error}`, "error");
    }

    return result;
  }, [importFavorites]);

  const toggleFavorite = useCallback((quote: Quote) => {
    const exists = favorites.some(q => q.text === quote.text);
    if (exists) {
      updateSettings('favorites', favorites.filter(q => q.text !== quote.text));
    } else {
      updateSettings('favorites', [...favorites, quote]);
    }
  }, [favorites, updateSettings]);

  const isFavorite = useCallback((quote: Quote) => {
    return favorites.some(q => q.text === quote.text);
  }, [favorites]);

  const clearFavorites = useCallback(() => {
    updateSettings('favorites', []);
  }, [updateSettings]);

  const favoritesSet = useMemo(() => new Set(favorites.map(q => q.text)), [favorites]);

  return {
    favorites,
    isLoaded,
    toggleFavorite,
    isFavorite,
    clearFavorites,
    favoritesSet,
    exportFavorites,
    importFavorites,
    exportFavoritesToFile,
    importFavoritesFromFile,
  };
}
