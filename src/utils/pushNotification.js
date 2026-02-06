import axios from 'axios';
// HARDCODED KEY (Debugging iOS Issue - Env Var propagation fix)
export const publicVapidKey = "BK8dUHkFU9-FUji0p9ZCH73InHmvIWYhNeHnjg6sR3iBw1gFfqArwX4XkC6XwirE7tLmBUMcOVB58tNjQlPJmuI";
// const publicVapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;

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

export async function subscribeToPushNotifications(force = false) {
    if ('serviceWorker' in navigator) {
        try {
            const register = await navigator.serviceWorker.ready;

            // iOS Check: pushManager var mı?
            if (!register.pushManager) {
                // ... (Existing check)
                const isSecure = window.isSecureContext;
                const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

                alert(`HATA: pushManager yok.\n
                - iOS: 18 (Teyitli)
                - Güvenli Site (HTTPS): ${isSecure ? 'EVET' : 'HAYIR'}
                - Uygulama Modu (Standalone): ${isStandalone ? 'EVET' : 'HAYIR'}
                
                Lütfen 'HAYIR' olan maddeyi düzeltin.`);
                return;
            }

            // ----------------------------------------------------
            // VAPID KEY MIGRATION / REPAIR LOGIC
            // ----------------------------------------------------
            const storedKey = localStorage.getItem('vapid_public_key');
            const currentKey = publicVapidKey;

            // If the key has changed (or first run with this logic), we MUST unsubscribe old one
            // because the old subscription is cryptographically invalid for the new Private Key.
            if (storedKey !== currentKey) {
                console.log("⚠️ VAPID Key changed (or new). Validating subscription...");
                try {
                    const existingSub = await register.pushManager.getSubscription();
                    if (existingSub) {
                        await existingSub.unsubscribe();
                        console.log("♻️ Old subscription unsubscribed for key migration.");
                    }
                    localStorage.setItem('vapid_public_key', currentKey);
                } catch (e) {
                    console.error("Key migration error:", e);
                }
            } else if (force) {
                // Manual force logic
                const existingSub = await register.pushManager.getSubscription();
                if (existingSub) {
                    await existingSub.unsubscribe();
                    console.log("Existing subscription unsubscribed due to force flag.");
                }
            }

            const subscription = await register.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
            });

            // ... (rest of code)

            const API_URL = import.meta.env.VITE_API_URL + '/';

            // ...

            // Custom view kullanıyoruz
            const token = localStorage.getItem('access_token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            await axios.post(`${API_URL}notifications/register_subscription/`, {
                subscription: subscription.toJSON(),
                browser: navigator.userAgent
            }, { headers });

            console.log('Push Notification Subscribed Successfully');
        } catch (error) {
            console.error('Push Notification Subscription Failed:', error);
            // Alert removed, let the caller handle UI feedback if needed
        }
    }
}
