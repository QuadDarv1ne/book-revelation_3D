import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { Book3DProvider } from "@/contexts/Book3DContext";
import { useBookRotation } from "@/hooks/use-scene-controls";

function wrapWithProvider<T>(hook: () => T) {
  return renderHook(hook, {
    wrapper: ({ children }) => (
      <Book3DProvider>
        {children}
      </Book3DProvider>
    ),
  });
}

describe("useBookRotation", () => {
  it("должен начинать с isRotating = true", () => {
    const { result } = wrapWithProvider(() => useBookRotation());

    expect(result.current.isRotating).toBe(true);
  });

  it("должен переключать вращение через toggleRotation", () => {
    const { result } = wrapWithProvider(() => useBookRotation());

    act(() => {
      result.current.toggleRotation();
    });

    expect(result.current.isRotating).toBe(false);

    act(() => {
      result.current.toggleRotation();
    });

    expect(result.current.isRotating).toBe(true);
  });
});
