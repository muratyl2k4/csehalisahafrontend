import { useState, useEffect } from 'react';
import { getMatches, getTeamMatches } from '../services/api';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import '../styles/main.css';
import '../styles/home.css';

function Matches() {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchParams] = useSearchParams();
    const teamId = searchParams.get('team');

    useEffect(() => {
        loadMatches();
    }, [teamId]);

    const loadMatches = async () => {
        try {
            setLoading(true);
            let data;
            if (teamId) {
                data = await getTeamMatches(teamId);
            } else {
                data = await getMatches();
            }
            setMatches(data);
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
                <p>Maçlar yükleniyor...</p>
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

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
                    {teamId ? 'Takım Maçları' : 'Tüm Maçlar'}
                </h1>
            </div>

            {matches.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Henüz maç bulunmuyor.</p>
                </div>
            ) : (
                <div className="matches-grid-container">
                    {matches.map(match => (
                        <Link
                            to={`/matches/${match.id}`}
                            key={match.id}
                            className="match-card"
                            style={{ height: 'auto', minHeight: '100px' }} // Auto height to fit content in grid
                        >
                            <div className="match-card-header">
                                <span className="match-date-badge">
                                    {new Date(match.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                                </span>
                            </div>

                            <div className="match-card-body">
                                {/* Home Team */}
                                <div className="match-team is-left">
                                    <span className="team-name">{match.team1_short_name || match.team1_name}</span>
                                    {match.team1_logo ? (
                                        <img src={match.team1_logo} alt={match.team1_name} className="mini-logo" />
                                    ) : (
                                        <div className="team-logo-placeholder" style={{ width: '36px', height: '36px', fontSize: '0.8rem' }}>
                                            {match.team1_short_name?.[0] || 'A'}
                                        </div>
                                    )}
                                </div>

                                {/* Score */}
                                <div className="match-score-badge">
                                    <span style={{ color: match.is_finished ? 'white' : 'var(--text-muted)' }}>{match.team1_score}</span>
                                    <span className="sc-divider">-</span>
                                    <span style={{ color: match.is_finished ? 'white' : 'var(--text-muted)' }}>{match.team2_score}</span>
                                    {!match.is_finished && (
                                        <div style={{ position: 'absolute', top: '-15px', fontSize: '0.6rem', color: '#fbbf24', width: '100%', textAlign: 'center', fontWeight: 'bold' }}>CANLI</div>
                                    )}
                                </div>

                                {/* Away Team */}
                                <div className="match-team is-right">
                                    {match.team2_logo ? (
                                        <img src={match.team2_logo} alt={match.team2_name} className="mini-logo" />
                                    ) : (
                                        <div className="team-logo-placeholder" style={{ width: '36px', height: '36px', fontSize: '0.8rem' }}>
                                            {match.team2_short_name?.[0] || 'B'}
                                        </div>
                                    )}
                                    <span className="team-name">{match.team2_short_name || match.team2_name}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Matches;
