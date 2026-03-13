import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { Book3DProvider } from "@/contexts/Book3DContext";
import { useCameraControls, useBookRotation, useTheme, useBookTextures } from "@/hooks/use-scene-controls";

function wrapWithProvider<T>(hook: () => T) {
  return renderHook(hook, {
    wrapper: ({ children }) => (
      <Book3DProvider>
        {children}
      </Book3DProvider>
    ),
  });
}

describe("useCameraControls", () => {
  it("должен предоставлять начальный зум 1", () => {
    const { result } = wrapWithProvider(() => useCameraControls());

    expect(result.current.cameraZoom).toBe(1);
  });

  it("должен предоставлять FOV на основе зума", () => {
    const { result } = wrapWithProvider(() => useCameraControls());

    // BASE_FOV = 38, zoom = 1, fov = 38 / 1 = 38
    expect(result.current.fov).toBe(38);
  });

  it("должен увеличивать зум через zoomIn", () => {
    const { result } = wrapWithProvider(() => useCameraControls());

    act(() => {
      result.current.zoomIn();
    });

    expect(result.current.cameraZoom).toBe(1.2);
    expect(result.current.fov).toBeCloseTo(38 / 1.2, 2);
  });

  it("должен уменьшать зум через zoomOut", () => {
    const { result } = wrapWithProvider(() => useCameraControls());

    act(() => {
      result.current.zoomOut();
    });

    expect(result.current.cameraZoom).toBe(0.8);
    expect(result.current.fov).toBeCloseTo(38 / 0.8, 2);
  });

  it("должен сбрасывать зум через resetZoom", () => {
    const { result } = wrapWithProvider(() => useCameraControls());

    act(() => {
      result.current.zoomIn();
      result.current.zoomIn();
      result.current.resetZoom();
    });

    expect(result.current.cameraZoom).toBe(1);
  });

  it("должен ограничивать максимальный зум значением 2", () => {
    const { result } = wrapWithProvider(() => useCameraControls());

    act(() => {
      for (let i = 0; i < 10; i++) {
        result.current.zoomIn();
      }
    });

    expect(result.current.cameraZoom).toBe(2);
  });

  it("должен ограничивать минимальный зум значением 0.5", () => {
    const { result } = wrapWithProvider(() => useCameraControls());

    act(() => {
      for (let i = 0; i < 10; i++) {
        result.current.zoomOut();
      }
    });

    expect(result.current.cameraZoom).toBe(0.5);
  });

  it("должен предоставлять позицию камеры на основе зума", () => {
    const { result } = wrapWithProvider(() => useCameraControls());

    expect(result.current.position).toBeDefined();
    expect(result.current.position.y).toBeCloseTo(1.25, 2);
    expect(result.current.position.z).toBeCloseTo(4.0, 2);
  });
});

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

  it("должен предоставлять rotationSpeed по умолчанию 0.5", () => {
    const { result } = wrapWithProvider(() => useBookRotation());

    expect(result.current.rotationSpeed).toBe(0.5);
  });
});

describe("useTheme", () => {
  it("должен начинать с темой 'dark'", () => {
    const { result } = wrapWithProvider(() => useTheme());

    expect(result.current.theme).toBe("dark");
  });

  it("должен предоставлять список доступных тем", () => {
    const { result } = wrapWithProvider(() => useTheme());

    expect(result.current.availableThemes).toEqual([
      "dark",
      "light",
      "blue",
      "purple",
      "ambient",
      "relax",
      "auto",
    ]);
  });

  it("должен переключать на следующую тему через nextTheme", () => {
    const { result } = wrapWithProvider(() => useTheme());

    expect(result.current.theme).toBe("dark");

    act(() => {
      result.current.nextTheme();
    });

    expect(result.current.theme).toBe("light");
  });

  it("должен переключать на предыдущую тему через previousTheme", () => {
    const { result } = wrapWithProvider(() => useTheme());

    act(() => {
      result.current.previousTheme();
    });

    expect(result.current.theme).toBe("auto");
  });

  it("должен зацикливать темы при переходе за границу", () => {
    const { result } = wrapWithProvider(() => useTheme());

    act(() => {
      // Проходим по всем темам
      for (let i = 0; i < 8; i++) {
        result.current.nextTheme();
      }
    });

    // После полного круга должны вернуться к 'light' (т.к. начинаем с 'dark')
    expect(result.current.theme).toBe("light");
  });

  it("должен устанавливать тему через setTheme", () => {
    const { result } = wrapWithProvider(() => useTheme());

    act(() => {
      result.current.setTheme("purple");
    });

    expect(result.current.theme).toBe("purple");
  });
});

describe("useBookTextures", () => {
  it("должен начинать с пустыми изображениями", () => {
    const { result } = wrapWithProvider(() => useBookTextures());

    expect(result.current.coverImage).toBeUndefined();
    expect(result.current.spineImage).toBeUndefined();
    expect(result.current.backCoverImage).toBeUndefined();
  });

  it("должен устанавливать обложку через setCoverImage", () => {
    const { result } = wrapWithProvider(() => useBookTextures());

    act(() => {
      result.current.setCoverImage("/cover.jpg");
    });

    expect(result.current.coverImage).toBe("/cover.jpg");
  });

  it("должен устанавливать корешок через setSpineImage", () => {
    const { result } = wrapWithProvider(() => useBookTextures());

    act(() => {
      result.current.setSpineImage("/spine.jpg");
    });

    expect(result.current.spineImage).toBe("/spine.jpg");
  });

  it("должен устанавливать заднюю обложку через setBackCoverImage", () => {
    const { result } = wrapWithProvider(() => useBookTextures());

    act(() => {
      result.current.setBackCoverImage("/back.jpg");
    });

    expect(result.current.backCoverImage).toBe("/back.jpg");
  });

  it("должен сбрасывать все изображения через resetImages", () => {
    const { result } = wrapWithProvider(() => useBookTextures());

    act(() => {
      result.current.setCoverImage("/cover.jpg");
      result.current.setSpineImage("/spine.jpg");
      result.current.setBackCoverImage("/back.jpg");
      result.current.resetImages();
    });

    expect(result.current.coverImage).toBeUndefined();
    expect(result.current.spineImage).toBeUndefined();
    expect(result.current.backCoverImage).toBeUndefined();
  });

  it("должен сохранять другие изображения при обновлении одного", () => {
    const { result } = wrapWithProvider(() => useBookTextures());

    act(() => {
      result.current.setCoverImage("/cover.jpg");
      result.current.setSpineImage("/spine.jpg");
      result.current.setCoverImage("/new-cover.jpg");
    });

    expect(result.current.coverImage).toBe("/new-cover.jpg");
    expect(result.current.spineImage).toBe("/spine.jpg");
  });
});
