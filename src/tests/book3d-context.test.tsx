import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Book3DProvider, useBook3D } from "@/contexts/Book3DContext";

// Тестовый компонент для проверки контекста
function TestComponent() {
  const { isRotating, toggleRotation, theme, setTheme } = useBook3D();
  
  return (
    <div>
      <span data-testid="rotation-state">{isRotating ? "rotating" : "stopped"}</span>
      <span data-testid="theme-state">{theme}</span>
      <button onClick={toggleRotation}>Toggle Rotation</button>
      <button onClick={() => setTheme("light")}>Set Light Theme</button>
    </div>
  );
}

describe("Book3DContext", () => {
  it("должен предоставлять начальное состояние", () => {
    render(
      <Book3DProvider>
        <TestComponent />
      </Book3DProvider>
    );

    expect(screen.getByTestId("rotation-state")).toHaveTextContent("rotating");
    expect(screen.getByTestId("theme-state")).toHaveTextContent("dark");
  });

  it("должен переключать вращение", () => {
    render(
      <Book3DProvider>
        <TestComponent />
      </Book3DProvider>
    );

    const toggleButton = screen.getByText("Toggle Rotation");
    fireEvent.click(toggleButton);
    
    expect(screen.getByTestId("rotation-state")).toHaveTextContent("stopped");
    
    fireEvent.click(toggleButton);
    expect(screen.getByTestId("rotation-state")).toHaveTextContent("rotating");
  });

  it("должен изменять тему", () => {
    render(
      <Book3DProvider>
        <TestComponent />
      </Book3DProvider>
    );

    const themeButton = screen.getByText("Set Light Theme");
    fireEvent.click(themeButton);
    
    expect(screen.getByTestId("theme-state")).toHaveTextContent("light");
  });

  it("должен принимать начальную тему", () => {
    render(
      <Book3DProvider initialTheme="blue">
        <TestComponent />
      </Book3DProvider>
    );

    expect(screen.getByTestId("theme-state")).toHaveTextContent("blue");
  });

  it("должен принимать начальные изображения книги", () => {
    function ImageTestComponent() {
      const { bookImages } = useBook3D();
      
      return (
        <div>
          <span data-testid="cover">{bookImages.cover || "none"}</span>
          <span data-testid="spine">{bookImages.spine || "none"}</span>
        </div>
      );
    }

    render(
      <Book3DProvider initialBookImages={{ cover: "/test-cover.jpg", spine: "/test-spine.jpg" }}>
        <ImageTestComponent />
      </Book3DProvider>
    );

    expect(screen.getByTestId("cover")).toHaveTextContent("/test-cover.jpg");
    expect(screen.getByTestId("spine")).toHaveTextContent("/test-spine.jpg");
  });

  it("должен выбрасывать ошибку при использовании вне провайдера", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    function BrokenComponent() {
      try {
        useBook3D();
        return <div>OK</div>;
      } catch {
        return <div>Error</div>;
      }
    }

    render(<BrokenComponent />);
    expect(screen.getByText("Error")).toBeInTheDocument();

    vi.restoreAllMocks();
  });
});

describe("Book3DContext - управление зумом", () => {
  it("должен иметь начальный зум 1", () => {
    function ZoomTestComponent() {
      const { cameraZoom } = useBook3D();
      return <span data-testid="zoom">{cameraZoom}</span>;
    }

    render(
      <Book3DProvider>
        <ZoomTestComponent />
      </Book3DProvider>
    );

    expect(screen.getByTestId("zoom")).toHaveTextContent("1");
  });

  it("должен увеличивать зум", () => {
    function ZoomTestComponent() {
      const { cameraZoom, zoomIn } = useBook3D();
      return (
        <div>
          <span data-testid="zoom">{cameraZoom}</span>
          <button onClick={zoomIn}>Zoom In</button>
        </div>
      );
    }

    render(
      <Book3DProvider>
        <ZoomTestComponent />
      </Book3DProvider>
    );

    fireEvent.click(screen.getByText("Zoom In"));
    expect(screen.getByTestId("zoom")).toHaveTextContent("1.2");
  });

  it("должен уменьшать зум", () => {
    function ZoomTestComponent() {
      const { cameraZoom, zoomOut } = useBook3D();
      return (
        <div>
          <span data-testid="zoom">{cameraZoom}</span>
          <button onClick={zoomOut}>Zoom Out</button>
        </div>
      );
    }

    render(
      <Book3DProvider>
        <ZoomTestComponent />
      </Book3DProvider>
    );

    fireEvent.click(screen.getByText("Zoom Out"));
    expect(screen.getByTestId("zoom")).toHaveTextContent("0.8");
  });

  it("должен иметь максимальный зум 2", () => {
    function ZoomTestComponent() {
      const { cameraZoom, zoomIn } = useBook3D();
      const handleClick = () => { for (let i = 0; i < 10; i++) zoomIn(); };
      return (
        <div>
          <span data-testid="zoom">{cameraZoom}</span>
          <button onClick={handleClick}>Zoom Max</button>
        </div>
      );
    }

    render(
      <Book3DProvider>
        <ZoomTestComponent />
      </Book3DProvider>
    );

    fireEvent.click(screen.getByText("Zoom Max"));
    expect(screen.getByTestId("zoom")).toHaveTextContent("2");
  });

  it("должен иметь минимальный зум 0.5", () => {
    function ZoomTestComponent() {
      const { cameraZoom, zoomOut } = useBook3D();
      const handleClick = () => { for (let i = 0; i < 10; i++) zoomOut(); };
      return (
        <div>
          <span data-testid="zoom">{cameraZoom}</span>
          <button onClick={handleClick}>Zoom Min</button>
        </div>
      );
    }

    render(
      <Book3DProvider>
        <ZoomTestComponent />
      </Book3DProvider>
    );

    fireEvent.click(screen.getByText("Zoom Min"));
    expect(screen.getByTestId("zoom")).toHaveTextContent("0.5");
  });
});

describe("Book3DContext - управление состоянием загрузки и ошибками", () => {
  it("должен иметь начальное состояние загрузки false", () => {
    function LoadingTestComponent() {
      const { isLoading } = useBook3D();
      return <span data-testid="loading">{isLoading ? "loading" : "idle"}</span>;
    }

    render(
      <Book3DProvider>
        <LoadingTestComponent />
      </Book3DProvider>
    );

    expect(screen.getByTestId("loading")).toHaveTextContent("idle");
  });

  it("должен устанавливать состояние загрузки", () => {
    function LoadingTestComponent() {
      const { isLoading, setIsLoading } = useBook3D();
      return (
        <div>
          <span data-testid="loading">{isLoading ? "loading" : "idle"}</span>
          <button onClick={() => setIsLoading(true)}>Start Loading</button>
        </div>
      );
    }

    render(
      <Book3DProvider>
        <LoadingTestComponent />
      </Book3DProvider>
    );

    fireEvent.click(screen.getByText("Start Loading"));
    expect(screen.getByTestId("loading")).toHaveTextContent("loading");
  });

  it("должен иметь начальное состояние ошибки null", () => {
    function ErrorTestComponent() {
      const { error } = useBook3D();
      return <span data-testid="error">{error || "none"}</span>;
    }

    render(
      <Book3DProvider>
        <ErrorTestComponent />
      </Book3DProvider>
    );

    expect(screen.getByTestId("error")).toHaveTextContent("none");
  });

  it("должен устанавливать ошибку", () => {
    function ErrorTestComponent() {
      const { error, setError } = useBook3D();
      return (
        <div>
          <span data-testid="error">{error || "none"}</span>
          <button onClick={() => setError("WebGL not supported")}>Set Error</button>
        </div>
      );
    }

    render(
      <Book3DProvider>
        <ErrorTestComponent />
      </Book3DProvider>
    );

    fireEvent.click(screen.getByText("Set Error"));
    expect(screen.getByTestId("error")).toHaveTextContent("WebGL not supported");
  });
});
