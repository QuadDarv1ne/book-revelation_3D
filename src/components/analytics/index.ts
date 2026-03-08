// Sentry
export { SentryInit, withSentryErrorBoundary, useSentryErrorLogging } from "./SentryInit";

// Web Vitals
export { WebVitalsMonitor } from "./WebVitalsMonitor";

// WebGL Monitoring
export {
  useWebGLMonitoring,
  useSentryIntegration,
  useUserActionTracking
} from "@/hooks/use-webgl-monitoring";

export type {
  WebGLMetrics,
  PerformanceEvent,
  AnalyticsEventType,
  AnalyticsEvent
} from "@/hooks/use-webgl-monitoring";
