import { useState, useEffect } from 'react';
import { Target, Goal, Medal } from 'lucide-react';
import { getGoalLeaderboard, getAssistLeaderboard } from '../services/api';
import { Link } from 'react-router-dom';
import '../styles/main.css';
import '../styles/home.css';

function Leaderboard() {
    const [activeTab, setActiveTab] = useState('goals');
    const [goalLeaders, setGoalLeaders] = useState([]);
    const [assistLeaders, setAssistLeaders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadLeaderboards();
    }, []);

    const loadLeaderboards = async () => {
        try {
            const [goals, assists] = await Promise.all([
                getGoalLeaderboard(),
                getAssistLeaderboard()
            ]);
            setGoalLeaders(goals);
            setAssistLeaders(assists);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const getRankDisplay = (index) => {
        // User requested no decoration and smaller size
        return <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>{index + 1}</span>;
    };

    if (loading) return (
        <div className="container">
            <div className="loading">
                <div className="spinner"></div>
                <p>Veriler yükleniyor...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="container">
            <div className="error-container" style={{ textAlign: 'center', padding: '3rem' }}>
                <p style={{ color: '#ef4444', fontSize: '1.2rem' }}>{error}</p>
                <Link to="/" className="btn btn-secondary" style={{ marginTop: '1rem' }}>
                    Ana Sayfaya Dön
                </Link>
            </div>
        </div>
    );

    const currentLeaders = activeTab === 'goals' ? goalLeaders : assistLeaders;
    const statKey = activeTab === 'goals' ? 'total_goals' : 'total_assists';
    const statLabel = activeTab === 'goals' ? 'Gol' : 'Asist';

    return (
        <div className="container">
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textAlign: 'center' }}>
                LİDERLİK TABLOSU
            </h1>
            <p className="subtitle" style={{ marginBottom: '2rem' }}>Sezonun en iyi performansları</p>

            <div className="tabs" style={{ background: 'var(--bg-secondary)', padding: '0.5rem', borderRadius: 'var(--radius-lg)', display: 'inline-flex', gap: '0.5rem', margin: '0 auto 2rem auto', position: 'relative', left: '50%', transform: 'translateX(-50%)' }}>
                <button
                    onClick={() => setActiveTab('goals')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        borderRadius: 'var(--radius-md)',
                        background: activeTab === 'goals' ? 'var(--bg-hover)' : 'transparent',
                        color: activeTab === 'goals' ? 'var(--primary)' : 'var(--text-muted)',
                        fontWeight: activeTab === 'goals' ? 700 : 500,
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s'
                    }}
                >
                    <Goal size={18} />
                    Gol Krallığı
                </button>
                <button
                    onClick={() => setActiveTab('assists')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        borderRadius: 'var(--radius-md)',
                        background: activeTab === 'assists' ? 'var(--bg-hover)' : 'transparent',
                        color: activeTab === 'assists' ? 'var(--primary)' : 'var(--text-muted)',
                        fontWeight: activeTab === 'assists' ? 700 : 500,
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s'
                    }}
                >
                    <Target size={18} />
                    Asist Krallığı
                </button>
            </div>

            {currentLeaders.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Henüz veri bulunmuyor.</p>
                </div>
            ) : (
                <div className="leaderboard-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '800px', margin: '0 auto' }}>
                    {/* Header Row */}
                    <div className="leaderboard-header hide-mobile" style={{ display: 'grid', gridTemplateColumns: '50px 60px 2fr 1fr 1fr 60px', padding: '0 1.5rem 0.5rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                        <div style={{ textAlign: 'center' }}>#</div>
                        <div></div>
                        <div>OYUNCU</div>
                        <div style={{ textAlign: 'center' }}>{statLabel.toUpperCase()}</div>
                        <div style={{ textAlign: 'center' }}>MAÇ SAYISI</div>
                        <div style={{ textAlign: 'center' }}>TAKIM</div>
                    </div>

                    {currentLeaders.map((player, index) => (
                        <Link
                            to={`/players/${player.id}`}
                            key={player.id}
                            className="leaderboard-row"
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '50px 60px 2fr 1fr 1fr 60px',
                                alignItems: 'center',
                                background: 'var(--bg-secondary)',
                                padding: '1rem 1.5rem',
                                borderRadius: 'var(--radius-md)',
                                textDecoration: 'none',
                                color: 'inherit',
                                border: '1px solid var(--border-light)',
                                transition: 'all 0.2s'
                            }}
                        >
                            {/* Rank */}
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                {getRankDisplay(index)}
                            </div>

                            {/* Photo */}
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                {player.photo ? (
                                    <img src={player.photo} alt={player.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-light)' }} />
                                ) : (
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontWeight: 700 }}>
                                        {player.name.charAt(0)}
                                    </div>
                                )}
                            </div>

                            {/* Name */}
                            <div style={{ fontWeight: 600, paddingLeft: '0.5rem', overflow: 'hidden' }}>
                                <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{player.name}</div>
                                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {player.current_team_name}
                                </span>
                            </div>

                            {/* Stat */}
                            <div style={{ textAlign: 'center', fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
                                {player[statKey]}
                            </div>

                            {/* Played */}
                            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontWeight: 500 }}>
                                <span className="hide-desktop" style={{ fontSize: '0.7rem', marginRight: '4px' }}></span>
                                {player.matches_played}
                            </div>

                            {/* Team Logo */}
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                {player.current_team_logo ? (
                                    <img src={player.current_team_logo} alt={player.current_team_name} style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                                ) : (
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>
                                        T
                                    </div>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Leaderboard;
