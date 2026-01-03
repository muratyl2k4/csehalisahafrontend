import axios from 'axios';

const publicVapidKey = 'BOHqfyMHZP-9Po_eb3XI-0gK-VZccdrFYroITL_3cZzNj_X8umbTAqnkYkwW7Q_ao-kaYebHFPv9k_nvsSCrHFc';

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
            // Backend'e abonelik bilgisini gönder
            const API_URL = import.meta.env.VITE_API_URL || 'https://muratyl2k4.pythonanywhere.com/api/';
            // Clean URL to remove trailing slash if present for cleaner concatenation, though api/ is in VITE_API_URL usually.
            // Actually, webpush is at root/webpush/, not api/webpush/.
            // Let's use the domain base.

            // Allow flexibility
            const BASE_DOMAIN = 'https://muratyl2k4.pythonanywhere.com';

            await axios.post(`${BASE_DOMAIN}/webpush/save_information`, {
                status_type: 'subscribe',
                subscription: subscription.toJSON(),
                browser: navigator.userAgent
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    // Token eklenecek (Auth yapısı varsa)
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                }
            });

            console.log('Push Notification Subscribed');
        } catch (error) {
            console.error('Push Notification Subscription Failed:', error);
        }
    }
}
