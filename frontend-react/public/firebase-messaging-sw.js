// public/firebase-messaging-sw.js
importScripts("https://www.gstatic.com/firebasejs/12.14.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.14.0/firebase-messaging-compat.js");

const firebaseConfig = {
  apiKey: "AIzaSyAqnyGXILHs8nDrHSEpQMOMiaBNJOUqi3w",
  authDomain: "web-push-notification-364f4.firebaseapp.com",
  projectId: "web-push-notification-364f4",
  messagingSenderId: "375300245299",
  appId: "1:375300245299:web:af91964c17c5a182222046",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// 1. Native Push Listener (Highest Reliability)
self.addEventListener("push", (event) => {
  console.log("[SW] Push Event Triggered");
  
  let title = "VocaLab Reminder";
  let body = "";
  let link = "/";

  // Try to extract real data if available
  if (event.data) {
    try {
      const payload = event.data.json();
      console.log("[SW] Push Data:", payload);
      title = payload.notification?.title || payload.data?.title || title;
      body = payload.notification?.body || payload.data?.body || body;
      link = payload.data?.link || link;
    } catch (e) {
      console.log("[SW] Push data was not JSON, using defaults.");
    }
  }

  const promise = self.registration.showNotification(title, {
    body: body,
    icon: "/logo1.png",
    tag: "vocalab-push",
    data: { url: link }
  });

  event.waitUntil(promise);
});

// 2. Notification Click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientsList) => {
      for (const client of clientsList) {
        if (client.url === url && "focus" in client) return client.focus();
      }
      return clients.openWindow(url);
    })
  );
});

// 3. Keep SW active
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(clients.claim()));
