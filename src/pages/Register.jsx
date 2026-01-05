import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Upload, User, Mail, Lock, Check } from 'lucide-react';
import { register, login, verifyEmail } from '../services/api';
import { useToast } from '../context/ToastContext';
import Modal from '../components/ui/Modal';
import BackgroundWarningModal from '../components/ui/BackgroundWarningModal';
import ImageEditorModal from '../components/ui/ImageEditorModal';
import '../styles/auth.css';

const Register = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [showPhotoWarning, setShowPhotoWarning] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        age: '',
        jersey_number: '',
        preferred_foot: 'right',
        position: 'ST',
        photo: null
    });

    // Verification Code
    const [verificationCode, setVerificationCode] = useState('');

    // Image Preview
    const [photoPreview, setPhotoPreview] = useState(null);

    // Image Editor State
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [tempImageSrc, setTempImageSrc] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setTempImageSrc(reader.result);
                setIsEditorOpen(true);
            };
            reader.readAsDataURL(file);
            e.target.value = '';
        }
    };

    const handleEditorSave = (croppedBlob) => {
        const file = new File([croppedBlob], "profile_photo.png", { type: "image/png" });
        setFormData({ ...formData, photo: file });
        const previewUrl = URL.createObjectURL(croppedBlob);
        setPhotoPreview(previewUrl);
        setIsEditorOpen(false);
    };

    const nextStep = () => {
        if (step === 1) {
            if (!formData.email || !formData.password) {
                setError('Lütfen tüm alanları doldurun.');
                return;
            }
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

        setError('');
        if (step < 3) {
            const nextStepNum = step + 1;
            setStep(nextStepNum);
            if (nextStepNum === 3) {
                setShowPhotoWarning(true);
            }
        }
    };

    const prevStep = () => {
        setError('');
        if (step > 1) setStep(step - 1);
    };

    const { success } = useToast();

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

            // Success -> Move to Step 4 (Verification)
            success('Kayıt başarılı! Lütfen doğrulama kodunu giriniz.');
            setStep(4);

        } catch (err) {
            console.error(err);
            if (err.response && err.response.data) {
                const data = err.response.data;
                let errorMessage = 'Kayıt başarısız.';

                if (typeof data === 'string') {
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
        } finally {
            setLoading(false);
        }
    };

    const handleVerification = async () => {
        setLoading(true);
        setError('');
        try {
            await verifyEmail({
                email: formData.email,
                code: verificationCode
            });
            success('E-posta başarıyla doğrulandı!');

            // Auto-Login after verification
            await login({
                username: formData.email,
                password: formData.password
            });
            success('Giriş yapıldı.');
            navigate('/matches');
        } catch (err) {
            console.error(err);
            setError('Doğrulama başarısız. Kodu kontrol ediniz.');
        } finally {
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
            <div className="form-group">
                <label>Forma Numarası (1-99)</label>
                <input
                    type="number"
                    name="jersey_number"
                    className="form-input"
                    value={formData.jersey_number}
                    onChange={handleChange}
                    placeholder="10"
                    min="1"
                    max="99"
                />
            </div>
            <div className="form-group">
                <label>Ayak Tercihi</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                    {[
                        { id: 'right', label: 'Sağ' },
                        { id: 'left', label: 'Sol' },
                        { id: 'both', label: 'Her İkisi' }
                    ].map(foot => (
                        <button
                            key={foot.id}
                            className={`btn-secondary ${formData.preferred_foot === foot.id ? 'active' : ''}`}
                            onClick={() => setFormData({ ...formData, preferred_foot: foot.id })}
                            style={{
                                padding: '0.5rem',
                                fontSize: '0.9rem',
                                backgroundColor: formData.preferred_foot === foot.id ? 'var(--primary)' : 'var(--bg-secondary)',
                                color: formData.preferred_foot === foot.id ? '#fff' : 'var(--text-primary)',
                                border: formData.preferred_foot === foot.id ? 'none' : '1px solid var(--border-light)',
                                justifyContent: 'center'
                            }}
                        >
                            {foot.label}
                        </button>
                    ))}
                </div>
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
                        { id: 'DOS', label: 'DOS' },
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

    const renderStep4 = () => (
        <div className="step-content">
            <div className="form-group" style={{ textAlign: 'center' }}>
                <label>Doğrulama Kodu</label>
                <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                    {formData.email} adresine gönderilen 6 haneli kodu giriniz.
                </p>
                <input
                    type="text"
                    className="form-input"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="123456"
                    maxLength={6}
                    style={{ textAlign: 'center', letterSpacing: '4px', fontSize: '1.2rem' }}
                />
            </div>
        </div>
    );

    return (
        <div className="auth-container">
            <div className="auth-header">
                <h2>{step === 4 ? 'E-posta Doğrulama' : 'Kayıt Ol'}</h2>
                <p>
                    {step === 4
                        ? 'Son Adım: Hesabını Doğrula'
                        : `Adım ${step}/3: ${step === 1 ? 'Giriş Bilgileri' : step === 2 ? 'Kişisel Bilgiler' : 'Oyuncu Profili'}`
                    }
                </p>
            </div>

            <div className="progress-container">
                <div
                    className="progress-bar"
                    style={{ width: `${Math.min((step / 3) * 100, 100)}%` }}
                ></div>
            </div>

            {error && <div style={{ color: '#ff4444', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}

            <div className="step-actions">
                {step > 1 && step < 4 ? (
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
                    <button className="btn-primary" onClick={nextStep} disabled={!formData.name || !formData.age || !formData.jersey_number}>
                        İleri <ChevronRight size={16} />
                    </button>
                )}

                {step === 3 && (
                    <button className="btn-primary" onClick={handleSubmit} disabled={loading || !formData.photo || !formData.position}>
                        {loading ? 'Kaydediliyor...' : 'Kaydı Tamamla'} <Check size={16} />
                    </button>
                )}

                {step === 4 && (
                    <button className="btn-primary" onClick={handleVerification} disabled={loading || verificationCode.length < 6}>
                        {loading ? 'Doğrulanıyor...' : 'Doğrula ve Giriş Yap'} <Check size={16} />
                    </button>
                )}
            </div>
            <BackgroundWarningModal
                isOpen={showPhotoWarning}
                onClose={() => setShowPhotoWarning(false)}
                onConfirm={() => setShowPhotoWarning(false)}
            />

            <ImageEditorModal
                isOpen={isEditorOpen}
                onClose={() => setIsEditorOpen(false)}
                imageSrc={tempImageSrc}
                onSave={handleEditorSave}
            />
        </div >
    );
};

export default Register;
