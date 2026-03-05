import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useFavorites } from '@/hooks/use-favorites';

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
      result.current.toggleFavorite(1);
    });

    expect(result.current.favorites).toContain(1);
    expect(result.current.isFavorite(1)).toBe(true);
  });

  it('should remove from favorites on second toggle', async () => {
    const { result } = renderHook(() => useFavorites());

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true);
    });

    act(() => {
      result.current.toggleFavorite(1);
      result.current.toggleFavorite(1);
    });

    expect(result.current.favorites).not.toContain(1);
    expect(result.current.isFavorite(1)).toBe(false);
  });

  it('should clear all favorites', async () => {
    const { result } = renderHook(() => useFavorites());

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true);
    });

    act(() => {
      result.current.toggleFavorite(1);
      result.current.toggleFavorite(2);
      result.current.toggleFavorite(3);
    });

    expect(result.current.favorites.length).toBe(3);

    act(() => {
      result.current.clearFavorites();
    });

    expect(result.current.favorites).toEqual([]);
  });

  it('should load favorites from localStorage', async () => {
    localStorage.setItem('stoic-favorites', JSON.stringify([5, 10, 15]));

    const { result } = renderHook(() => useFavorites());

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true);
    });

    expect(result.current.favorites).toEqual([5, 10, 15]);
  });
});
