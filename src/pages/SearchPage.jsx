import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Search, Trophy, Users, PlusCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { getTeams, getPlayers, refreshUserInfo, isAuthenticated } from '../services/api';
import '../styles/main.css';
import '../styles/player-table.css';

function SearchPage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const initialTab = searchParams.get('tab') === 'players' ? 'players' : 'teams';
    const initialPage = parseInt(searchParams.get('page')) || 1;

    const [activeTab, setActiveTab] = useState(initialTab); // 'teams' or 'players'
    const [searchTerm, setSearchTerm] = useState('');
    // Track previous search term to prevent reset on mount/back-nav
    const prevSearchTerm = useRef(searchTerm);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [totalPages, setTotalPages] = useState(1);

    // Data
    const [teams, setTeams] = useState([]);
    const [players, setPlayers] = useState([]);

    // State
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userInfo, setUserInfo] = useState(null);

    useEffect(() => {
        // Initial load
        loadData();
        checkUserStatus();
    }, []);

    // Update tab and page if URL param changes (Supports Back Button)
    useEffect(() => {
        const tab = searchParams.get('tab');
        const page = parseInt(searchParams.get('page')) || 1;

        if (tab && (tab === 'teams' || tab === 'players')) {
            setActiveTab(tab);
        }

        if (page !== currentPage) {
            setCurrentPage(page);
        }
    }, [searchParams]);

    // Fetch data when page or search term changes (Debounce search could be better but keeping simple)
    // IMPORTANT: For Players tab, we fetch paginated. For Teams, we fetch all (as requested).
    useEffect(() => {
        if (activeTab === 'players') {
            loadPlayers(currentPage, searchTerm);
        } else {
            // If switching to teams, we might want to refresh team list if needed, 
            // but usually initial load is enough unless we implementing search/pagination for teams too.
            // For now, teams are loaded once. Search is client-side for teams as requested "Takımları değiştirme".
        }
    }, [currentPage, activeTab]);

    useEffect(() => {
        // Skip if search term hasn't changed (e.g. on mount or same value)
        if (prevSearchTerm.current === searchTerm) {
            return;
        }
        prevSearchTerm.current = searchTerm;

        const timer = setTimeout(() => {
            if (activeTab === 'players') {
                setCurrentPage(1);
                loadPlayers(1, searchTerm);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Only load Teams here. Players are handled by the useEffect([currentPage])
            const teamsData = await getTeams();

            setTeams(teamsData);

            // We don't set players here anymore to avoid race condition with the useEffect

            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const loadPlayers = async (page, search) => {
        try {
            const params = { page };
            if (search) params.search = search;

            const data = await getPlayers(params);
            const results = data.results || [];
            const total = data.count || 0;

            setPlayers(results);

            // Dynamic Pagination Logic
            // If 'next' exists, current page is full -> implies page_size = results.length
            if (data.next) {
                const inferredSize = results.length;
                if (inferredSize > 0) {
                    setTotalPages(Math.ceil(total / inferredSize));
                }
            } else {
                // No next page.
                if (page === 1) {
                    // Fits in one page
                    setTotalPages(1);
                } else {
                    // Last page of multiple pages. 
                    // We can't infer size from this page alone (it might be partial).
                    // Keep existing totalPages or recalculate if we had a stored size? 
                    // For simplicity, we trust the count. If we don't know size, we can't calc perfectly, 
                    // but usually we hit page 1 first.
                    // If we navigated here, we probably established totalPages already.
                }
            }

        } catch (err) {
            console.error("Failed to load players", err);
        }
    };

    const checkUserStatus = async () => {
        // First, check local storage for immediate render
        const storedUser = localStorage.getItem('user_info');
        if (storedUser) {
            try {
                setUserInfo(JSON.parse(storedUser));
            } catch (e) {
                console.error("User info parse error", e);
            }
        }

        // Then, fetch fresh data from API to handle "kicked from team" scenarios
        if (isAuthenticated()) {
            const freshUserInfo = await refreshUserInfo();
            if (freshUserInfo) {
                setUserInfo(freshUserInfo);
            }
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        navigate(`/search?tab=${tab}`, { replace: true });
    };

    // Client-side filter for Teams ONLY
    const filteredTeams = teams.filter(team =>
        team.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Players are already filtered by backend
    const currentPlayers = players;

    // Pagination Logic (Backend handled)
    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
        const newParams = new URLSearchParams(searchParams);
        newParams.set('page', pageNumber);
        setSearchParams(newParams);
        window.scrollTo(0, 0);
    };

    if (error) return (
        <div className="container">
            <div className="error-container">
                <p style={{ color: '#ef4444' }}>Hata: {error}</p>
            </div>
        </div>
    );

    return (
        <div className="container">

            {/* 1. Search Bar */}
            <div style={{ position: 'relative', marginBottom: '1rem' }}>
                <input
                    type="text"
                    placeholder={activeTab === 'teams' ? "Takım ara..." : "Oyuncu ara..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '1rem 1rem 1rem 3rem',
                        fontSize: '1rem',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--border-light)',
                        background: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        outline: 'none'
                    }}
                />
                <Search size={20} style={{ position: 'absolute', left: '1rem', top: '1.1rem', color: 'var(--text-muted)' }} />
            </div>

            {/* 2. Toggle Buttons */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                marginBottom: '2rem'
            }}>
                <button
                    onClick={() => handleTabChange('teams')}
                    style={{
                        padding: '1rem',
                        borderRadius: 'var(--radius-lg)',
                        border: 'none',
                        background: activeTab === 'teams' ? 'var(--primary)' : 'var(--bg-secondary)',
                        color: activeTab === 'teams' ? '#fff' : 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s'
                    }}
                >
                    <Trophy size={20} />
                    Takımlar
                </button>
                <button
                    onClick={() => handleTabChange('players')}
                    style={{
                        padding: '1rem',
                        borderRadius: 'var(--radius-lg)',
                        border: 'none',
                        background: activeTab === 'players' ? 'var(--primary)' : 'var(--bg-secondary)',
                        color: activeTab === 'players' ? '#fff' : 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s'
                    }}
                >
                    <Users size={20} />
                    Oyuncular
                </button>
            </div>

            {/* 3. Content Area */}
            {activeTab === 'teams' ? (
                /* TEAMS TAB CONTENT */
                <div>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Puan Durumu</h2>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Sezon 1</p>
                        </div>

                        {/* Show Create Team button if applicable */}
                        {userInfo && userInfo.id && !userInfo.teamId && (
                            <Link
                                to="/create-team"
                                className="btn-primary"
                                style={{
                                    textDecoration: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.5rem 1rem',
                                    fontSize: '0.85rem',
                                    borderRadius: '8px'
                                }}
                            >
                                <PlusCircle size={16} />
                                Takım Oluştur
                            </Link>
                        )}
                    </div>

                    {filteredTeams.length === 0 ? (
                        <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Takım bulunamadı.</p>
                    ) : (
                        <div className="league-table-container">
                            <table className="league-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Takım</th>
                                        <th>OM</th>
                                        <th>G</th>
                                        <th>B</th>
                                        <th>M</th>
                                        <th>AG</th>
                                        <th>YG</th>
                                        <th>AV</th>
                                        <th>P</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTeams.map((team, index) => (
                                        <tr key={team.id} onClick={() => navigate(`/teams/${team.id}`)}>
                                            <td>{index + 1}</td>
                                            <td>
                                                <div className="team-cell">
                                                    {team.logo ? (
                                                        <img src={team.logo} alt={team.name} className="team-logo" />
                                                    ) : (
                                                        <div className="team-logo" style={{ background: '#333', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <span style={{ fontSize: '10px', color: '#fff' }}>Logo</span>
                                                        </div>
                                                    )}
                                                    <span className="team-name-link">{team.name}</span>
                                                </div>
                                            </td>
                                            <td>{team.total_matches}</td>
                                            <td>{team.wins}</td>
                                            <td>{team.draws}</td>
                                            <td>{team.losses}</td>
                                            <td>{team.goals_scored}</td>
                                            <td>{team.goals_conceded}</td>
                                            <td>{team.goal_difference}</td>
                                            <td style={{ color: 'var(--primary)', fontWeight: 800 }}>{team.points}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            ) : (
                /* PLAYERS TAB CONTENT */
                <div>
                    {currentPlayers.length === 0 ? (
                        <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Oyuncu bulunamadı.</p>
                    ) : (
                        <>
                            <div className="players-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {currentPlayers.map(player => (
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
                                            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                                                {player.overall}
                                            </div>
                                            {player.current_team_logo && (
                                                <img src={player.current_team_logo} alt="Team" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '2rem' }}>
                                    <button
                                        onClick={() => paginate(Math.max(1, currentPage - 1))}
                                        disabled={currentPage === 1}
                                        style={{
                                            background: 'var(--bg-card)',
                                            border: '1px solid var(--border-light)',
                                            color: currentPage === 1 ? 'var(--text-muted)' : 'var(--text-primary)',
                                            borderRadius: '8px',
                                            width: '36px',
                                            height: '36px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                            opacity: currentPage === 1 ? 0.5 : 1
                                        }}
                                    >
                                        <ChevronLeft size={20} />
                                    </button>

                                    {Array.from({ length: totalPages }, (_, i) => (
                                        <button
                                            key={i + 1}
                                            onClick={() => paginate(i + 1)}
                                            style={{
                                                background: currentPage === i + 1 ? 'var(--primary)' : 'var(--bg-card)',
                                                border: currentPage === i + 1 ? 'none' : '1px solid var(--border-light)',
                                                color: currentPage === i + 1 ? '#fff' : 'var(--text-primary)',
                                                borderRadius: '8px',
                                                width: '36px',
                                                height: '36px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                fontWeight: 600,
                                                fontSize: '0.9rem'
                                            }}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}

                                    <button
                                        onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                                        disabled={currentPage === totalPages}
                                        style={{
                                            background: 'var(--bg-card)',
                                            border: '1px solid var(--border-light)',
                                            color: currentPage === totalPages ? 'var(--text-muted)' : 'var(--text-primary)',
                                            borderRadius: '8px',
                                            width: '36px',
                                            height: '36px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                            opacity: currentPage === totalPages ? 0.5 : 1
                                        }}
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

export default SearchPage;
