
self.addEventListener('install', (event) => {
    self.skipWaiting();
    console.log('Service Worker installed');
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
    console.log('Service Worker activated');
});

// Push Bildirimini Yakalama
self.addEventListener('push', function (event) {
    if (event.data) {
        const data = event.data.json();
        console.log('Push data received:', data); // Debug log

        const title = data.title || data.head || 'CSE Lig';
        const options = {
            body: data.body,
            icon: '/logo1.png',
            badge: '/logo1.png',
            vibrate: [100, 50, 100],
            data: {
                url: data.url || '/', // URL'i data objesine ekle
                dateOfArrival: Date.now()
            }
        };
        event.waitUntil(
            self.registration.showNotification(title, options)
        );
    }
});

// Bildirime Tıklama İşlemi
self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url || '/')
    );
});
