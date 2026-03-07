"use client";

import { useEffect, useCallback, useRef } from "react";

/**
 * Интерфейс для метрик WebGL
 */
export interface WebGLMetrics {
  renderer: string;
  vendor: string;
  version: string;
  maxTextureSize: number;
  maxViewportDims: number;
  maxVertexTextures: number;
  maxFragmentTextures: number;
  maxDrawBuffers: number;
  supportedExtensions: string[];
  isWebGL2: boolean;
  pixelRatio: number;
  devicePixelRatio: number;
}

/**
 * Интерфейс для событий производительности
 */
export interface PerformanceEvent {
  type: 'fps_drop' | 'memory_warning' | 'context_lost' | 'render_error';
  timestamp: number;
  details: Record<string, unknown>;
}

/**
 * Типы событий для трекинга
 */
export type AnalyticsEventType = 
  | 'scene_loaded'
  | 'scene_error'
  | 'texture_loaded'
  | 'texture_error'
  | 'rotation_toggled'
  | 'theme_changed'
  | 'zoom_changed'
  | 'book_selected'
  | 'achievement_unlocked'
  | 'quote_liked'
  | 'cover_uploaded'
  | 'webgl_error'
  | 'performance_issue';

/**
 * Интерфейс для события аналитики
 */
export interface AnalyticsEvent {
  type: AnalyticsEventType;
  timestamp: number;
  data?: Record<string, unknown>;
  metrics?: Partial<WebGLMetrics>;
}

/**
 * Хук для мониторинга WebGL и отслеживания производительности
 */
export function useWebGLMonitoring() {
  const metricsRef = useRef<WebGLMetrics | null>(null);
  const eventListenersRef = useRef<Set<(event: AnalyticsEvent) => void>>(new Set());
  const fpsRef = useRef<number>(60);
  const frameCountRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());

  // Получение информации о WebGL
  const getWebGLInfo = useCallback((canvas: HTMLCanvasElement): WebGLMetrics | null => {
    try {
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return null;

      const webglGl = gl as WebGLRenderingContext;
      const debugInfo = webglGl.getExtension('WEBGL_debug_renderer_info');
      const isWebGL2 = 'WEBGL2' in gl || canvas.getContext('webgl2') !== null;

      const metrics: WebGLMetrics = {
        renderer: debugInfo 
          ? (webglGl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) as string)
          : webglGl.getParameter(webglGl.RENDERER) as string,
        vendor: debugInfo
          ? (webglGl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) as string)
          : webglGl.getParameter(webglGl.VENDOR) as string,
        version: webglGl.getParameter(webglGl.VERSION) as string,
        maxTextureSize: webglGl.getParameter(webglGl.MAX_TEXTURE_SIZE) as number,
        maxViewportDims: webglGl.getParameter(webglGl.MAX_VIEWPORT_DIMS) as number,
        maxVertexTextures: webglGl.getParameter(webglGl.MAX_VERTEX_TEXTURE_IMAGE_UNITS) as number,
        maxFragmentTextures: webglGl.getParameter(webglGl.MAX_TEXTURE_IMAGE_UNITS) as number,
        maxDrawBuffers: isWebGL2 ? (gl as WebGL2RenderingContext).getParameter((gl as WebGL2RenderingContext).MAX_DRAW_BUFFERS) as number : 1,
        supportedExtensions: webglGl.getSupportedExtensions() || [],
        isWebGL2,
        pixelRatio: window.devicePixelRatio || 1,
        devicePixelRatio: window.devicePixelRatio || 1,
      };

      metricsRef.current = metrics;
      return metrics;
    } catch {
      return null;
    }
  }, []);

  // Проверка поддержки WebGL
  const checkWebGLSupport = useCallback((): { supported: boolean; error?: string } => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (!gl) {
        return { supported: false, error: 'WebGL not supported' };
      }

      const webglGl = gl as WebGLRenderingContext;

      // Проверяем минимальные требования
      const maxTextureSize = webglGl.getParameter(webglGl.MAX_TEXTURE_SIZE);
      if (maxTextureSize < 2048) {
        return { 
          supported: false, 
          error: `Max texture size too small: ${maxTextureSize} (required: 2048)` 
        };
      }

      return { supported: true };
    } catch {
      return { 
        supported: false, 
        error: 'Unknown error' 
      };
    }
  }, []);

  // Мониторинг FPS
  const monitorFPS = useCallback(() => {
    const now = performance.now();
    frameCountRef.current++;

    // Обновляем FPS каждую секунду
    if (now - lastTimeRef.current >= 1000) {
      fpsRef.current = Math.round((frameCountRef.current * 1000) / (now - lastTimeRef.current));
      frameCountRef.current = 0;
      lastTimeRef.current = now;

      // Отправляем событие при падении FPS
      if (fpsRef.current < 30) {
        const event: PerformanceEvent = {
          type: 'fps_drop',
          timestamp: now,
          details: { fps: fpsRef.current },
        };
        
        // Логгируем в консоль (в продакшене можно отправлять в Sentry)
        console.warn('FPS drop detected:', event);
      }
    }

    requestAnimationFrame(monitorFPS);
  }, []);

  // Отправка события аналитики
  const trackEvent = useCallback((event: AnalyticsEvent) => {
    const enrichedEvent = {
      ...event,
      timestamp: Date.now(),
      metrics: metricsRef.current || undefined,
    };

    eventListenersRef.current.forEach(listener => {
      try {
        listener(enrichedEvent);
      } catch {
        // Silent fail
      }
    });
  }, []);

  // Добавление слушателя событий
  const addEventListener = useCallback((listener: (event: AnalyticsEvent) => void) => {
    eventListenersRef.current.add(listener);
    return () => {
      eventListenersRef.current.delete(listener);
    };
  }, []);

  // Инициализация мониторинга
  useEffect(() => {
    // Запускаем мониторинг FPS
    const fpsMonitorId = requestAnimationFrame(monitorFPS);

    // Проверяем поддержку WebGL при загрузке
    const webGLSupport = checkWebGLSupport();
    if (!webGLSupport.supported) {
      trackEvent({
        type: 'webgl_error',
        timestamp: Date.now(),
        data: { error: webGLSupport.error },
      });
    }

    return () => {
      cancelAnimationFrame(fpsMonitorId);
    };
  }, [monitorFPS, checkWebGLSupport, trackEvent]);

  // Обработка потери WebGL контекста
  useEffect(() => {
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      trackEvent({
        type: 'webgl_error',
        timestamp: Date.now(),
        data: { error: 'WebGL context lost' },
      });
    };

    const handleContextRestored = () => {
      trackEvent({
        type: 'scene_loaded',
        timestamp: Date.now(),
        data: { restored: true },
      });
    };

    document.addEventListener('webglcontextlost', handleContextLost, false);
    document.addEventListener('webglcontextrestored', handleContextRestored, false);

    return () => {
      document.removeEventListener('webglcontextlost', handleContextLost);
      document.removeEventListener('webglcontextrestored', handleContextRestored);
    };
  }, [trackEvent]);

  return {
    getWebGLInfo,
    checkWebGLSupport,
    trackEvent,
    addEventListener,
    get metrics() {
      return metricsRef.current;
    },
    get fps() {
      return fpsRef.current;
    },
  };
}

/**
 * Хук для интеграции с Sentry
 */
export function useSentryIntegration() {
  const { trackEvent, addEventListener, getWebGLInfo } = useWebGLMonitoring();

  useEffect(() => {
    const Sentry = window.Sentry;
    if (!Sentry) {
      return;
    }

    const canvas = document.querySelector('canvas');
    if (canvas) {
      const webGLInfo = getWebGLInfo(canvas);
      if (webGLInfo) {
        Sentry.setContext('webgl', webGLInfo as unknown as Record<string, unknown>);
      }
    }

    const unsubscribe = addEventListener((event) => {
      if (['webgl_error', 'performance_issue'].includes(event.type)) {
        Sentry.captureMessage(`[Book3D] ${event.type}`, {
          level: event.type === 'webgl_error' ? 'error' : 'warning',
          tags: {
            event_type: event.type,
            component: 'book-3d',
          },
          extra: {
            data: event.data,
            metrics: event.metrics,
          },
        });
      }
    });

    return unsubscribe;
  }, [addEventListener, getWebGLInfo]);

  return {
    trackEvent,
  };
}

/**
 * Хук для трекинга пользовательских действий
 */
export function useUserActionTracking() {
  const { trackEvent } = useWebGLMonitoring();

  const trackSceneLoaded = useCallback((loadTime: number) => {
    trackEvent({
      type: 'scene_loaded',
      timestamp: Date.now(),
      data: { loadTime },
    });
  }, [trackEvent]);

  const trackSceneError = useCallback((error: string) => {
    trackEvent({
      type: 'scene_error',
      timestamp: Date.now(),
      data: { error },
    });
  }, [trackEvent]);

  const trackRotationToggled = useCallback((isRotating: boolean) => {
    trackEvent({
      type: 'rotation_toggled',
      timestamp: Date.now(),
      data: { isRotating },
    });
  }, [trackEvent]);

  const trackThemeChanged = useCallback((theme: string) => {
    trackEvent({
      type: 'theme_changed',
      timestamp: Date.now(),
      data: { theme },
    });
  }, [trackEvent]);

  const trackZoomChanged = useCallback((zoom: number) => {
    trackEvent({
      type: 'zoom_changed',
      timestamp: Date.now(),
      data: { zoom },
    });
  }, [trackEvent]);

  const trackBookSelected = useCallback((bookId: string) => {
    trackEvent({
      type: 'book_selected',
      timestamp: Date.now(),
      data: { bookId },
    });
  }, [trackEvent]);

  const trackAchievementUnlocked = useCallback((achievementId: string) => {
    trackEvent({
      type: 'achievement_unlocked',
      timestamp: Date.now(),
      data: { achievementId },
    });
  }, [trackEvent]);

  const trackQuoteLiked = useCallback((quoteId: string) => {
    trackEvent({
      type: 'quote_liked',
      timestamp: Date.now(),
      data: { quoteId },
    });
  }, [trackEvent]);

  const trackCoverUploaded = useCallback((success: boolean) => {
    trackEvent({
      type: 'cover_uploaded',
      timestamp: Date.now(),
      data: { success },
    });
  }, [trackEvent]);

  return {
    trackSceneLoaded,
    trackSceneError,
    trackRotationToggled,
    trackThemeChanged,
    trackZoomChanged,
    trackBookSelected,
    trackAchievementUnlocked,
    trackQuoteLiked,
    trackCoverUploaded,
  };
}
