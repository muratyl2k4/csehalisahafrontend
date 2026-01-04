import React, { useState, useEffect } from 'react';
import { Share, X, Download } from "lucide-react";

const PWAInstallPrompt = () => {
    const [showPrompt, setShowPrompt] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [platform, setPlatform] = useState(null); // 'ios', 'android', or null

    useEffect(() => {
        // 1. Check Install State
        // iOS Safari "navigator.standalone" property support
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
        if (isStandalone) return;

        // 2. Detect OS
        const ua = navigator.userAgent;
        // iPad detection (iPadOS 13+ requests desktop site by default)
        const isIPad = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
        const isIOS = /iPad|iPhone|iPod/.test(ua) || isIPad;
        const isAndroid = /Android/.test(ua);

        if (isIOS) {
            setPlatform('ios');
            setShowPrompt(true);
        } else if (isAndroid) {
            setPlatform('android');
            setShowPrompt(true);
        }

        // 3. Listen for Native Install Prompt (Android/Chrome)
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setPlatform('android');
            setShowPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    // ... handleInstallClick ...

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
            zIndex: 100000,
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
                    display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px',
                    color: '#4ade80', background: 'rgba(74, 222, 128, 0.1)', padding: '10px', borderRadius: '8px'
                }}>
                    <Share size={20} />
                    <span>Paylaş butonuna basıp <b>"Ana Ekrana Ekle"</b> seçeneğini seçin.</span>
                </div>
            ) : platform === 'android' && deferredPrompt ? (
                // Android Auto-Install Button (If event fired)
                <button
                    onClick={handleInstallClick}
                    style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        width: '100%', padding: '12px', backgroundColor: '#4f46e5', color: 'white',
                        border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer'
                    }}
                >
                    <Download size={20} />
                    Yükle (Android)
                </button>
            ) : (
                // Android Manual Guide (Fallback)
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px',
                    color: '#fbbf24', background: 'rgba(251, 191, 36, 0.1)', padding: '10px', borderRadius: '8px'
                }}>
                    <Download size={20} />
                    <span>Tarayıcı menüsünden (3 nokta) <b>"Uygulamayı Yükle"</b> seçeneğini seçin.</span>
                </div>
            )}
        </div>
    );
};

export default PWAInstallPrompt;
