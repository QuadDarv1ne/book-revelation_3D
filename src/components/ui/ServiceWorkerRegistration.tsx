"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    let registration: ServiceWorkerRegistration | null = null;

    const handleUpdateFound = () => {
      const newWorker = registration?.installing;
      if (newWorker) {
        const handleStateChange = () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.warn('New version available');
          }
        };
        newWorker.addEventListener('statechange', handleStateChange);
      }
    };

    if ("serviceWorker" in navigator) {
      // Register service worker
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          registration = reg;
          reg.addEventListener('updatefound', handleUpdateFound);
        })
        .catch((error) => {
          console.error("SW registration failed:", error);
        });
    }

    return () => {
      if (registration) {
        registration.removeEventListener('updatefound', handleUpdateFound);
      }
    };
  }, []);

  return null;
}
