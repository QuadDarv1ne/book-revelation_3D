import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useFavorites } from '@/hooks/use-favorites';
import type { Quote } from '@/types/quote';

const mockQuote1: Quote = { text: 'Test quote 1', author: 'Author 1', category: 'wisdom' };
const mockQuote2: Quote = { text: 'Test quote 2', author: 'Author 2', category: 'life' };

describe('useFavorites', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should return initial state', async () => {
    const { result } = renderHook(() => useFavorites());

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true);
    });

    expect(result.current.favorites).toEqual([]);
    expect(typeof result.current.toggleFavorite).toBe('function');
    expect(typeof result.current.isFavorite).toBe('function');
    expect(typeof result.current.clearFavorites).toBe('function');
  });

  it('should toggle favorite', async () => {
    const { result } = renderHook(() => useFavorites());

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true);
    });

    act(() => {
      result.current.toggleFavorite(mockQuote1);
    });

    expect(result.current.favorites.some(q => q.text === mockQuote1.text)).toBe(true);
    expect(result.current.isFavorite(mockQuote1)).toBe(true);
  });

  it('should remove from favorites on second toggle', async () => {
    const { result } = renderHook(() => useFavorites());

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true);
    });

    act(() => {
      result.current.toggleFavorite(mockQuote1);
    });

    await waitFor(() => {
      expect(result.current.favorites.length).toBe(1);
    });

    act(() => {
      result.current.toggleFavorite(mockQuote1);
    });

    await waitFor(() => {
      expect(result.current.favorites.some(q => q.text === mockQuote1.text)).toBe(false);
      expect(result.current.isFavorite(mockQuote1)).toBe(false);
    });
  });

  it('should clear all favorites', async () => {
    const { result } = renderHook(() => useFavorites());

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true);
    });

    act(() => {
      result.current.toggleFavorite(mockQuote1);
    });

    await waitFor(() => {
      expect(result.current.favorites.length).toBe(1);
    });

    act(() => {
      result.current.toggleFavorite(mockQuote2);
    });

    await waitFor(() => {
      expect(result.current.favorites.length).toBe(2);
    });

    act(() => {
      result.current.clearFavorites();
    });

    await waitFor(() => {
      expect(result.current.favorites).toEqual([]);
    });
  });

  it('should export favorites', async () => {
    const { result } = renderHook(() => useFavorites());

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true);
    });

    act(() => {
      result.current.toggleFavorite(mockQuote1);
    });

    const exported = result.current.exportFavorites();
    expect(exported).toContain('Test quote 1');
    expect(exported).toContain('version');
  });

  it('should return null when exporting empty favorites', async () => {
    const { result } = renderHook(() => useFavorites());

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true);
    });

    const exported = result.current.exportFavorites();
    expect(exported).toBeNull();
  });

  it('should import favorites', async () => {
    const { result } = renderHook(() => useFavorites());

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true);
    });

    const importData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      favorites: [mockQuote1, mockQuote2],
    };

    act(() => {
      const importResult = result.current.importFavorites(JSON.stringify(importData));
      expect(importResult.success).toBe(true);
    });

    expect(result.current.favorites.length).toBe(2);
  });

  it('should fail import with invalid data', async () => {
    const { result } = renderHook(() => useFavorites());

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true);
    });

    act(() => {
      const importResult = result.current.importFavorites('invalid json');
      expect(importResult.success).toBe(false);
    });
  });
});
