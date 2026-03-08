import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useRotationControl } from "@/hooks/use-rotation";

describe("useRotationControl", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("должен инициализироваться с true по умолчанию", () => {
    const { result } = renderHook(() => useRotationControl());
    expect(result.current.isRotating).toBe(true);
  });

  it("должен загружать сохранённое состояние из localStorage", () => {
    localStorage.setItem("rotation", "false");
    const { result } = renderHook(() => useRotationControl());
    expect(result.current.isRotating).toBe(false);
  });

  it("должен переключать состояние вращения", () => {
    const { result } = renderHook(() => useRotationControl());

    act(() => {
      result.current.toggleRotation();
    });

    expect(result.current.isRotating).toBe(false);

    act(() => {
      result.current.toggleRotation();
    });

    expect(result.current.isRotating).toBe(true);
  });

  it("должен сохранять состояние в localStorage", () => {
    const { result } = renderHook(() => useRotationControl());

    act(() => {
      result.current.toggleRotation();
    });

    expect(localStorage.getItem("rotation")).toBe("false");
  });

  it("должен устанавливать состояние через setRotation", () => {
    const { result } = renderHook(() => useRotationControl());

    act(() => {
      result.current.setRotation(false);
    });

    expect(result.current.isRotating).toBe(false);
    expect(localStorage.getItem("rotation")).toBe("false");

    act(() => {
      result.current.setRotation(true);
    });

    expect(result.current.isRotating).toBe(true);
    expect(localStorage.getItem("rotation")).toBe("true");
  });

  it("должен обрабатывать нажатие пробела", () => {
    const { result } = renderHook(() => useRotationControl());

    act(() => {
      const event = new KeyboardEvent("keydown", { key: " " });
      Object.defineProperty(event, "target", { value: document.body, writable: true });
      window.dispatchEvent(event);
    });

    expect(result.current.isRotating).toBe(false);
  });

  it("должен предотвращать скролл при пробеле", () => {
    renderHook(() => useRotationControl());

    const event = new KeyboardEvent("keydown", { key: " " });
    Object.defineProperty(event, "target", { value: document.body, writable: true });
    const preventDefaultSpy = vi.spyOn(event, "preventDefault");

    act(() => {
      window.dispatchEvent(event);
    });

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it("должен возвращать все необходимые методы", () => {
    const { result } = renderHook(() => useRotationControl());

    expect(result.current).toHaveProperty("isRotating");
    expect(result.current).toHaveProperty("toggleRotation");
    expect(result.current).toHaveProperty("setRotation");
    expect(typeof result.current.toggleRotation).toBe("function");
    expect(typeof result.current.setRotation).toBe("function");
  });
});
