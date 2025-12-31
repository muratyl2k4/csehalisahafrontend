import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Upload, User, Mail, Lock, Check } from 'lucide-react';
import { register, login } from '../services/api';
import { useToast } from '../context/ToastContext';
import '../styles/auth.css';

const Register = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Form Data - Username removed
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        age: '',
        position: 'ST',
        photo: null
    });

    // Image Preview
    const [photoPreview, setPhotoPreview] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, photo: file });
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const nextStep = () => {
        // Validation Logic
        if (step === 1) {
            if (!formData.email || !formData.password) {
                setError('Lütfen tüm alanları doldurun.');
                return;
            }
            // Basic Email Regex
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                setError('Geçerli bir E-posta adresi giriniz.');
                return;
            }
        }

        if (step === 2) {
            if (!formData.name || !formData.age) {
                setError('Lütfen tüm alanları doldurun.');
                return;
            }
        }

        setError(''); // Clear errors
        if (step < 3) setStep(step + 1);
    };

    const prevStep = () => {
        setError('');
        if (step > 1) setStep(step - 1);
    };

    const { success } = useToast();

    // ... existing code ...

    const handleSubmit = async () => {
        setLoading(true);
        setError('');

        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null) {
                    data.append(key, formData[key]);
                }
            });

            // Register request
            await register(data);

            // Auto Login
            // Auto Login - Backend expects 'username' field even if it's an email
            await login({
                username: formData.email,
                password: formData.password
            });

            success('Kayıt başarılı! Giriş yapıldı.');

            // Redirect to home or matches
            navigate('/matches');
        } catch (err) {
            console.error(err);
            if (err.response && err.response.data) {
                // Parse Error Message
                const data = err.response.data;
                let errorMessage = 'Kayıt başarısız.';

                if (typeof data === 'string') {
                    // Check if HTML error page
                    if (data.trim().startsWith('<')) {
                        errorMessage = "Sunucu Hatası. (Türkçe karakter veya bağlantı sorunu olabilir)";
                    } else {
                        errorMessage = data;
                    }
                } else if (data.email) {
                    errorMessage = Array.isArray(data.email) ? data.email[0] : data.email;
                } else if (data.username) {
                    errorMessage = "Bu e-posta adresi kullanımda olabilir.";
                } else if (data.detail) {
                    errorMessage = data.detail;
                } else {
                    // Fallback: take first error value found
                    const firstKey = Object.keys(data)[0];
                    if (firstKey && data[firstKey]) {
                        const val = data[firstKey];
                        errorMessage = Array.isArray(val) ? val[0] : val;
                    }
                }
                setError(errorMessage);
            } else {
                setError('Kayıt başarısız. Lütfen bilgileri kontrol edin.');
            }
            setLoading(false);
        }
    };

    // Render Steps
    const renderStep1 = () => (
        <div className="step-content">
            <div className="form-group">
                <label>E-posta</label>
                <div style={{ position: 'relative' }}>
                    <input
                        type="email"
                        name="email"
                        className="form-input"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="ornek@email.com"
                        style={{ width: '100%', paddingLeft: '40px' }}
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
                    />
                    <Lock size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: '#888' }} />
                </div>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="step-content">
            <div className="form-group">
                <label>Ad Soyad</label>
                <input
                    type="text"
                    name="name"
                    className="form-input"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ad Soyad"
                />
            </div>
            <div className="form-group">
                <label>Yaş</label>
                <input
                    type="number"
                    name="age"
                    className="form-input"
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="20"
                />
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="step-content">
            <div className="form-group">
                <label>Mevki (Rol)</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                    {[
                        { id: 'KL', label: 'KL' },
                        { id: 'STP', label: 'STP' },
                        { id: 'SLB', label: 'SLB' },
                        { id: 'SGB', label: 'SĞB' },
                        { id: 'MO', label: 'MO' },
                        { id: 'MOO', label: 'MOO' },
                        { id: 'SLK', label: 'SLK' },
                        { id: 'SGK', label: 'SĞK' },
                        { id: 'ST', label: 'ST' }
                    ].map(pos => (
                        <button
                            key={pos.id}
                            className={`btn-secondary ${formData.position === pos.id ? 'active' : ''}`}
                            onClick={() => setFormData({ ...formData, position: pos.id })}
                            style={{
                                padding: '0.5rem',
                                fontSize: '0.9rem',
                                backgroundColor: formData.position === pos.id ? 'var(--primary)' : 'var(--bg-secondary)',
                                color: formData.position === pos.id ? '#fff' : 'var(--text-primary)',
                                border: formData.position === pos.id ? 'none' : '1px solid var(--border-light)',
                                justifyContent: 'center'
                            }}
                        >
                            {pos.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="form-group">
                <label>Profil Fotoğrafı</label>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.75rem', lineHeight: '1.4' }}>
                    Daha profesyonel bir görünüm için lütfen fotoğrafınızı <a href="https://www.remove.bg/upload" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>remove.bg</a> sitesinden arka planını temizleyerek yükleyiniz, <b>aksi takdirde silinecektir.</b>
                </p>
                <label className="photo-upload-label">
                    <input type="file" hidden onChange={handleFileChange} accept="image/*" />
                    {photoPreview ? (
                        <img src={photoPreview} alt="Preview" className="preview-image" />
                    ) : (
                        <Upload size={32} color="var(--primary)" />
                    )}
                    <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
                        {photoPreview ? 'Fotoğrafı Değiştir' : 'Fotoğraf Yükle'}
                    </p>
                </label>
            </div>
        </div>
    );

    return (
        <div className="auth-container">
            <div className="auth-header">
                <h2>Kayıt Ol</h2>
                <p>Adım {step}/3: {step === 1 ? 'Giriş Bilgileri' : step === 2 ? 'Kişisel Bilgiler' : 'Oyuncu Profili'}</p>
            </div>

            <div className="progress-container">
                <div
                    className="progress-bar"
                    style={{ width: `${(step / 3) * 100}%` }}
                ></div>
            </div>

            {error && <div style={{ color: '#ff4444', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}

            <div className="step-actions">
                {step > 1 ? (
                    <button className="btn-secondary" onClick={prevStep}>
                        <ChevronLeft size={16} /> Geri
                    </button>
                ) : (
                    <div></div> // Spacer
                )}

                {step === 1 && (
                    <button className="btn-primary" onClick={nextStep} disabled={!formData.email || !formData.password}>
                        İleri <ChevronRight size={16} />
                    </button>
                )}

                {step === 2 && (
                    <button className="btn-primary" onClick={nextStep} disabled={!formData.name || !formData.age}>
                        İleri <ChevronRight size={16} />
                    </button>
                )}

                {step === 3 && (
                    <button className="btn-primary" onClick={handleSubmit} disabled={loading || !formData.photo || !formData.position}>
                        {loading ? 'Kaydediliyor...' : 'Tamamla'} <Check size={16} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default Register;
