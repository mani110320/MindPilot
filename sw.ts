
// Service Worker for MindPilot
// Handles background notifications and lock-screen actions

const CACHE_NAME = 'habitquest-cache-v1';

self.addEventListener('install', (event: any) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(['/']);
    })
  );
});

self.addEventListener('notificationclick', (event: any) => {
  const notification = event.notification;
  const action = event.action;
  const habitId = notification.data?.habitId;

  notification.close();

  if (action === 'complete') {
    // Handle completion from lock screen
    broadcastMessage({ type: 'HABIT_COMPLETE', habitId });
  } else if (action === 'snooze') {
    // Handle snooze from lock screen
    broadcastMessage({ type: 'HABIT_SNOOZE', habitId });
  } else {
    // Default click: focus the app
    event.waitUntil(
      // Fix: Casting self to any to access ServiceWorkerGlobalScope.clients
      (self as any).clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList: any[]) => {
        if (clientList.length > 0) {
          let client = clientList[0];
          for (let i = 0; i < clientList.length; i++) {
            if (clientList[i].focused) {
              client = clientList[i];
            }
          }
          return client.focus();
        }
        // Fix: Casting self to any to access ServiceWorkerGlobalScope.clients
        return (self as any).clients.openWindow('/');
      })
    );
  }
});

function broadcastMessage(message: any) {
  // Fix: Casting self to any to access ServiceWorkerGlobalScope.clients
  (self as any).clients.matchAll().then((clients: any[]) => {
    clients.forEach((client) => {
      client.postMessage(message);
    });
  });
}