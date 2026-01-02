import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyEmail, resendVerificationCode, logout } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Check, Loader2, Edit2, X } from 'lucide-react';
import '../styles/auth.css';

const VerifyEmail = () => {
    const navigate = useNavigate();
    const { success, error: showError } = useToast();
    const [verificationCode, setVerificationCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [cooldown, setCooldown] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [newEmail, setNewEmail] = useState('');

    // Initial load and countdown timer
    useEffect(() => {
        let interval;
        if (cooldown > 0) {
            interval = setInterval(() => {
                setCooldown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [cooldown]);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            navigate('/login');
            return;
        }

        const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
        const loadUserEmail = async () => {
            try {
                const apiModule = await import('../services/api');
                const api = apiModule.default;

                const res = await api.get('/players/me/');
                if (res.data.email) {
                    setUserEmail(res.data.email);
                } else if (res.data.username) {
                    setUserEmail(res.data.username);
                }
            } catch (err) {
                console.error("Failed to fetch user email", err);
                if (userInfo.name) setUserEmail(userInfo.name);
            }
        };

        loadUserEmail();

    }, [navigate]);

    const handleVerification = async () => {
        if (!verificationCode || verificationCode.length < 6) return;
        setLoading(true);
        try {
            await verifyEmail({
                email: userEmail,
                code: verificationCode
            });
            success('E-posta başarıyla doğrulandı!');

            const { refreshUserInfo } = await import('../services/api');
            await refreshUserInfo();

            navigate('/matches');
        } catch (err) {
            console.error(err);
            showError('Doğrulama başarısız. Kodu kontrol ediniz.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendLoading || cooldown > 0) return;
        setResendLoading(true);
        try {
            await resendVerificationCode({ email: userEmail });
            success('Yeni doğrulama kodu gönderildi.');
            setCooldown(60); // Start 60s cooldown on success
        } catch (err) {
            console.error(err);
            // Handle Timeout
            if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
                showError('İşlem zaman aşımına uğradı. Lütfen daha sonra tekrar deneyiniz.');
            }
            // Handle 429 Too Many Requests specifically
            else if (err.response && err.response.status === 429 && err.response.data.detail) {
                // Try to extract seconds from message ".... 45 saniye bekleyiniz."
                const match = err.response.data.detail.match(/(\d+)\s+saniye/);
                if (match && match[1]) {
                    setCooldown(parseInt(match[1], 10));
                } else {
                    setCooldown(60); // fallback
                }
                // Do not show toast for rate limit, just show the countdown on button
            } else if (err.response && err.response.data && err.response.data.detail) {
                showError(err.response.data.detail);
            } else {
                showError('Kod gönderilemedi. Lütfen bir süre bekleyin.');
            }
        } finally {
            setResendLoading(false);
        }
    };

    const handleEmailEdit = () => {
        setNewEmail(userEmail);
        setIsEditing(true);
    };

    const saveEmail = async () => {
        if (!newEmail || newEmail === userEmail) {
            setIsEditing(false);
            return;
        }
        // Basic validation
        if (!/\S+@\S+\.\S+/.test(newEmail)) {
            showError('Geçerli bir e-posta adresi giriniz.');
            return;
        }

        try {
            const apiModule = await import('../services/api');
            const api = apiModule.default;
            await api.put('/players/me/', { email: newEmail });

            setUserEmail(newEmail);
            setIsEditing(false);
            success('E-posta güncellendi. Yeni kod gönderiliyor...');

            // Auto resend code
            setResendLoading(true); // Manually set loading for better UX
            await resendVerificationCode({ email: newEmail });
            setCooldown(60);
            success('Yeni doğrulama kodu gönderildi.');
            setResendLoading(false); // Fix: Reset loading state on success

        } catch (err) {
            console.error(err);
            setResendLoading(false); // Ensure loading is off if error
            if (err.response && err.response.data) {
                const msg = err.response.data.email ? err.response.data.email[0] : (err.response.data.detail || 'Güncelleme başarısız.');
                showError(msg);
            } else {
                showError('Güncelleme başarısız.');
            }
        }
    };

    return (
        <div
            className="auth-container"
            style={{
                width: '90%',
                maxWidth: '380px',
                margin: '4rem auto',
                padding: '2.5rem 2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                textAlign: 'center'
            }}
        >
            <div className="auth-header" style={{ marginBottom: 0 }}>
                <h2>Hesabını Doğrula</h2>

                {isEditing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <input
                                type="email"
                                className="form-input"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                style={{ padding: '8px 12px', fontSize: '0.9rem', width: '220px' }}
                                placeholder="Yeni e-posta adresi"
                            />
                            <button onClick={saveEmail} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', padding: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Check size={20} />
                            </button>
                            <button onClick={() => setIsEditing(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <p style={{ fontSize: '0.8rem', opacity: 0.7, margin: 0 }}>Yeni adresi onaylayın.</p>
                    </div>
                ) : (
                    <div style={{ marginTop: '10px' }}>
                        <p style={{ fontSize: '0.9rem', opacity: 0.8, lineHeight: '1.5', margin: 0 }}>
                            6 haneli kod şu adrese gönderildi:
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '5px' }}>
                            <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{userEmail}</strong>
                            <button
                                onClick={handleEmailEdit}
                                title="E-postayı Düzenle"
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', padding: '4px', display: 'flex', alignItems: 'center', borderRadius: '4px', transition: 'background 0.2s' }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.1)'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                <Edit2 size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input
                    type="text"
                    className="form-input"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="------"
                    maxLength={6}
                    style={{
                        textAlign: 'center',
                        letterSpacing: '12px',
                        fontSize: '1.8rem',
                        fontWeight: 'bold',
                        padding: '0.75rem',
                        width: '100%',
                        borderRadius: '6px', // Reduced rounding
                        border: '2px solid var(--border-light)',
                        backgroundColor: 'var(--bg-secondary)',
                        color: 'var(--text-primary)'
                    }}
                />

                <button
                    className="btn-primary"
                    onClick={handleVerification}
                    disabled={loading || verificationCode.length < 6}
                    style={{
                        width: '100%',
                        justifyContent: 'center',
                        padding: '0.9rem',
                        fontSize: '1rem',
                        borderRadius: '6px', // Reduced rounding
                        marginTop: '0.5rem'
                    }}
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : 'Doğrula'}
                    {!loading && <Check size={20} style={{ marginLeft: '8px' }} />}
                </button>
            </div>

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                fontSize: '0.9rem',
                color: 'var(--text-secondary)',
                marginTop: '0.5rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                    <span>Kod gelmedi mi?</span>
                    <button
                        onClick={handleResend}
                        disabled={resendLoading || cooldown > 0}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: (cooldown > 0) ? 'var(--text-muted)' : 'var(--primary)',
                            fontWeight: '600',
                            cursor: (resendLoading || cooldown > 0) ? 'default' : 'pointer',
                            textDecoration: 'none',
                            padding: 0,
                            fontFamily: 'inherit',
                            fontSize: 'inherit',
                            opacity: (resendLoading || cooldown > 0) ? 0.7 : 1,
                            minWidth: '140px', // Prevent jitter when numbers change
                            textAlign: 'left'
                        }}
                    >
                        {resendLoading ? 'Gönderiliyor...' : cooldown > 0 ? `Tekrar Gönder (${cooldown}s)` : 'Tekrar Gönder'}
                    </button>
                </div>

                <button
                    onClick={logout}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#ef4444',
                        fontWeight: '500',
                        cursor: 'pointer',
                        padding: 0,
                        fontSize: '0.85rem',
                        marginTop: '0.5rem'
                    }}
                >
                    Farklı bir hesaba geçiş yap
                </button>
            </div>
        </div>
    );
};

export default VerifyEmail;
