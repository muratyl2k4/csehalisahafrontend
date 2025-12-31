import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Users, Calendar, Trophy, ArrowLeft, TrendingUp, UserPlus, Check, X, Shield } from 'lucide-react';
import { getTeam, joinTeam, respondToRequest } from '../services/api';
import { useToast } from '../context/ToastContext';
import Modal from '../components/ui/Modal';
import '../styles/home.css';

function TeamDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { success, error, info } = useToast();
    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userInfo, setUserInfo] = useState(null);
    const [joinLoading, setJoinLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(null); // ID of request being processed

    const [showJoinModal, setShowJoinModal] = useState(false);

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
            <Link to="/teams" className="back-link">
                <ArrowLeft size={20} />
                Takımlara Dön
            </Link>

            {/* Team Header */}
            {/* Team Header */}
            <div className="team-detail-header">
                <div className="team-brand">
                    {team.logo ? (
                        <img src={team.logo} alt={team.name} className="team-detail-logo" />
                    ) : (
                        <div className="team-logo-placeholder-lg">
                            <Users size={48} />
                        </div>
                    )}
                    <div>
                        <h1>{team.name}</h1>
                        {team.short_name && <span className="team-short-name">{team.short_name}</span>}
                    </div>
                </div>

                <div className="header-right-group">
                    <div className="mini-stats-row">
                        <div className="mini-stat">
                            <span className="ms-value text-default">{team.wins + team.draws + team.losses}</span>
                            <span className="ms-label">OM</span>
                        </div>
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
            </div>

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
        </div>
    );
}

export default TeamDetail;
