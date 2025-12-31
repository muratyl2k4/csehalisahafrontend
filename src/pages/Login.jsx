import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';
import { login } from '../services/api';
import '../styles/auth.css';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '', // This will hold the email
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await login(formData);
            // Redirect to Home or Match List
            navigate('/matches');
        } catch (err) {
            console.error(err);
            setError('Giriş başarısız. E-posta veya şifre hatalı.');
            setLoading(false);
        }
    };

    return (
        <div className="auth-container" style={{ minHeight: '400px', maxWidth: '400px' }}>
            <div className="auth-header">
                <h2>Giriş Yap</h2>
                <p>Hesabınıza erişmek için bilgilerinizi girin.</p>
            </div>

            <form onSubmit={handleSubmit} className="step-content">
                {error && (
                    <div style={{
                        background: 'rgba(255, 68, 68, 0.1)',
                        color: '#ff4444',
                        padding: '12px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.9rem'
                    }}>
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                <div className="form-group">
                    <label>E-posta</label>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="email"
                            name="username" // Sending as username to backend logic, but it's email
                            className="form-input"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="ornek@email.com"
                            style={{ width: '100%', paddingLeft: '40px' }}
                            required
                        />
                        <Mail size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: '#888' }} />
                    </div>
                </div>

                <div className="form-group">
                    <label>Şifre</label>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="password"
                            name="password"
                            className="form-input"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="********"
                            style={{ width: '100%', paddingLeft: '40px' }}
                            required
                        />
                        <Lock size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: '#888' }} />
                    </div>
                </div>

                <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                    style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }}
                >
                    {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'} <LogIn size={18} />
                </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Hesabınız yok mu? <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Kayıt Ol</Link>
            </div>
        </div>
    );
};

export default Login;
