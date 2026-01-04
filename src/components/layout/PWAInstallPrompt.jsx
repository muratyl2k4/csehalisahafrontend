import React, { useState, useEffect } from 'react';
import { Share, X, Download } from "lucide-react";

const PWAInstallPrompt = () => {
    const [showPrompt, setShowPrompt] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [platform, setPlatform] = useState(null); // 'ios' or 'android'

    useEffect(() => {
        // 1. Android / Chrome (beforeinstallprompt)
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setPlatform('android');
            setShowPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // 2. iOS Check
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

        if (isIOS && !isStandalone) {
            setPlatform('ios');
            setShowPrompt(true);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setShowPrompt(false);
        }
        setDeferredPrompt(null);
    };

    if (!showPrompt) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: 'calc(20px + env(safe-area-inset-bottom))',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '90%',
            maxWidth: '400px',
            backgroundColor: 'rgba(20, 20, 20, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            zIndex: 9999,
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#fff' }}>
                    {platform === 'ios' ? 'Uygulamayı Yükle 📲' : 'Uygulamayı İndir 🚀'}
                </h3>
                <button
                    onClick={() => setShowPrompt(false)}
                    style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', padding: 0 }}
                >
                    <X size={20} />
                </button>
            </div>

            <p style={{ margin: 0, fontSize: '14px', color: '#ccc', lineHeight: '1.4' }}>
                Bildirimleri alabilmek için bu siteyi ana ekranınıza ekleyin.
            </p>

            {platform === 'ios' ? (
                // iOS Guide
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '14px',
                    color: '#4ade80',
                    background: 'rgba(74, 222, 128, 0.1)',
                    padding: '10px',
                    borderRadius: '8px'
                }}>
                    <Share size={20} />
                    <span>Paylaş butonuna basıp <b>"Ana Ekrana Ekle"</b> seçeneğini seçin.</span>
                </div>
            ) : (
                // Android Button
                <button
                    onClick={handleInstallClick}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        width: '100%',
                        padding: '12px',
                        backgroundColor: '#4f46e5',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: 'pointer'
                    }}
                >
                    <Download size={20} />
                    Yükle (Android)
                </button>
            )}
        </div>
    );
};

export default PWAInstallPrompt;
