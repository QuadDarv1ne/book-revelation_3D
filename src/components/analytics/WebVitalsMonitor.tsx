"use client";

import { useReportWebVitals } from "next/web-vitals";

export function WebVitalsMonitor() {
  useReportWebVitals((metric) => {
    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.warn(`[WebVitals] ${metric.name}:`, metric.value);
    }

    // Send to analytics endpoint
    const body = {
      dsn: process.env.NEXT_PUBLIC_WEB_VITALS_DSN,
      id: metric.id,
      name: metric.name,
      value: metric.value,
      path: window.location.pathname,
      userAgent: navigator.userAgent,
    };

    // Send to your analytics endpoint
    if (process.env.NEXT_PUBLIC_WEB_VITALS_ENDPOINT) {
      fetch(process.env.NEXT_PUBLIC_WEB_VITALS_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).catch((err) => {
        console.error("[WebVitals] Failed to send metric:", err);
      });
    }
  });

  return null;
}
