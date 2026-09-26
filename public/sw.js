// BikeBack service worker: offline fallback + web push notifications.
const CACHE = "bikeback-v1";
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", event => {
    event.waitUntil(caches.open(CACHE).then(cache => cache.addAll([OFFLINE_URL, "/icon-192.png"])));
    self.skipWaiting();
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

// Network first for page navigations; show the offline page when there is no connection.
self.addEventListener("fetch", event => {
    if (event.request.mode !== "navigate") return;
    event.respondWith(fetch(event.request).catch(() => caches.match(OFFLINE_URL)));
});

self.addEventListener("push", event => {
    let data = {};
    try {
        data = event.data ? event.data.json() : {};
    } catch {
        data = { body: event.data && event.data.text() };
    }
    event.waitUntil(
        self.registration.showNotification(data.title || "BikeBack", {
            body: data.body || "",
            icon: "/icon-192.png",
            badge: "/icon-192.png",
            data: { url: data.url || "/dashboard" }
        })
    );
});

self.addEventListener("notificationclick", event => {
    event.notification.close();
    const url = (event.notification.data && event.notification.data.url) || "/dashboard";
    event.waitUntil(
        self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(clients => {
            for (const client of clients) {
                if ("focus" in client) {
                    client.navigate(url);
                    return client.focus();
                }
            }
            return self.clients.openWindow(url);
        })
    );
});
