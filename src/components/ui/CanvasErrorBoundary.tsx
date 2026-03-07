"use client";

import { Component, ErrorInfo, ReactNode } from "react";

interface CanvasErrorBoundaryProps {
  children: ReactNode;
  onCanvasError?: () => void;
}

interface CanvasErrorBoundaryState {
  hasError: boolean;
  errorCount: number;
}

/**
 * Error Boundary специально для Three.js Canvas компонентов
 * Автоматически пытается восстановить WebGL контекст при ошибках
 */
export class CanvasErrorBoundary extends Component<
  CanvasErrorBoundaryProps,
  CanvasErrorBoundaryState
> {
  public state: CanvasErrorBoundaryState = {
    hasError: false,
    errorCount: 0,
  };

  private resetTimeout: ReturnType<typeof setTimeout> | null = null;

  public static getDerivedStateFromError(): CanvasErrorBoundaryState {
    return { hasError: true, errorCount: 0 };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("CanvasErrorBoundary caught an error:", error, errorInfo);

    this.setState((prev) => ({
      errorCount: prev.errorCount + 1,
    }));

    // Автоматическая попытка восстановления через 2 секунды
    if (this.resetTimeout) {
      clearTimeout(this.resetTimeout);
    }

    this.resetTimeout = setTimeout(() => {
      this.attemptRecovery();
    }, 2000);

    this.props.onCanvasError?.();
  }

  private attemptRecovery = () => {
    // Очищаем WebGL контекст и пытаемся пересоздать
    const canvases = document.querySelectorAll("canvas");
    canvases.forEach((canvas) => {
      const gl = canvas.getContext("webgl") || canvas.getContext("webgl2");
      if (gl) {
        // Очищаем контекст
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      }
    });

    this.setState({ hasError: false });
  };

  public componentWillUnmount() {
    if (this.resetTimeout) {
      clearTimeout(this.resetTimeout);
    }
  }

  public render() {
    const { hasError, errorCount } = this.state;
    const { children } = this.props;

    if (hasError) {
      return (
        <div
          role="alert"
          className="flex items-center justify-center min-h-[400px] p-6"
        >
          <div className="max-w-md w-full p-6 rounded-2xl bg-amber-900/20 border border-amber-500/30 backdrop-blur-sm">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-amber-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-amber-200 mb-2">
                  Ошибка 3D сцены
                </h3>
                <p className="text-sm text-amber-300/80 mb-4">
                  {errorCount < 3
                    ? "Пытаемся восстановить сцену..."
                    : "Не удалось восстановить сцену"}
                </p>
                {errorCount >= 3 && (
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-amber-900"
                    type="button"
                  >
                    Перезагрузить страницу
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return children;
  }
}

export default CanvasErrorBoundary;
