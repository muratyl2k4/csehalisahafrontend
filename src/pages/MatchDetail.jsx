import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getMatch } from '../services/api';
import { Calendar, Trophy, ArrowLeft, Hourglass } from 'lucide-react';
import PlayerCard from '../components/PlayerCard';
import '../styles/home.css';

function MatchDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [match, setMatch] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('team1'); // Tabs for mobile

    useEffect(() => {
        loadMatchDetail();
    }, [id]);

    const loadMatchDetail = async () => {
        try {
            const data = await getMatch(id);
            console.log("Match Data:", data); // Debug log
            setMatch(data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError('Maç detayları yüklenirken bir hata oluştu.');
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="container">
            <div className="loading">
                <div className="spinner"></div>
                <p>Maç detayları yükleniyor...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="container">
            <div className="error-container" style={{ textAlign: 'center', padding: '3rem' }}>
                <p style={{ color: '#ef4444', fontSize: '1.2rem' }}>{error}</p>
                <Link to="/matches" className="btn btn-secondary" style={{ marginTop: '1rem' }}>
                    Maçlara Dön
                </Link>
            </div>
        </div>
    );

    if (!match) return null;

    const team1 = match.team1_info || {};
    const team2 = match.team2_info || {};
    const team1Players = match.team1_players || [];
    const team2Players = match.team2_players || [];

    return (
        <div className="container">
            <button
                onClick={() => navigate(-1)}
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'var(--text-muted)',
                    textDecoration: 'none',
                    marginBottom: '2rem',
                    fontWeight: 500,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    fontFamily: 'inherit',
                    fontSize: 'inherit'
                }}
            >
                <ArrowLeft size={20} />
                Geri Dön
            </button>

            {/* Match Header */}
            <div className="team-detail-header" style={{ textAlign: 'center', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                    <Calendar size={16} />
                    {new Date(match.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>

                <div className="match-header-score" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3rem', width: '100%', maxWidth: '800px' }}>
                    {/* Team 1 */}
                    <Link to={`/teams/${team1.id}`} style={{ flex: 1, textAlign: 'center', textDecoration: 'none', color: 'inherit' }}>
                        {team1.logo ? (
                            <img src={team1.logo} alt={team1.name} style={{ width: '100px', height: '100px', objectFit: 'contain', marginBottom: '1rem', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }} />
                        ) : (
                            <div style={{ width: '100px', height: '100px', background: 'var(--bg-hover)', borderRadius: '50%', margin: '0 auto 1rem' }} />
                        )}
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{team1.short_name || team1.name}</h2>
                    </Link>

                    {/* Score */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                        <div style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1, letterSpacing: '-2px', textShadow: '0 0 30px rgba(99, 102, 241, 0.3)' }}>
                            {match.is_finished ? (
                                <>
                                    <span style={{ color: parseScore(match.team1_score) > parseScore(match.team2_score) ? 'var(--primary)' : 'white' }}>{match.team1_score}</span>
                                    <span style={{ color: 'var(--text-muted)', margin: '0 1rem' }}>-</span>
                                    <span style={{ color: parseScore(match.team2_score) > parseScore(match.team1_score) ? 'var(--primary)' : 'white' }}>{match.team2_score}</span>
                                </>
                            ) : (
                                <Hourglass size={48} className="text-muted" style={{ opacity: 0.5 }} />
                            )}
                        </div>
                    </div>

                    {/* Team 2 */}
                    <Link to={`/teams/${team2.id}`} style={{ flex: 1, textAlign: 'center', textDecoration: 'none', color: 'inherit' }}>
                        {team2.logo ? (
                            <img src={team2.logo} alt={team2.name} style={{ width: '100px', height: '100px', objectFit: 'contain', marginBottom: '1rem', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }} />
                        ) : (
                            <div style={{ width: '100px', height: '100px', background: 'var(--bg-hover)', borderRadius: '50%', margin: '0 auto 1rem' }} />
                        )}
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{team2.short_name || team2.name}</h2>
                    </Link>
                </div>
            </div>

            {/* Mobile Tabs */}
            <div className="mobile-tabs">
                <button
                    onClick={() => setActiveTab('team1')}
                    style={{
                        flex: 1,
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-md)',
                        background: activeTab === 'team1' ? 'var(--bg-hover)' : 'transparent',
                        color: activeTab === 'team1' ? 'var(--primary)' : 'var(--text-muted)',
                        fontWeight: activeTab === 'team1' ? 700 : 500,
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    {team1.short_name || team1.name}
                </button>
                <button
                    onClick={() => setActiveTab('team2')}
                    style={{
                        flex: 1,
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-md)',
                        background: activeTab === 'team2' ? 'var(--bg-hover)' : 'transparent',
                        color: activeTab === 'team2' ? 'var(--primary)' : 'var(--text-muted)',
                        fontWeight: activeTab === 'team2' ? 700 : 500,
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    {team2.short_name || team2.name}
                </button>
            </div>

            {/* Stats Grid */}
            <div className="match-detail-grid">
                {/* Team 1 Stats */}
                <div className={`team-col ${activeTab === 'team1' ? 'mobile-active' : ''}`}>
                    <h3 style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{team1.name} Kadrosu</span>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{team1Players.length} Oyuncu</span>
                    </h3>
                    <div className="players-list-container">
                        {team1Players.length > 0 ? (
                            team1Players.map(player => (
                                <PlayerCard
                                    key={player.id}
                                    player={player}
                                    stats={[
                                        player.goals > 0 ? { label: 'GOL', value: player.goals, color: '#4ade80' } : null,
                                        player.assists > 0 ? { label: 'AST', value: player.assists, color: '#fbbf24' } : null
                                    ].filter(Boolean)}
                                />
                            ))
                        ) : (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                                Kadro bilgisi bulunamadı.
                            </div>
                        )}
                    </div>
                </div>

                {/* Team 2 Stats */}
                <div className={`team-col ${activeTab === 'team2' ? 'mobile-active' : ''}`}>
                    <h3 style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{team2.name} Kadrosu</span>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{team2Players.length} Oyuncu</span>
                    </h3>
                    <div className="players-list-container">
                        {team2Players.length > 0 ? (
                            team2Players.map(player => (
                                <PlayerCard
                                    key={player.id}
                                    player={player}
                                    stats={[
                                        player.goals > 0 ? { label: 'GOL', value: player.goals, color: '#4ade80' } : null,
                                        player.assists > 0 ? { label: 'AST', value: player.assists, color: '#fbbf24' } : null
                                    ].filter(Boolean)}
                                />
                            ))
                        ) : (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                                Kadro bilgisi bulunamadı.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper function to parse score
function parseScore(score) {
    return parseInt(score) || 0;
}

export default MatchDetail;
