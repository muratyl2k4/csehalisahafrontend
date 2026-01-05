import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, User, Activity, Mail } from 'lucide-react';
import { updateProfile, getPlayer } from '../services/api';
import { useToast } from '../context/ToastContext';
import '../styles/main.css';

const POSITIONS = [
    { id: 'KL', label: 'KL' },
    { id: 'STP', label: 'STP' },
    { id: 'SLB', label: 'SLB' },
    { id: 'SGB', label: 'SĞB' },
    { id: 'DOS', label: 'DOS' },
    { id: 'MO', label: 'MO' },
    { id: 'MOO', label: 'MOO' },
    { id: 'SLK', label: 'SLK' },
    { id: 'SGK', label: 'SĞK' },
    { id: 'ST', label: 'ST' },
];

function ProfileEdit() {
    const navigate = useNavigate();
    const { success, error } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [position, setPosition] = useState('');
    const [jerseyNumber, setJerseyNumber] = useState('');
    const [preferredFoot, setPreferredFoot] = useState('right');

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        const storedUser = localStorage.getItem('user_info');
        if (!storedUser) {
            navigate('/login');
            return;
        }

        try {
            const parsedUser = JSON.parse(storedUser);

            // Pre-fill from local storage if available for immediate UI
            if (parsedUser.name) setName(parsedUser.name);
            if (parsedUser.email) setEmail(parsedUser.email);
            if (parsedUser.position) setPosition(parsedUser.position);
            if (parsedUser.jersey_number) setJerseyNumber(parsedUser.jersey_number);
            if (parsedUser.preferred_foot) setPreferredFoot(parsedUser.preferred_foot);

            // Fetch fresh data to get current name/position
            if (parsedUser.id) {
                const playerData = await getPlayer(parsedUser.id);
                if (playerData.name) setName(playerData.name);
                if (playerData.email) setEmail(playerData.email);
                if (playerData.position) setPosition(playerData.position);
                if (playerData.jersey_number) setJerseyNumber(playerData.jersey_number);
                if (playerData.preferred_foot) setPreferredFoot(playerData.preferred_foot);
            }
        } catch (err) {
            console.error(err);
            error("Kullanıcı bilgileri yüklenemedi.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim() || !position || !email.trim()) {
            error("Lütfen tüm alanları doldurun.");
            return;
        }

        setSaving(true);
        try {
            const updateData = {
                name: name,
                email: email,
                position: position,
                jersey_number: jerseyNumber,
                preferred_foot: preferredFoot
            };

            await updateProfile(updateData);

            // If email was changed, trigger immediate check and redirect
            const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
            if (userInfo.email !== email || updateData.email) {
                // Force refresh to get updated 'is_email_verified' status (which should be false)
                // We rely on the backend setting it false.
                // Ideally we should reload user info from API or trust local update if 'updateProfile' did it.
                // updateProfile already updates localStorage. Let's check it.
                const updatedUser = JSON.parse(localStorage.getItem('user_info'));
                if (updatedUser.is_email_verified === false) {
                    success('Profil güncellendi. Lütfen yeni e-posta adresinizi doğrulayın.');
                    navigate('/verify-email');
                    return;
                }
            }

            success('Profiliniz başarıyla güncellendi.');
            navigate('/profile');
        } catch (err) {
            console.error(err);
            error('Güncelleme başarısız oldu. Lütfen tekrar deneyin.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="container"><div className="loading">Yükleniyor...</div></div>;

    return (
        <div className="container">
            <button
                onClick={() => navigate(-1)}
                className="back-link"
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '1.5rem' }}
            >
                <ArrowLeft size={20} />
                Geri Dön
            </button>

            <h1 className="page-title">Bilgilerimi Düzenle</h1>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                {/* Name Input */}
                <div style={sectionStyle}>
                    <label style={labelStyle}>
                        <User size={18} />
                        Ad Soyad
                    </label>
                    <input
                        type="text"
                        className="form-input"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Adınız Soyadınız"
                        style={{ fontSize: '1.1rem', padding: '1rem' }}
                    />
                    <p style={helpTextStyle}>Bu isim maçlarda ve profilinizde görünecektir.</p>
                </div>

                {/* Email Input */}
                <div style={sectionStyle}>
                    <label style={labelStyle}>
                        <Mail size={18} />
                        E-posta Adresi
                    </label>
                    <input
                        type="email"
                        className="form-input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ornek@site.com"
                        style={{ fontSize: '1.1rem', padding: '1rem' }}
                    />
                    <p style={helpTextStyle}>
                        E-posta adresinizi değiştirirseniz, yeni adresinize doğrulama kodu gönderilecektir.
                    </p>
                </div>

                {/* Jersey Number & Foot */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={sectionStyle}>
                        <label style={labelStyle}>
                            Forma No
                        </label>
                        <input
                            type="number"
                            className="form-input"
                            value={jerseyNumber}
                            onChange={(e) => setJerseyNumber(e.target.value)}
                            placeholder="10"
                            min="1"
                            max="99"
                            style={{ fontSize: '1.1rem', padding: '1rem' }}
                        />
                    </div>
                    <div style={sectionStyle}>
                        <label style={labelStyle}>
                            Ayak
                        </label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {[
                                { id: 'right', label: 'Sağ' },
                                { id: 'left', label: 'Sol' },
                                { id: 'both', label: 'Her İkisi' }
                            ].map(foot => (
                                <button
                                    type="button"
                                    key={foot.id}
                                    className={`btn-secondary ${preferredFoot === foot.id ? 'active' : ''}`}
                                    onClick={() => setPreferredFoot(foot.id)}
                                    style={{
                                        flex: 1,
                                        padding: '0.5rem',
                                        fontSize: '0.8rem',
                                        backgroundColor: preferredFoot === foot.id ? 'var(--primary)' : 'var(--bg-secondary)',
                                        color: preferredFoot === foot.id ? '#fff' : 'var(--text-primary)',
                                        border: preferredFoot === foot.id ? 'none' : '1px solid var(--border-light)',
                                        justifyContent: 'center'
                                    }}
                                >
                                    {foot.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Position Selection */}
                <div style={sectionStyle}>
                    <label style={labelStyle}>
                        <Activity size={18} />
                        Mevki
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                        {POSITIONS.map((pos) => (
                            <button
                                type="button"
                                key={pos.id}
                                className={`btn-secondary ${position === pos.id ? 'active' : ''}`}
                                onClick={() => setPosition(pos.id)}
                                style={{
                                    padding: '0.5rem',
                                    fontSize: '0.9rem',
                                    backgroundColor: position === pos.id ? 'var(--primary)' : 'var(--bg-secondary)',
                                    color: position === pos.id ? '#fff' : 'var(--text-primary)',
                                    border: position === pos.id ? 'none' : '1px solid var(--border-light)',
                                    justifyContent: 'center',
                                    height: 'auto',
                                    borderRadius: '0.5rem',
                                    display: 'flex',
                                    cursor: 'pointer'
                                }}
                            >
                                {pos.label}
                            </button>
                        ))}
                    </div>
                    <p style={helpTextStyle}>
                        Dikkat: Mevki değiştirdiğinizde özellikleriniz (Overall) yeni pozisyona göre otomatik olarak yeniden hesaplanacaktır.
                    </p>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="btn-primary"
                    disabled={saving}
                    style={{ padding: '1rem', fontSize: '1.1rem', marginTop: '1rem' }}
                >
                    {saving ? 'Kaydediliyor...' : (
                        <>
                            <Save size={20} />
                            Değişiklikleri Kaydet
                        </>
                    )}
                </button>

            </form>
        </div>
    );
}

// Styles
const sectionStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
};

const labelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
    fontSize: '1rem'
};

const helpTextStyle = {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    marginTop: '0.25rem'
};

export default ProfileEdit;
