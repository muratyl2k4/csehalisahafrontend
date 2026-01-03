import axios from 'axios';

const publicVapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export async function subscribeToPushNotifications() {
    if ('serviceWorker' in navigator) {
        try {
            const register = await navigator.serviceWorker.ready;

            const subscription = await register.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
            });
            // Backend'e abonelik bilgisini gönder
            // API_URL genellikle 'http://domain.com/api/' formatındadır.
            // WebPush endpointimiz '/webpush/' veya '/api/notifications/...' altında olabilir.
            // Bizim kurgumuzda: /api/notifications/register_subscription/

            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/';

            // API_URL'den base domaini çıkarmaya gerek yok, direkt API_URL kullanabiliriz 
            // Çünkü endpointimiz: API_URL + 'notifications/register_subscription/'
            // Eğer API_URL '.../api/' ile bitiyorsa:

            const subscriptionJSON = subscription.toJSON();
            console.log('Sending subscription:', subscriptionJSON);

            // Headers hazırla
            const headers = {
                'Content-Type': 'application/json'
            };

            // Eğer token varsa ekle (Kullanıcı eşleştirmesi için)
            const token = localStorage.getItem('access_token');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            // Custom view kullanıyoruz
            await axios.post(`${API_URL}notifications/register_subscription/`, {
                subscription: subscriptionJSON,
                browser: navigator.userAgent
            }, { headers });

            console.log('Push Notification Subscribed Successfully');
        } catch (error) {
            console.error('Push Notification Subscription Failed:', error);
        }
    }
}
