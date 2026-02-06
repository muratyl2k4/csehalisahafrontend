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
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 5; // Backend page size

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            loadPlayers(currentPage, searchTerm);
        }, 300); // 300ms debounce
        return () => clearTimeout(timeoutId);
    }, [currentPage, searchTerm]);

    const loadPlayers = async (page, search) => {
        try {
            setLoading(true);
            const data = await getPlayers({ page: page, search: search });

            console.log("Players API Debug:", {
                count: data.count,
                itemsPerPage: itemsPerPage,
                calculatedPages: Math.ceil((data.count || 0) / itemsPerPage)
            });

            if (data.results) {
                setPlayers(data.results);
                // Exact calculation based on total count from backend (e.g. 92 / 5 = 19 pages)
                const calculatedTotal = Math.ceil((data.count || 0) / itemsPerPage);
                setTotalPages(calculatedTotal > 0 ? calculatedTotal : 1);
            } else if (Array.isArray(data)) {
                // Fallback if backend returns all data as array
                setPlayers(data);
                setTotalPages(1);
            }

            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const getPageNumbers = () => {
        // Sliding window logic: Max 3 buttons
        if (totalPages <= 3) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        let start = currentPage - 1;
        // Adjust start if close to beginning
        if (start < 1) start = 1;
        // Adjust start if close to end so we typically show 3 buttons
        if (start + 2 > totalPages) start = totalPages - 2;

        // Verify valid range to avoid negative numbers if totalPages is small (handled by first if)
        // or edge cases
        if (start < 1) start = 1;

        return [start, start + 1, start + 2].filter(p => p <= totalPages);
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
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1); // Reset to page 1 on search
                    }}
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

            {players.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
                    <p style={{ color: 'var(--text-muted)' }}>Oyuncu bulunamadı.</p>
                </div>
            ) : (
                <>
                    <div className="players-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '700px', margin: '0 auto' }}>
                        {players.map(player => (
                            <div
                                key={player.id}
                                onClick={() => navigate(`/players/${player.id}`)}
                                className="player-list-row"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    background: 'var(--bg-card)',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    border: '1px solid var(--border-light)',
                                    transition: 'all 0.2s',
                                    height: '60px'
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
