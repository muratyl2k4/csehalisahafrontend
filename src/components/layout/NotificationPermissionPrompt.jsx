import React, { useState, useEffect } from 'react';
import { Bell, X } from "lucide-react";
import { subscribeToPushNotifications } from '../../utils/pushNotification';
import { useToast } from '../../context/ToastContext';

const NotificationPermissionPrompt = () => {
    const [showPrompt, setShowPrompt] = useState(false);
    const { success, error } = useToast();

    useEffect(() => {
        // Only show if permission is 'default' (not granted or denied yet)
        if ('Notification' in window && Notification.permission === 'default') {
            // Also checking if we are in a secure context or localhost, otherwise it won't work anyway
            if (window.isSecureContext) {
                setShowPrompt(true);
            }
        }
    }, []);

    const handleEnable = async () => {
        try {
            await subscribeToPushNotifications();
            // If we successfully subscribed, permission is now 'granted'
            if (Notification.permission === 'granted') {
                setShowPrompt(false);
                success("Bildirimler açıldı! 🔔");
            }
        } catch (err) {
            console.error(err);
            error("Hata: " + err.message);
        }
    };

    if (!showPrompt) return null;

    return (
        <div style={{
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            backgroundColor: 'var(--primary)', // Using app primary color
            color: 'white',
            zIndex: 9998, // Below PWA Install Prompt (9999) if both active
            padding: '12px 16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    borderRadius: '50%',
                    padding: '8px'
                }}>
                    <Bell size={20} color="white" />
                </div>
                <div style={{ fontSize: '14px', fontWeight: '500' }}>
                    Bildirimleri almak istiyor musunuz?
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                    onClick={handleEnable}
                    style={{
                        backgroundColor: 'white',
                        color: 'var(--primary)',
                        border: 'none',
                        borderRadius: '20px',
                        padding: '6px 16px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer'
                    }}
                >
                    Aç
                </button>
                <button
                    onClick={() => setShowPrompt(false)}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'rgba(255,255,255,0.8)',
                        cursor: 'pointer',
                        padding: '4px'
                    }}
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    );
};

export default NotificationPermissionPrompt;
