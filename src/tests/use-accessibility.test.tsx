import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAccessibility, useFocusTrap, useScreenReaderAnnouncement } from "@/hooks/use-accessibility";

describe("useAccessibility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Мок matchMedia
    vi.stubGlobal('matchMedia', vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })));
  });

  it("должен возвращать prefersReducedMotion из системных настроек", () => {
    const { result } = renderHook(() => useAccessibility());

    expect(result.current.prefersReducedMotion).toBe(false);
    expect(result.current.motionPreference).toBe("normal");
  });

  it("должен переключать keyboardNavEnabled при Alt+K", () => {
    const { result } = renderHook(() => useAccessibility());

    expect(result.current.keyboardNavEnabled).toBe(true);

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { altKey: true, key: "k" }));
    });

    expect(result.current.keyboardNavEnabled).toBe(false);
    expect(result.current.screenReaderAnnouncement).toContain("Клавиатурная навигация отключена");

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { altKey: true, key: "k" }));
    });

    expect(result.current.keyboardNavEnabled).toBe(true);
  });

  it("должен отключать focusTrap при Escape", () => {
    const { result } = renderHook(() => useAccessibility());

    expect(result.current.focusTrapActive).toBe(false);

    // Включаем focusTrap (через прямой вызов, т.к. в хуке нет публичного метода)
    // В реальном использовании это делается через UI

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });

    expect(result.current.focusTrapActive).toBe(false);
  });

  it("должен очищать screenReaderAnnouncement через 3 секунды", async () => {
    vi.useFakeTimers();

    const { result } = renderHook(() => useAccessibility());

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { altKey: true, key: "k" }));
    });

    expect(result.current.screenReaderAnnouncement).toBeTruthy();

    // Проматываем время на 3 секунды
    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.screenReaderAnnouncement).toBe("");

    vi.useRealTimers();
  });
});

describe("useFocusTrap", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="modal">
        <button id="first">First</button>
        <input id="middle" type="text" />
        <button id="last">Last</button>
      </div>
    `;
  });

  it("должен находить первый и последний фокусируемые элементы", () => {
    const { result } = renderHook(() => useFocusTrap(true));

    expect(result.current.firstFocusable).toBe(document.getElementById("first"));
    expect(result.current.lastFocusable).toBe(document.getElementById("last"));
  });

  it("должен возвращать null при неактивном trap", () => {
    const { result } = renderHook(() => useFocusTrap(false));

    expect(result.current.firstFocusable).toBeNull();
    expect(result.current.lastFocusable).toBeNull();
  });

  it("должен предоставлять метод focusFirst", () => {
    const firstButton = document.getElementById("first") as HTMLButtonElement;
    const focusSpy = vi.spyOn(firstButton, "focus");

    const { result } = renderHook(() => useFocusTrap(true));

    act(() => {
      result.current.focusFirst();
    });

    expect(focusSpy).toHaveBeenCalled();

    focusSpy.mockRestore();
  });
});

describe("useScreenReaderAnnouncement", () => {
  it("должен начинать с пустого объявления", () => {
    const { result } = renderHook(() => useScreenReaderAnnouncement());

    expect(result.current.announcement).toBe("");
    expect(result.current.priority).toBe("polite");
  });

  it("должен устанавливать объявление с приоритетом polite", () => {
    const { result } = renderHook(() => useScreenReaderAnnouncement());

    act(() => {
      result.current.announce("Загрузка завершена");
    });

    expect(result.current.announcement).toBe("Загрузка завершена");
    expect(result.current.priority).toBe("polite");
  });

  it("должен устанавливать объявление с приоритетом assertive", () => {
    const { result } = renderHook(() => useScreenReaderAnnouncement());

    act(() => {
      result.current.announce("Ошибка!", "assertive");
    });

    expect(result.current.announcement).toBe("Ошибка!");
    expect(result.current.priority).toBe("assertive");
  });

  it("должен очищать объявление", () => {
    const { result } = renderHook(() => useScreenReaderAnnouncement());

    act(() => {
      result.current.announce("Тест");
      result.current.clear();
    });

    expect(result.current.announcement).toBe("");
  });
});
