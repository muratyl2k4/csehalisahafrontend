import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { forgotPassword, verifyForgotPasswordCode, resetPassword } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Loader2, ArrowRight, KeyRound, Mail, Lock, Check } from 'lucide-react';
import '../styles/auth.css';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const { success, error: showError } = useToast();

    // Steps: 1 = Email, 2 = Verify Code, 3 = New Password
    const [step, setStep] = useState(1);

    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [loading, setLoading] = useState(false);

    // Step 1: Send Code
    const handleSendCode = async (e) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        try {
            await forgotPassword({ email });
            success('Doğrulama kodu e-posta adresinize gönderildi.');
            setStep(2);
        } catch (err) {
            console.error(err);
            if (err.response && err.response.data && err.response.data.detail) {
                showError(err.response.data.detail);
            } else {
                showError('Kod gönderilemedi. Lütfen e-posta adresini kontrol ediniz.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify Code
    const handleVerifyCode = async (e) => {
        e.preventDefault();
        if (!code) return;
        if (code.length < 6) {
            showError('Lütfen 6 haneli kodu giriniz.');
            return;
        }

        setLoading(true);
        try {
            await verifyForgotPasswordCode({ email, code });
            setStep(3); // Move to password reset step
        } catch (err) {
            console.error(err);
            if (err.response && err.response.data && err.response.data.detail) {
                showError(err.response.data.detail);
            } else {
                // Fallback error message if backend doesn't provide detail
                showError('Kod doğrulanamadı.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!newPassword || !confirmPassword) {
            showError('Lütfen tüm alanları doldurunuz.');
            return;
        }

        if (newPassword !== confirmPassword) {
            showError('Şifreler eşleşmiyor.');
            return;
        }

        if (newPassword.length < 6) {
            showError('Şifre en az 6 karakter olmalıdır.');
            return;
        }

        setLoading(true);
        try {
            await resetPassword({
                email,
                code,
                new_password: newPassword
            });
            success('Şifreniz başarıyla değiştirildi! Giriş yapabilirsiniz.');
            navigate('/login');
        } catch (err) {
            console.error(err);
            if (err.response && err.response.data && err.response.data.detail) {
                showError(err.response.data.detail);
            } else {
                showError('Şifre sıfırlama başarısız.');
            }
        } finally {
            setLoading(false);
        }
    };

    const renderHeader = () => {
        if (step === 1) return 'Hesabınıza kayıtlı e-posta adresini giriniz.';
        if (step === 2) return `Lütfen ${email} adresine gönderilen kodu giriniz.`;
        if (step === 3) return 'Yeni şifrenizi belirleyiniz.';
    };

    return (
        <div className="auth-container" style={{ margin: '4rem auto', width: '90%', maxWidth: '400px' }}>
            <div className="auth-header">
                <h2>Şifremi Unuttum</h2>
                <p>{renderHeader()}</p>
            </div>

            {/* STEP 1: EMAIL */}
            {step === 1 && (
                <form onSubmit={handleSendCode} className="auth-form" style={{ marginTop: '1.5rem' }}>
                    <div className="form-group">
                        <label style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Mail size={18} />
                            E-posta Adresi
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="ornek@site.com"
                            className="form-input"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                        style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : (
                            <>
                                Kod Gönder <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                            </>
                        )}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                        <button
                            type="button"
                            onClick={() => navigate('/login')}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--text-secondary)',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                textDecoration: 'none',
                                transition: 'color 0.2s'
                            }}
                            onMouseOver={(e) => e.target.style.color = 'var(--primary)'}
                            onMouseOut={(e) => e.target.style.color = 'var(--text-secondary)'}
                        >
                            Giriş ekranına dön
                        </button>
                    </div>
                </form>
            )}

            {/* STEP 2: VERIFY CODE */}
            {step === 2 && (
                <form onSubmit={handleVerifyCode} className="auth-form" style={{ marginTop: '1.5rem' }}>
                    <div className="form-group">
                        <label style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <KeyRound size={18} />
                            Doğrulama Kodu
                        </label>
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="******"
                            className="form-input"
                            maxLength={6}
                            required
                            style={{ letterSpacing: '8px', textAlign: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                        style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : (
                            <>
                                Kodu Doğrula <Check size={18} style={{ marginLeft: '8px' }} />
                            </>
                        )}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--text-secondary)',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                transition: 'color 0.2s'
                            }}
                            onMouseOver={(e) => e.target.style.color = 'var(--text-primary)'}
                            onMouseOut={(e) => e.target.style.color = 'var(--text-secondary)'}
                        >
                            ← E-postamı değiştir
                        </button>
                    </div>
                </form>
            )}

            {/* STEP 3: RESET PASSWORD */}
            {step === 3 && (
                <form onSubmit={handleResetPassword} className="auth-form" style={{ marginTop: '1.5rem' }}>
                    <div className="form-group">
                        <label style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Lock size={18} />
                            Yeni Şifre
                        </label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Yeni şifreniz"
                            className="form-input"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Lock size={18} />
                            Yeni Şifre (Tekrar)
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Yeni şifreniz (tekrar)"
                            className="form-input"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                        style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : 'Şifreyi Değiştir'}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                        <button
                            type="button"
                            onClick={() => navigate('/login')}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--text-secondary)',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                transition: 'color 0.2s'
                            }}
                        >
                            İptal
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default ForgotPassword;
