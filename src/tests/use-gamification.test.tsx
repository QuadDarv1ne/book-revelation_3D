import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useGamification } from "@/hooks/use-gamification";

describe("useGamification", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("должен инициализироваться с правильными значениями", () => {
    const { result } = renderHook(() => useGamification());

    expect(result.current.progress.totalVisits).toBeGreaterThanOrEqual(0);
    expect(result.current.progress.totalRotations).toBe(0);
    expect(result.current.progress.streakDays).toBe(0);
    expect(result.current.achievements.length).toBeGreaterThan(0);
  });

  it("должен увеличивать счётчик вращений", () => {
    const { result } = renderHook(() => useGamification());

    act(() => {
      result.current.incrementRotations();
    });

    expect(result.current.progress.totalRotations).toBe(1);
  });

  it("должен добавлять просмотренные темы", () => {
    const { result } = renderHook(() => useGamification());

    act(() => {
      result.current.addThemeExplored("dark");
    });

    expect(result.current.progress.themesExplored).toContain("dark");
    expect(result.current.progress.themesExplored.length).toBe(1);
  });

  it("не должен добавлять дубликаты тем", () => {
    const { result } = renderHook(() => useGamification());

    act(() => {
      result.current.addThemeExplored("dark");
      result.current.addThemeExplored("dark");
    });

    expect(result.current.progress.themesExplored.length).toBe(1);
  });

  it("должен добавлять просмотренные книги", () => {
    const { result } = renderHook(() => useGamification());

    act(() => {
      result.current.addBookViewed("marcus-aurelius-meditations");
    });

    expect(result.current.progress.booksViewed).toContain("marcus-aurelius-meditations");
  });

  it("должен увеличивать счётчик прочитанных цитат", () => {
    const { result } = renderHook(() => useGamification());

    act(() => {
      result.current.incrementQuotesRead();
    });

    expect(result.current.progress.quotesRead).toBe(1);
  });

  it("должен отслеживать время", () => {
    const { result } = renderHook(() => useGamification());

    act(() => {
      result.current.trackTime(30);
    });

    expect(result.current.progress.totalTimeSeconds).toBe(30);
  });

  it("должен вычислять процент завершения", () => {
    const { result } = renderHook(() => useGamification());

    expect(result.current.completionPercentage).toBeGreaterThanOrEqual(0);
    expect(result.current.completionPercentage).toBeLessThanOrEqual(100);
  });

  it("должен предоставлять статистику", () => {
    const { result } = renderHook(() => useGamification());

    expect(result.current.stats).toHaveProperty("totalAchievements");
    expect(result.current.stats).toHaveProperty("totalUnlocked");
    expect(result.current.stats).toHaveProperty("completionPercentage");
    expect(result.current.stats).toHaveProperty("totalVisits");
    expect(result.current.stats).toHaveProperty("totalRotations");
    expect(result.current.stats).toHaveProperty("quotesRead");
    expect(result.current.stats).toHaveProperty("quotesLiked");
    expect(result.current.stats).toHaveProperty("booksViewed");
    expect(result.current.stats).toHaveProperty("themesExplored");
    expect(result.current.stats).toHaveProperty("streakDays");
    expect(result.current.stats).toHaveProperty("totalTimeSeconds");
  });

  it("должен закрывать уведомление о достижении", () => {
    const { result } = renderHook(() => useGamification());

    expect(result.current.showAchievement).toBeNull();

    act(() => {
      result.current.dismissAchievement();
    });

    expect(result.current.showAchievement).toBeNull();
  });

  it("должен иметь достижения разных категорий", () => {
    const { result } = renderHook(() => useGamification());

    const categories = result.current.achievements.map(a => a.category);

    expect(categories).toContain("exploration");
    expect(categories).toContain("interaction");
    expect(categories).toContain("knowledge");
    expect(categories).toContain("special");
  });

  it("должен иметь цитату дня", () => {
    const { result } = renderHook(() => useGamification());

    expect(result.current.quoteOfDay).toHaveProperty("quote");
    expect(result.current.quoteOfDay).toHaveProperty("author");
    expect(result.current.quoteOfDay).toHaveProperty("date");
    expect(result.current.quoteOfDay).toHaveProperty("liked");
  });
});
