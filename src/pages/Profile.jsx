import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ShieldCheck, UserPlus, LogOut, ChevronRight, Settings, Camera, Shirt } from 'lucide-react';
import { getPlayer, logout, updateProfile } from '../services/api';
import { useToast } from '../context/ToastContext';
import ImageEditorModal from '../components/ui/ImageEditorModal';
import BackgroundWarningModal from '../components/ui/BackgroundWarningModal';
import '../styles/main.css';

function Profile() {
    const navigate = useNavigate();
    const { success, error } = useToast();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    // Image Editor State
    const [showEditor, setShowEditor] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [showWarning, setShowWarning] = useState(false);

    const fileInputRef = useRef(null);

    useEffect(() => {
        loadUserProfile();
    }, []);

    const loadUserProfile = async () => {
        const storedUser = localStorage.getItem('user_info');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                // Fetch fresh player data to get team status and stats
                if (parsedUser.id) {
                    try {
                        const playerData = await getPlayer(parsedUser.id);
                        setUser({ ...parsedUser, ...playerData });
                    } catch (err) {
                        console.error("Failed to fetch fresh player data", err);
                        setUser(parsedUser); // Fallback to stored
                    }
                } else {
                    setUser(parsedUser);
                }
            } catch (e) {
                console.error("Parse error", e);
            }
        }
        setLoading(false);
    };

    const handlePhotoClick = () => {
        setShowWarning(true);
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Basic validation
        if (!file.type.startsWith('image/')) {
            error('Lütfen geçerli bir resim dosyası seçin.');
            return;
        }

        const reader = new FileReader();
        reader.addEventListener('load', () => {
            setSelectedImage(reader.result);
            setShowEditor(true);
        });
        reader.readAsDataURL(file);

        // Reset input to allow re-selection of same file
        event.target.value = '';
    };

    const handleEditorSave = async (croppedBlob) => {
        setUploadingPhoto(true);
        // setShowEditor(false); // Close modal immediately or wait? better wait in modal but here logic is passed to modal

        const formData = new FormData();
        // Backend expects 'photo' field
        formData.append('photo', croppedBlob, 'profile.png');

        try {
            const updatedProfile = await updateProfile(formData);

            // Immediately update local state with new photo URL
            setUser(prev => ({
                ...prev,
                photo: updatedProfile.photo
            }));

            success('Profil fotoğrafı güncellendi.');
        } catch (err) {
            console.error(err);
            error('Fotoğraf yüklenirken bir hata oluştu.');
        } finally {
            setUploadingPhoto(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) return <div className="container"><div className="loading">Yükleniyor...</div></div>;

    if (!user) return (
        <div className="container" style={{ textAlign: 'center', marginTop: '2rem' }}>
            <p>Giriş yapmalısınız.</p>
            <button className="btn-primary" onClick={() => navigate('/login')} style={{ marginTop: '1rem' }}>
                Giriş Yap
            </button>
        </div>
    );

    return (
        <div className="container" style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* 1. Header & Photo */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                <div
                    style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        border: '4px solid var(--primary)',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
                        background: 'var(--bg-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        cursor: 'pointer'
                    }}
                    onClick={handlePhotoClick}
                >
                    {uploadingPhoto ? (
                        <div className="spinner" style={{ width: '30px', height: '30px', borderTopColor: 'var(--primary)' }}></div>
                    ) : (
                        <>
                            {user.photo ? (
                                <img src={user.photo} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <User size={64} color="var(--text-muted)" />
                            )}
                            {/* Overlay icon to indicate editability */}
                            <div style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                height: '35%',
                                background: 'rgba(0,0,0,0.5)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Camera size={16} color="white" />
                            </div>
                        </>
                    )}
                </div>
                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={handleFileChange}
                />

                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>{user.name}</h2>
                    <p style={{ color: 'var(--text-muted)' }}>{user.position || 'Oyuncu'}</p>
                </div>
            </div>

            {/* 2. Menu Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                {/* Personal Information */}
                <button
                    className="profile-menu-btn"
                    style={menuBtnStyle}
                    onClick={() => navigate(`/players/${user.id}`)}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <User size={28} color="#ffffff" style={{ filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.3))' }} />
                        <span style={textStyle}>Profilim</span>
                    </div>
                    <ChevronRight size={20} color="var(--text-muted)" />
                </button>
                <button
                    className="profile-menu-btn"
                    style={menuBtnStyle}
                    onClick={() => navigate('/profile/edit')}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Settings size={28} color="#ffffff" style={{ filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.3))' }} />
                        <span style={textStyle}>Bilgilerimi Düzenle</span>
                    </div>
                    <ChevronRight size={20} color="var(--text-muted)" />
                </button>

                {/* Team Button Logic */}
                {user.current_team ? (
                    <button
                        className="profile-menu-btn"
                        style={menuBtnStyle}
                        onClick={() => navigate(`/teams/${user.current_team}`)}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <Shirt size={28} color="#ffffff" style={{ filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.3))' }} />
                            <span style={textStyle}>Takımım</span>
                        </div>
                        <ChevronRight size={20} color="var(--text-muted)" />
                    </button>
                ) : (
                    <button
                        className="profile-menu-btn"
                        style={menuBtnStyle}
                        onClick={() => navigate('/league?tab=standings')}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <UserPlus size={28} color="#10b981" style={{ filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.3))' }} />
                            <span style={textStyle}>Takım Bul</span>
                        </div>
                        <ChevronRight size={20} color="var(--text-muted)" />
                    </button>
                )}

            </div>

            {/* 3. Logout (Bottom) */}
            <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                <button
                    onClick={handleLogout}
                    style={{
                        ...menuBtnStyle,
                        borderColor: 'rgba(239, 68, 68, 0.3)',
                        background: 'rgba(239, 68, 68, 0.1)',
                        justifyContent: 'center'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#ef4444' }}>
                        <LogOut size={20} />
                        <span style={{ fontWeight: 600 }}>Çıkış Yap</span>
                    </div>
                </button>
            </div>

            {/* Image Editor Modal */}
            <ImageEditorModal
                isOpen={showEditor}
                onClose={() => setShowEditor(false)}
                imageSrc={selectedImage}
                onSave={handleEditorSave}
            />

            <BackgroundWarningModal
                isOpen={showWarning}
                onClose={() => setShowWarning(false)}
                onConfirm={() => {
                    setShowWarning(false);
                    fileInputRef.current.click();
                }}
            />

        </div>
    );
}

// Inline Styles for quick iteration
const menuBtnStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '1rem 1.25rem',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-light)',
    borderRadius: '4px', // Reduced to minimal
    cursor: 'pointer',
    transition: 'transform 0.2s',
    outline: 'none',
    textAlign: 'left'
};



const textStyle = {
    fontSize: '1.05rem',
    fontWeight: 600,
    color: 'var(--text-primary)'
};

export default Profile;
