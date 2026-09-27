const CACHE_NAME = "family-calendar-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
    ),
  );
  self.clients.claim();
});

// Reminder notifications sent via the Web Push API (VAPID).
self.addEventListener("push", (event) => {
  if (!event.data) return;
  const payload = event.data.json();

  event.waitUntil(
    self.registration.showNotification(payload.title ?? "AT Calendar", {
      body: payload.body,
      icon: "/calendar/icons/icon.svg",
      data: { url: payload.url ?? "/calendar" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/calendar";
  event.waitUntil(self.clients.openWindow(url));
});
