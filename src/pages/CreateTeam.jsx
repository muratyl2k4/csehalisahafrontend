import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Shield, AlertCircle } from 'lucide-react';
import { createTeam } from '../services/api';
import '../styles/auth.css'; // Can reuse auth styles for form

const CreateTeam = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        short_name: '',
        logo: null
    });
    const [logoPreview, setLogoPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const storedUser = localStorage.getItem('user_info');
        if (storedUser) {
            try {
                const userInfo = JSON.parse(storedUser);
                if (userInfo.teamId) {
                    // User already has a team, redirect them
                    navigate(`/teams/${userInfo.teamId}`);
                }
            } catch (e) {
                // Ignore parse error
            }
        }
    }, [navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, logo: file });
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = new FormData();
            data.append('name', formData.name);
            if (formData.short_name) data.append('short_name', formData.short_name);
            if (formData.logo) data.append('logo', formData.logo);

            const response = await createTeam(data);

            // Update local storage user info to reflect new team
            const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
            userInfo.teamId = response.id;
            localStorage.setItem('user_info', JSON.stringify(userInfo));

            navigate(`/teams/${response.id}`);
        } catch (err) {
            console.error(err);
            if (err.response && err.response.data && err.response.data.detail) {
                setError(err.response.data.detail);
            } else {
                setError('Takım oluşturulamadı. Lütfen bilgileri kontrol edin.');
            }
            setLoading(false);
        }
    };

    return (
        <div className="auth-container" style={{ maxWidth: '600px' }}>
            <div className="auth-header">
                <h2>Takımını Kur</h2>
                <p>Kendi takımını oluştur, kadronu kur ve maça başla.</p>
            </div>

            <form onSubmit={handleSubmit} className="step-content">
                {error && (
                    <div style={{ background: 'rgba(255, 68, 68, 0.1)', color: '#ff4444', padding: '10px', borderRadius: '8px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <AlertCircle size={20} /> {error}
                    </div>
                )}

                <div className="form-group">
                    <label>Takım Adı</label>
                    <input
                        type="text"
                        name="name"
                        className="form-input"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Örn: Yıldız Gücü"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Kısaltma (Opsiyonel)</label>
                    <input
                        type="text"
                        name="short_name"
                        className="form-input"
                        value={formData.short_name}
                        onChange={handleChange}
                        placeholder="Örn: YLD"
                        maxLength={5}
                    />
                </div>

                <div className="form-group">
                    <label>Takım Logosu</label>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.75rem', lineHeight: '1.4' }}>
                        Daha profesyonel bir görünüm için lütfen logonuzu <a href="https://www.remove.bg/upload" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>remove.bg</a> sitesinden arka planını temizleyerek yükleyiniz, <b>aksi takdirde silinecektir.</b>
                    </p>
                    <label className="photo-upload-label">
                        <input type="file" hidden onChange={handleFileChange} accept="image/*" />
                        {logoPreview ? (
                            <img src={logoPreview} alt="Logo Preview" className="preview-image" style={{ borderRadius: '8px' }} />
                        ) : (
                            <Shield size={48} color="var(--primary)" />
                        )}
                        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
                            {logoPreview ? 'Logoyu Değiştir' : 'Logo Yükle'}
                        </p>
                    </label>
                </div>

                <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
                    {loading ? 'Oluşturuluyor...' : 'Takımı Oluştur'} <Shield size={18} style={{ marginLeft: '8px' }} />
                </button>
            </form>
        </div>
    );
};

export default CreateTeam;
