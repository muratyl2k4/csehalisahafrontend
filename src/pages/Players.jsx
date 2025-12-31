import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPlayers } from '../services/api';
import '../styles/player-table.css';

function Players() {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadPlayers();
    }, []);

    const loadPlayers = async () => {
        try {
            const data = await getPlayers();
            setPlayers(data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const filteredPlayers = players.filter(player =>
        player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (player.current_team_name && player.current_team_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return (
        <div className="container">
            <div className="loading">
                <div className="spinner"></div>
                <p>Oyuncular yükleniyor...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="container">
            <div className="error-container" style={{ textAlign: 'center', padding: '3rem' }}>
                <p style={{ color: '#ef4444' }}>Hata: {error}</p>
            </div>
        </div>
    );

    return (
        <div className="container">
            <h1>Oyuncular</h1>

            {/* Search Input */}
            <div style={{ marginBottom: '2rem', position: 'relative', maxWidth: '500px', margin: '0 auto 2rem auto' }}>
                <input
                    type="text"
                    placeholder="Oyuncu ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '1rem 1.5rem',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--border-light)',
                        background: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'all 0.2s'
                    }}
                />
            </div>

            {filteredPlayers.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
                    <p style={{ color: 'var(--text-muted)' }}>Oyuncu bulunamadı.</p>
                </div>
            ) : (
                <div className="players-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '700px', margin: '0 auto' }}>

                    {filteredPlayers.map(player => (
                        <div
                            key={player.id}
                            onClick={() => navigate(`/players/${player.id}`)}
                            className="player-list-row"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                background: 'var(--bg-secondary)',
                                padding: '0.5rem 1rem',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                border: '1px solid var(--border-light)',
                                transition: 'all 0.2s',
                                height: '60px' /* Fixed compact height */
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                {/* Photo */}
                                {player.photo ? (
                                    <img src={player.photo} alt={player.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-light)' }} />
                                ) : (
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.9rem' }}>
                                        {player.name.charAt(0)}
                                    </div>
                                )}

                                {/* Name & Position */}
                                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)', lineHeight: 1.2 }}>
                                        {player.name}
                                    </div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                        {player.position}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                {/* Overall */}
                                <div style={{
                                    fontWeight: 700,
                                    fontSize: '1.1rem',
                                    color: 'var(--text-primary)'
                                }}>
                                    {player.overall}
                                </div>

                                {/* Team Logo */}
                                {player.current_team_logo ? (
                                    <img
                                        src={player.current_team_logo}
                                        alt="Team"
                                        style={{
                                            width: '32px',
                                            height: '32px',
                                            objectFit: 'contain'
                                        }}
                                    />
                                ) : (
                                    /* Placeholder spacer to align overall if teamless? Or just empty */
                                    <div style={{ width: '32px' }}></div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Players;
