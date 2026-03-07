"use client";

import { useEffect } from "react";

interface SentryInitProps {
  dsn?: string;
  environment?: string;
  enabled?: boolean;
}

type SentryType = {
  isInitialized?: () => boolean;
  setContext: (key: string, value: Record<string, unknown>) => void;
  captureException: (error: Error, context?: Record<string, unknown>) => void;
  captureMessage: (message: string, options: Record<string, unknown>) => void;
  init: (options: Record<string, unknown>) => void;
};

declare global {
  interface Window {
    Sentry?: SentryType;
  }
}

/**
 * Компонент для инициализации Sentry
 */
export function SentryInit({
  dsn = process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment = process.env.NODE_ENV,
  enabled = process.env.NODE_ENV === 'production'
}: SentryInitProps) {
  useEffect(() => {
    if (!enabled || !dsn) {
      return;
    }

    const Sentry = window.Sentry;
    if (Sentry && Sentry.isInitialized?.()) {
      return;
    }

    if (Sentry) {
      Sentry.init({
        dsn,
        environment,
        tracesSampleRate: environment === 'production' ? 0.1 : 0.3,
      });
    }
  }, [dsn, environment, enabled]);

  return null;
}

export function withSentryErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  _componentName?: string
) {
  return function SentryWrappedComponent(props: P) {
    useEffect(() => {
      const Sentry = window.Sentry;

      if (!Sentry) {
        return;
      }

      Sentry.setContext('component', {
        name: _componentName,
      });
    }, []);

    return <WrappedComponent {...props} />;
  };
}

export function useSentryErrorLogging() {
  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      const Sentry = window.Sentry;
      if (!Sentry || !Sentry.isInitialized?.()) {
        return;
      }

      Sentry.captureException(error.error, {
        tags: {
          error_type: 'unhandled_error',
        },
        extra: {
          filename: error.filename,
          lineno: error.lineno,
          colno: error.colno,
        },
      });
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      const Sentry = window.Sentry;
      if (!Sentry || !Sentry.isInitialized?.()) {
        return;
      }

      Sentry.captureException(event.reason, {
        tags: {
          error_type: 'unhandled_rejection',
        },
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  const captureError = (error: Error, context?: Record<string, unknown>) => {
    const Sentry = window.Sentry;
    if (!Sentry || !Sentry.isInitialized?.()) {
      return;
    }

    Sentry.captureException(error, {
      extra: context,
    });
  };

  return { captureError };
}
