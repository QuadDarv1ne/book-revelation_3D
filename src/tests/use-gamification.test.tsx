import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useGamification } from "@/hooks/use-gamification";

describe("useGamification", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("должен инициализироваться с правильными значениями", () => {
    const { result } = renderHook(() => useGamification());

    expect(result.current.achievements.length).toBeGreaterThan(0);
    expect(result.current.quoteOfDay).toHaveProperty("quote");
    expect(result.current.quoteOfDay).toHaveProperty("author");
  });

  it("должен увеличивать счётчик вращений без ошибок", () => {
    const { result } = renderHook(() => useGamification());

    expect(() => {
      act(() => {
        result.current.incrementRotations();
      });
    }).not.toThrow();
  });

  it("должен добавлять просмотренные темы без ошибок", () => {
    const { result } = renderHook(() => useGamification());

    expect(() => {
      act(() => {
        result.current.addThemeExplored("dark");
      });
    }).not.toThrow();
  });

  it("должен добавлять просмотренные книги без ошибок", () => {
    const { result } = renderHook(() => useGamification());

    expect(() => {
      act(() => {
        result.current.addBookViewed("marcus-aurelius-meditations");
      });
    }).not.toThrow();
  });

  it("должен увеличивать счётчик прочитанных цитат без ошибок", () => {
    const { result } = renderHook(() => useGamification());

    expect(() => {
      act(() => {
        result.current.incrementQuotesRead();
      });
    }).not.toThrow();
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
    expect(result.current.stats).toHaveProperty("totalRotations");
    expect(result.current.stats).toHaveProperty("quotesRead");
    expect(result.current.stats).toHaveProperty("quotesLiked");
    expect(result.current.stats).toHaveProperty("booksViewed");
    expect(result.current.stats).toHaveProperty("themesExplored");
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
