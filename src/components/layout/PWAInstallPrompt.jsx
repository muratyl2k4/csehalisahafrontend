import React, { useState, useEffect } from 'react';
import { Share, X } from "lucide-react";

const PWAInstallPrompt = () => {
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        // 1. Check if iOS
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

        // 2. Check if already installed (Standalone mode)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

        // Show only if iOS AND NOT Standalone
        if (isIOS && !isStandalone) {
            // Check if user dismissed it recently (optional, let's show always for now until installed)
            setShowPrompt(true);
        }
    }, []);

    if (!showPrompt) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
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
                    Uygulamayı Yükle 📲
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
        </div>
    );
};

export default PWAInstallPrompt;
