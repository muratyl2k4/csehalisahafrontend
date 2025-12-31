import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPlayer } from '../services/api';
import FifaCard from '../components/cards/FifaCard';
import { ArrowLeft, User, Activity, Trophy, Calendar } from 'lucide-react';
import '../styles/home.css';

function PlayerDetail() {
    const { id } = useParams();
    const [player, setPlayer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadPlayerDetail();
    }, [id]);

    const loadPlayerDetail = async () => {
        try {
            const data = await getPlayer(id);
            setPlayer(data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="container">
            <div className="loading">
                <div className="spinner"></div>
                <p>Oyuncu profili yükleniyor...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="container">
            <div className="error-container" style={{ textAlign: 'center', padding: '3rem' }}>
                <p style={{ color: '#ef4444', fontSize: '1.2rem' }}>{error}</p>
                <Link to="/players" className="btn btn-secondary" style={{ marginTop: '1rem' }}>
                    Oyunculara Dön
                </Link>
            </div>
        </div>
    );

    if (!player) return null;

    return (
        <div className="container">
            <Link to="/players" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '2rem', fontWeight: 500 }}>
                <ArrowLeft size={20} />
                Tüm Oyunculara Dön
            </Link>

            {/* Header Section */}
            <div className="team-detail-header">
                <div className="player-header-content">
                    <div className="player-profile-info">
                        <div style={{ position: 'relative' }}>
                            {player.photo ? (
                                <img src={player.photo} alt={player.name} style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)' }} />
                            ) : (
                                <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid var(--border-light)' }}>
                                    <User size={40} color="var(--text-muted)" />
                                </div>
                            )}
                            <div style={{ position: 'absolute', bottom: 0, right: 0, background: 'var(--primary)', color: 'white', fontWeight: 800, padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}>
                                {player.overall}
                            </div>
                        </div>

                        <div>
                            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{player.name}</h1>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)', justifyContent: 'center', flexWrap: 'wrap' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <Trophy size={16} />
                                    {player.current_team ? (
                                        <Link to={`/teams/${player.current_team}`} className="hover-link" style={{ color: 'inherit', textDecoration: 'none' }}>
                                            {player.current_team_name}
                                        </Link>
                                    ) : (
                                        'Takımsız'
                                    )}
                                </span>
                                <span className="hide-mobile">•</span>
                                <span>{player.position}</span>
                                <span className="hide-mobile">•</span>
                                <span>{player.age} Yaş</span>
                            </div>
                        </div>
                    </div>

                    {/* Key Stats */}
                    <div className="player-stats-row">
                        <div className="stat-box">
                            <span className="stat-value" style={{ color: '#4ade80' }}>{player.total_goals}</span>
                            <span className="stat-label">GOL</span>
                        </div>
                        <div className="stat-box">
                            <span className="stat-value" style={{ color: '#fbbf24' }}>{player.total_assists}</span>
                            <span className="stat-label">ASİST</span>
                        </div>
                        <div className="stat-box">
                            <span className="stat-value">{player.matches_played}</span>
                            <span className="stat-label">MAÇ</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="player-detail-grid">
                {/* Left Column: Player Card */}
                <div>
                    <h2 className="section-title player-detail-section-title">
                        <User size={24} />
                        Oyuncu Kartı
                    </h2>
                    <div className="player-card-wrapper">
                        <FifaCard player={player} />
                    </div>
                </div>

                {/* Right Column: Match History */}
                <div>
                    <h2 className="section-title player-detail-section-title">
                        <Activity size={24} />
                        Son Maçlar
                    </h2>

                    {player.match_history && player.match_history.length > 0 ? (
                        <div className="matches-list">
                            {player.match_history.map((match, index) => (
                                <Link to={`/matches/${match.match_id}`} key={index} className="match-card" style={{ height: 'auto', padding: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                            <Calendar size={14} />
                                            {new Date(match.match_date).toLocaleDateString('tr-TR')}
                                        </div>
                                        <div className="match-score-badge" style={{ fontSize: '1rem' }}>
                                            <span>{match.team1_score}</span>
                                            <span style={{ color: 'var(--text-muted)' }}>-</span>
                                            <span>{match.team2_score}</span>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                                            {match.team1_short_name || match.team1_name} vs {match.team2_short_name || match.team2_name}
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                                            {match.goals > 0 && (
                                                <span style={{ color: '#4ade80', fontWeight: 700, fontSize: '0.9rem' }}>{match.goals} Gol</span>
                                            )}
                                            {match.assists > 0 && (
                                                <span style={{ color: '#fbbf24', fontWeight: 700, fontSize: '0.9rem' }}>{match.assists} Asist</span>
                                            )}
                                            {match.goals === 0 && match.assists === 0 && (
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Skor Yok</span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                            Henüz maç kaydı bulunmuyor.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default PlayerDetail;
