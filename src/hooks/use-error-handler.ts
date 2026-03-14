"use client";

import { useEffect, useState, useCallback } from "react";

interface ErrorEvent {
  message: string;
  source?: string;
  lineno?: number;
  colno?: number;
  stack?: string;
  type: string;
}

interface ErrorHandlerOptions {
  enabled?: boolean;
  maxErrors?: number;
  onError?: (error: ErrorEvent) => void;
}

const ERROR_STORAGE_KEY = "app-errors";

export function useErrorHandler(options: ErrorHandlerOptions = {}) {
  const { enabled = true, maxErrors = 50, onError } = options;
  const [errors, setErrors] = useState<ErrorEvent[]>([]);
  const [errorCount, setErrorCount] = useState(0);

  const saveError = useCallback((error: ErrorEvent) => {
    if (!enabled) return;

    try {
      const stored = localStorage.getItem(ERROR_STORAGE_KEY);
      const existingErrors: ErrorEvent[] = stored ? JSON.parse(stored) : [];
      const updatedErrors = [...existingErrors, error].slice(-maxErrors);
      localStorage.setItem(ERROR_STORAGE_KEY, JSON.stringify(updatedErrors));
      setErrors(updatedErrors);
      setErrorCount(prev => prev + 1);
    } catch {
      // Игнорируем ошибки сохранения
    }

    onError?.(error);
  }, [enabled, maxErrors, onError]);

  useEffect(() => {
    if (!enabled) return;

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason instanceof Error 
        ? {
            message: event.reason.message,
            stack: event.reason.stack,
            type: "unhandledrejection",
          }
        : {
            message: String(event.reason),
            type: "unhandledrejection",
          };
      saveError(error as ErrorEvent);
    };

    const handleErrorEvent = (event: ErrorEvent & Event) => {
      saveError({
        message: event.message,
        source: event.source,
        lineno: event.lineno,
        colno: event.colno,
        type: "error",
      });
    };

    window.addEventListener("error", handleErrorEvent);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    // Загрузка сохранённых ошибок
    try {
      const stored = localStorage.getItem(ERROR_STORAGE_KEY);
      if (stored) {
        setErrors(JSON.parse(stored));
      }
    } catch {
      // Игнорируем
    }

    return () => {
      window.removeEventListener("error", handleErrorEvent);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, [enabled, saveError]);

  const clearErrors = useCallback(() => {
    localStorage.removeItem(ERROR_STORAGE_KEY);
    setErrors([]);
    setErrorCount(0);
  }, []);

  const getErrors = useCallback(() => {
    return errors;
  }, [errors]);

  const captureException = useCallback((error: Error, context?: Record<string, unknown>) => {
    saveError({
      message: error.message,
      stack: error.stack,
      type: "captured",
      ...context,
    });
  }, [saveError]);

  const captureMessage = useCallback((message: string, level: "info" | "warning" | "error" = "info") => {
    saveError({
      message,
      type: level,
    });
  }, [saveError]);

  return {
    errors,
    errorCount,
    clearErrors,
    getErrors,
    captureException,
    captureMessage,
  };
}
