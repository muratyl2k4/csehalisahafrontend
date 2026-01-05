import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Users, Calendar, Trophy, ArrowLeft, TrendingUp, UserPlus, Check, X, Shield, Camera, Edit2 } from 'lucide-react';
import { getTeam, joinTeam, respondToRequest, leaveTeam, updateTeam } from '../services/api';
import { useToast } from '../context/ToastContext';
import Modal from '../components/ui/Modal';
import ImageEditorModal from '../components/ui/ImageEditorModal'; // Import Image Editor
import '../styles/home.css';

function TeamDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { success, error, info } = useToast();
    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userInfo, setUserInfo] = useState(null);
    const [joinLoading, setJoinLoading] = useState(false);
    // const [actionLoading, setActionLoading] = useState(null); // Unused

    const [showJoinModal, setShowJoinModal] = useState(false);
    const [showLeaveModal, setShowLeaveModal] = useState(false);

    // Image Upload State
    const [selectedImage, setSelectedImage] = useState(null);
    const [showImageEditor, setShowImageEditor] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    // Short Name Edit State
    const [isEditingName, setIsEditingName] = useState(false);
    const [editShortName, setEditShortName] = useState('');

    const startEditingName = () => {
        setEditShortName(team.short_name || '');
        setIsEditingName(true);
    };

    const cancelEditingName = () => {
        setIsEditingName(false);
        setEditShortName('');
    };

    const saveShortName = async () => {
        if (!editShortName.trim()) {
            error("Kısaltma boş olamaz.");
            return;
        }
        if (editShortName.indexOf(' ') >= 0) {
            error("Kısaltma boşluk içeremez.");
            return;
        }
        if (editShortName.length > 5) {
            error("Kısaltma en fazla 5 karakter olabilir.");
            return;
        }
        if (editShortName.length < 2) {
            error("Kısaltma en az 2 karakter olmalı.");
            return;
        }

        try {
            const upName = editShortName.toUpperCase();
            await updateTeam(team.id, { short_name: upName });
            success("Takım kısaltması güncellendi.");
            setTeam(prev => ({ ...prev, short_name: upName }));
            setIsEditingName(false);
        } catch (err) {
            console.error(err);
            error("Güncelleme başarısız.");
        }
    };


    useEffect(() => {
        loadTeamData();
        const storedUser = localStorage.getItem('user_info');
        if (storedUser) {
            try {
                setUserInfo(JSON.parse(storedUser));
            } catch (e) {
                console.error("User Parse Error", e);
            }
        }
    }, [id]);

    const loadTeamData = async () => {
        try {
            const teamData = await getTeam(id);
            setTeam(teamData);
        } catch (err) {
            console.error('Error loading team details:', err);
            error('Takım bilgileri yüklenirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    // ... (Existing functions confirmJoin, handleLeaveTeam, etc. keep them same)

    const confirmJoin = async () => {
        setJoinLoading(true);
        try {
            await joinTeam(team.id);
            success('Talebiniz başarıyla iletildi.');
            loadTeamData();
            setShowJoinModal(false);
        } catch (err) {
            error(err.response?.data?.detail || 'İstek gönderilemedi. Lütfen tekrar deneyin.');
            setShowJoinModal(false);
        } finally {
            setJoinLoading(false);
        }
    };

    const handleLeaveTeam = () => {
        setShowLeaveModal(true);
    };

    const confirmLeaveTeam = async () => {
        try {
            await leaveTeam();
            success("Takımdan başarıyla ayrıldınız.");
            const currentUser = JSON.parse(localStorage.getItem('user_info') || '{}');
            currentUser.teamId = null;
            localStorage.setItem('user_info', JSON.stringify(currentUser));
            window.location.reload();
        } catch (err) {
            console.error(err);
            error(err.response?.data?.detail || "Takımdan ayrılırken bir hata oluştu.");
            setShowLeaveModal(false);
        }
    };

    // --- Image Upload Logic ---
    const handleFileChange = (event) => {
        const file = event.target.files && event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setSelectedImage(reader.result);
                setShowImageEditor(true);
            });
            reader.readAsDataURL(file);
        }
    };

    const handleSaveCroppedImage = async (croppedImageBlob) => {
        setUploadingImage(true);
        setShowImageEditor(false);

        try {
            const formData = new FormData();
            // Convert blob to file
            const file = new File([croppedImageBlob], "team_logo.png", { type: "image/png" });
            formData.append('logo', file);

            await updateTeam(team.id, formData);

            success('Takım logosu başarıyla güncellendi!');
            loadTeamData(); // Refresh to see new logo

        } catch (err) {
            console.error("Logo update error", err);
            error('Logo güncellenirken bir hata oluştu.');
        } finally {
            setUploadingImage(false);
            setSelectedImage(null);
        }
    };


    if (loading) return <div className="container loading-text">Yükleniyor...</div>;
    if (!team) return <div className="container error-text">Takım bulunamadı.</div>;

    const isCaptain = userInfo && userInfo.id === team.captain_id;
    const canJoin = userInfo && (userInfo.teamId === null || userInfo.teamId === undefined);
    const pendingCount = team.pending_requests ? team.pending_requests.length : 0;
    const isPending = team.user_request_status === 'PENDING';

    // Sort players: Captain first
    const sortedPlayers = [...(team.players || [])].sort((a, b) => {
        if (a.id === team.captain_id) return -1;
        if (b.id === team.captain_id) return 1;
        return 0;
    });

    return (
        <div className="container">
            <button
                onClick={() => navigate(-1)}
                className="back-link"
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '1rem' }}
            >
                <ArrowLeft size={20} />
                Geri Dön
            </button>

            {/* Team Header */}
            <div className="team-detail-header">
                <div className="team-brand">
                    <div style={{ position: 'relative' }}>
                        {team.logo ? (
                            <img src={team.logo} alt={team.name} className="team-detail-logo" />
                        ) : (
                            <div className="team-logo-placeholder-lg">
                                <Users size={48} />
                            </div>
                        )}

                        {/* Edit Button Logic */}
                        {isCaptain && (
                            <>
                                <input
                                    type="file"
                                    id="team-logo-upload"
                                    style={{ display: 'none' }}
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                                <label
                                    htmlFor="team-logo-upload"
                                    className="edit-logo-btn"
                                    style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        right: 0,
                                        background: 'var(--primary)',
                                        color: 'white',
                                        borderRadius: '50%',
                                        width: '32px',
                                        height: '32px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                        border: '2px solid var(--bg-card)'
                                    }}
                                    title="Logoyu Değiştir"
                                >
                                    <Camera size={16} />
                                </label>
                            </>
                        )}
                        {uploadingImage && (
                            <div style={{
                                position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)',
                                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <div className="spinner" style={{ width: '24px', height: '24px', borderWidth: '3px' }}></div>
                            </div>
                        )}
                    </div>

                    <div>
                        <h1>{team.name}</h1>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', height: '32px' }}>
                            {isEditingName ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <input
                                        type="text"
                                        value={editShortName}
                                        onChange={(e) => setEditShortName(e.target.value.toUpperCase())}
                                        maxLength={5}
                                        style={{
                                            width: '60px', padding: '4px', fontSize: '1rem', fontWeight: 'bold',
                                            borderRadius: '4px', border: '1px solid var(--primary)', outline: 'none',
                                            textTransform: 'uppercase'
                                        }}
                                        autoFocus
                                    />
                                    <button onClick={saveShortName} className="btn-icon-sm success"><Check size={16} /></button>
                                    <button onClick={cancelEditingName} className="btn-icon-sm danger"><X size={16} /></button>
                                </div>
                            ) : (
                                <>
                                    {team.short_name && <span className="team-short-name">{team.short_name}</span>}
                                    {isCaptain && (
                                        <button
                                            onClick={startEditingName}
                                            className="edit-icon-btn"
                                            title="Kısaltmayı Düzenle"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="header-right-group">
                    {/* ... (Existing stats and buttons) ... */}
                    <div className="mini-stats-row">
                        <div className="mini-stat">
                            <span className="ms-value text-default">{team.wins + team.draws + team.losses}</span>
                            <span className="ms-label">OM</span>
                        </div>
                        {/* ... keep stat blocks ... */}
                        <div className="mini-stat">
                            <span className="ms-value text-success">{team.wins}</span>
                            <span className="ms-label">G</span>
                        </div>
                        <div className="mini-stat">
                            <span className="ms-value text-warning">{team.draws}</span>
                            <span className="ms-label">B</span>
                        </div>
                        <div className="mini-stat">
                            <span className="ms-value text-danger">{team.losses}</span>
                            <span className="ms-label">M</span>
                        </div>
                        <div className="mini-stat p-highlight">
                            <span className="ms-value">{team.wins * 3 + team.draws}</span>
                            <span className="ms-label">P</span>
                        </div>
                    </div>

                    <div className="team-actions" style={{ flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                        {(canJoin || isPending) && (
                            <button
                                className={`btn-primary ${isPending ? 'disabled' : ''}`}
                                onClick={() => setShowJoinModal(true)}
                                disabled={joinLoading || isPending}
                                style={{ gap: '8px', padding: '10px 20px', opacity: isPending ? 0.7 : 1, cursor: isPending ? 'default' : 'pointer' }}
                            >
                                <UserPlus size={20} />
                                {joinLoading ? 'Gönderiliyor...' : isPending ? 'İstek Beklemede' : 'Takıma Katıl'}
                            </button>
                        )}

                        {/* Leave Team Button */}
                        {userInfo && userInfo.teamId === team.id && !isCaptain && (
                            <button
                                onClick={handleLeaveTeam}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '10px 16px',
                                    borderRadius: '8px',
                                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                    color: '#ef4444',
                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    transition: 'all 0.2s',
                                    marginTop: '0.5rem'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                                    e.currentTarget.style.transform = 'none';
                                }}
                            >
                                <X size={18} />
                                Takımdan Ayrıl
                            </button>
                        )}

                        {isCaptain && pendingCount > 0 && (
                            <Link
                                to={`/teams/${team.id}/requests`}
                                style={{
                                    color: '#f59e0b',
                                    fontWeight: 'bold',
                                    textDecoration: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    background: 'rgba(245, 158, 11, 0.1)',
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <Shield size={18} />
                                {pendingCount} Bekleyen İstek →
                            </Link>
                        )}
                    </div>
                </div>
            </div >

            <div className="detail-grid">
                {/* Players Section */}
                <div className="detail-section">
                    <h2>
                        <Users size={24} />
                        Kadro
                    </h2>
                    <div className="players-list-container">
                        {sortedPlayers.length > 0 ? (
                            sortedPlayers.map(player => (
                                <Link to={`/players/${player.id}`} key={player.id} className="player-list-item">
                                    <div className="player-list-left">
                                        {player.photo ? (
                                            <img src={player.photo} alt={player.name} className="player-list-photo" />
                                        ) : (
                                            <div className="player-list-placeholder">
                                                <Users size={20} />
                                            </div>
                                        )}
                                        <div className="player-list-info">
                                            <span className="player-list-name">
                                                {player.jersey_number && <span style={{ color: 'var(--text-muted)', marginRight: '6px', fontWeight: 600 }}>#{player.jersey_number}</span>}
                                                {player.name}
                                                {team.captain_id === player.id && <span style={{ color: 'var(--primary)', fontWeight: 'bold', marginLeft: '5px' }}>(C)</span>}
                                            </span>
                                            <span className="player-list-pos">{player.position}</span>
                                        </div>
                                    </div>
                                    <div className="player-list-stats">
                                        <div className="p-stat">
                                            <span className="p-stat-value">{player.total_goals}</span>
                                            <span className="p-stat-label">Gol</span>
                                        </div>
                                        <div className="p-stat">
                                            <span className="p-stat-value">{player.total_assists}</span>
                                            <span className="p-stat-label">Asist</span>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <p className="no-data">Kadro bilgisi bulunmuyor.</p>
                        )}
                    </div>
                </div>

                {/* Matches Section */}
                <div className="detail-section">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>
                        <h2 style={{ borderBottom: 'none', marginBottom: 0, paddingBottom: 0 }}>
                            <Calendar size={24} />
                            Son Maçlar
                        </h2>
                        <Link to={`/matches?team=${team.id}`} style={{ fontSize: '0.9rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
                            Tüm Maç Geçmişi →
                        </Link>
                    </div>
                    <div className="matches-list">
                        {team.recent_matches && team.recent_matches.length > 0 ? (
                            team.recent_matches.map(match => (
                                <Link to={`/matches/${match.id}`} key={match.id} className="match-card">
                                    <div className="match-card-header">
                                        <span className="match-date-badge">
                                            {new Date(match.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                                        </span>
                                    </div>
                                    <div className="match-card-body">
                                        <div className="match-team is-left">
                                            <span className="team-name">{match.team1_short_name || match.team1_name}</span>
                                            {match.team1_logo && <img src={match.team1_logo} alt={match.team1_name} className="mini-logo" />}
                                        </div>
                                        <div className="match-score-badge">
                                            <span>{match.team1_score}</span>
                                            <span className="sc-divider">-</span>
                                            <span>{match.team2_score}</span>
                                        </div>
                                        <div className="match-team is-right">
                                            {match.team2_logo && <img src={match.team2_logo} alt={match.team2_name} className="mini-logo" />}
                                            <span className="team-name">{match.team2_short_name || match.team2_name}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <p className="no-data">Henüz maç oynanmamış.</p>
                        )}
                        {team.recent_matches && team.recent_matches.length > 0 && (
                            <Link to={`/matches?team=${team.id}`} className="view-all-btn">
                                Tüm Maçları Gör
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            <Modal
                isOpen={showJoinModal}
                onClose={() => setShowJoinModal(false)}
                title="Takıma Katıl"
                footer={
                    <>
                        <button className="btn-ghost" onClick={() => setShowJoinModal(false)}>İptal</button>
                        <button className="btn-primary" onClick={confirmJoin} disabled={joinLoading}>
                            {joinLoading ? 'Gönderiliyor...' : 'Onayla'}
                        </button>
                    </>
                }
            >
                <p><strong>{team.name}</strong> takımına katılma isteği göndermek istediğinize emin misiniz?</p>
                <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                    Kaptan isteğinizi onayladığında takıma dahil olacaksınız.
                </p>
            </Modal>

            {/* Leave Team Modal */}
            <Modal
                isOpen={showLeaveModal}
                onClose={() => setShowLeaveModal(false)}
                title="Takımdan Ayrıl"
                footer={
                    <>
                        <button className="btn-ghost" onClick={() => setShowLeaveModal(false)}>Vazgeç</button>
                        <button
                            style={{
                                backgroundColor: '#ef4444',
                                color: 'white',
                                padding: '0.75rem 1.25rem',
                                borderRadius: '8px',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: 600
                            }}
                            onClick={confirmLeaveTeam}
                        >
                            Ayrıl
                        </button>
                    </>
                }
            >
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                    <div style={{
                        width: '60px', height: '60px', borderRadius: '50%',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1.5rem auto'
                    }}>
                        <X size={32} />
                    </div>
                    <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Bu takımdan ayrılmak üzeresiniz.</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Bu işlem geri alınamaz. Takıma tekrar katılmak isterseniz yeni bir istek göndermeniz gerekecektir.
                    </p>
                </div>
            </Modal>

            {/* Image Editor Modal */}
            <ImageEditorModal
                isOpen={showImageEditor}
                onClose={() => setShowImageEditor(false)}
                imageSrc={selectedImage}
                onSave={handleSaveCroppedImage}
                aspectRatio={1} // Square for logo
            />
        </div >
    );
}

export default TeamDetail;
