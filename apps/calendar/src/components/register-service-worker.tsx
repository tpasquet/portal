"use client";

import { useEffect } from "react";

// Registers the service worker (PWA install + web push) once on the client.
export function RegisterServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/calendar/sw.js", { scope: "/calendar/" }).catch((err) => {
        console.error("Service worker registration failed", err);
      });
    }
  }, []);

  return null;
}
