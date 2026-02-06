import { useState, useEffect } from 'react';
import { getMatches, getTeamMatches } from '../services/api';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import '../styles/main.css';
import '../styles/home.css';
import MatchCard from '../components/MatchCard';

function Matches() {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
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
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-light)',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        padding: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '12px',
                        transition: 'all 0.2s ease'
                    }}
                    className="hover-scale"
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
                    {teamId ? 'Takım Maçları' : 'Tüm Maçlar'}
                </h1>
            </div>

            {matches.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Henüz maç bulunmuyor.</p>
                </div>
            ) : (
                <div className="matches-list-container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {matches.map(match => (
                        <MatchCard key={match.id} match={match} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default Matches;
