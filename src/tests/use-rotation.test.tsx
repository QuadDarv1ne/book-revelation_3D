import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useRotationControl } from "@/hooks/use-rotation";

describe("useRotationControl", () => {
  it("должен инициализироваться с true по умолчанию", () => {
    const { result } = renderHook(() => useRotationControl());
    expect(result.current.isRotating).toBe(true);
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

  it("должен возвращать isRotating и toggleRotation", () => {
    const { result } = renderHook(() => useRotationControl());

    expect(result.current).toHaveProperty("isRotating");
    expect(result.current).toHaveProperty("toggleRotation");
    expect(typeof result.current.toggleRotation).toBe("function");
  });
});
