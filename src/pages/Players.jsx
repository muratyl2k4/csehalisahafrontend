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

    // Pagination Logic
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    // Reset page when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredPlayers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredPlayers.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const getPageNumbers = () => {
        // Robust logic to ensure exactly 3 buttons max
        if (totalPages <= 3) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        let start = currentPage - 1;
        if (start < 1) start = 1;
        if (start + 2 > totalPages) start = totalPages - 2;

        return [start, start + 1, start + 2];
    };

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
                <>
                    <div className="players-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '700px', margin: '0 auto' }}>
                        {currentItems.map(player => (
                            <div
                                key={player.id}
                                onClick={() => navigate(`/players/${player.id}`)}
                                className="player-list-row"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    background: 'var(--bg-card)', /* Slightly transparent on pitch theme via CSS override if needed, using card var for consistency */
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
                                        <div style={{ width: '32px' }}></div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '2rem' }}>
                            {/* Prev Button */}
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                style={{
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border-light)',
                                    color: 'var(--text-primary)',
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                    opacity: currentPage === 1 ? 0.5 : 1
                                }}
                            >
                                &lt;
                            </button>

                            {/* Page Numbers (Max 3 visible) */}
                            {getPageNumbers().map(pageNum => (
                                <button
                                    key={pageNum}
                                    onClick={() => handlePageChange(pageNum)}
                                    style={{
                                        background: currentPage === pageNum ? 'var(--primary)' : 'var(--bg-card)',
                                        border: currentPage === pageNum ? 'none' : '1px solid var(--border-light)',
                                        color: currentPage === pageNum ? '#ffffffff' : 'var(--text-primary)',
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '8px',
                                        fontWeight: 800,
                                        cursor: 'pointer'
                                    }}
                                >
                                    {pageNum}
                                </button>
                            ))}

                            {/* Next Button */}
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                style={{
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border-light)',
                                    color: 'var(--text-primary)',
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                    opacity: currentPage === totalPages ? 0.5 : 1
                                }}
                            >
                                &gt;
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default Players;
