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
            await axios.post('http://127.0.0.1:8000/webpush/save_information', {
                status_type: 'subscribe',
                subscription: subscription.toJSON(),
                browser: navigator.userAgent
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    // Token eklenecek (Auth yapısı varsa)
                    'Authorization': `Bearer ${localStorage.getItem('access')}`
                }
            });

            console.log('Push Notification Subscribed');
        } catch (error) {
            console.error('Push Notification Subscription Failed:', error);
        }
    }
}
