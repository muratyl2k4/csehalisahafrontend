import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Search, Trophy, Users, Calendar, Filter, ChevronLeft, ChevronRight, Newspaper, ChevronDown, Hourglass } from 'lucide-react';
import { getLeagues, getPlayers, getMatches, getStandings } from '../services/api';
import '../styles/main.css';
import '../styles/player-table.css';
import '../styles/LeaguePage.css';
import MatchCard from '../components/MatchCard';

// ... (previous components)

const StandingsTable = ({ standings, onTeamClick }) => (
    <div className="league-table-container">
        <table className="league-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Takım</th>
                    <th>O</th>
                    <th>G</th>
                    <th>B</th>
                    <th>M</th>
                    <th>AV</th>
                    <th>P</th>
                </tr>
            </thead>
            <tbody>
                {standings.length > 0 ? standings.map((row, index) => (
                    <tr key={row.id}>
                        <td>{index + 1}</td>
                        <td className="team-cell" onClick={() => onTeamClick(row.team)} style={{ cursor: 'pointer' }}>
                            {row.team_logo && <img src={row.team_logo} alt={row.team_name} className="team-logo" />}
                            <span className="team-name-link">{row.team_name}</span>
                        </td>
                        <td>{row.played}</td>
                        <td>{row.wins}</td>
                        <td>{row.draws}</td>
                        <td>{row.losses}</td>
                        <td>{row.goal_difference}</td>
                        <td style={{ fontWeight: 800, color: 'var(--accent)' }}>{row.points}</td>
                    </tr>
                )) : (
                    <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                            Bu lig için henüz puan durumu oluşmadı.
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    </div>
);

const MatchesList = ({ matches, filter }) => {
    const navigate = useNavigate();

    // Group matches by week ID
    const groupedMatches = matches.reduce((acc, match) => {
        const weekKey = match.week || 'other';
        if (!acc[weekKey]) acc[weekKey] = [];
        acc[weekKey].push(match);
        return acc;
    }, {});

    const sortedWeeks = Object.keys(groupedMatches).sort((a, b) => {
        if (a === 'other') return 1;
        if (b === 'other') return -1;

        const weekA = Number(a);
        const weekB = Number(b);

        if (filter === 'played') {
            return weekB - weekA;
        }
        return weekA - weekB;
    });

    if (matches.length === 0) return <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Maç bulunamadı.</div>;

    return (
        <div className="matches-container">
            {sortedWeeks.map(weekId => {
                // Get week name preference: match.week_name -> weekId
                const rawWeekName = groupedMatches[weekId][0].week_name || weekId;

                // If the name is just a number (e.g. "1" or 1), format it as "1. Hafta"
                // isNaN("1") is false. isNaN("Final") is true.
                const isNumeric = !isNaN(rawWeekName);
                const weekName = isNumeric ? `${rawWeekName}. Hafta` : rawWeekName;

                return (
                    <div key={weekId} className="week-group">
                        <h3 className="week-header">{weekName}</h3>
                        <div className="match-list-grid">
                            {groupedMatches[weekId]
                                .sort((a, b) => new Date(a.date) - new Date(b.date))
                                .map(match => (
                                    <MatchCard key={match.id} match={match} />
                                ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default function LeaguePage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'standings';
    const matchFilter = searchParams.get('filter') || 'all';

    // Data States
    const [leaguesList, setLeaguesList] = useState([]);
    const [leagueId, setLeagueId] = useState(null);
    const [standings, setStandings] = useState([]);
    const [matches, setMatches] = useState([]);
    const [allMatches, setAllMatches] = useState([]);
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter States
    const [playerPage, setPlayerPage] = useState(() => {
        const pageParam = searchParams.get('page');
        return pageParam ? parseInt(pageParam) : 1;
    });
    const [playerSearch, setPlayerSearch] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [playerPosition, setPlayerPosition] = useState('');
    const [showPlayerFilter, setShowPlayerFilter] = useState(false);
    const [playerTotalPages, setPlayerTotalPages] = useState(1);

    // Sync URL with playerPage change
    useEffect(() => {
        if (activeTab === 'players') {
            setSearchParams(prev => {
                const newParams = new URLSearchParams(prev);
                newParams.set('page', playerPage);
                return newParams;
            }, { replace: true });
        }
    }, [playerPage, activeTab, setSearchParams]);

    // Error state
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    // Scroll active tab into view
    useEffect(() => {
        const container = document.getElementById('league-tabs-container');
        const activeTabEl = document.getElementById(`tab-${activeTab}`);
        if (container && activeTabEl) {
            const containerCenter = container.clientWidth / 2;
            const tabCenter = activeTabEl.offsetLeft + activeTabEl.clientWidth / 2;
            container.scrollTo({
                left: tabCenter - containerCenter,
                behavior: 'smooth'
            });
        }
    }, [activeTab]);

    // Init League
    useEffect(() => {
        const init = async () => {
            try {
                const leagues = await getLeagues();
                if (leagues && leagues.length > 0) {
                    // Sort by ID desc (latest first)
                    const sortedLeagues = [...leagues].sort((a, b) => b.id - a.id);
                    setLeaguesList(sortedLeagues);

                    // Default to first (latest)
                    setLeagueId(sortedLeagues[0].id);
                } else {
                    setError("Görüntülenecek lig bulunamadı.");
                }
            } catch (e) {
                console.error("League init failed", e);
                setError("Lig verileri yüklenirken bir hata oluştu.");
            }
        };
        init();
    }, []);

    useEffect(() => {
        // Load data if we have a league ID (for league tabs) OR if we are on players tab (global)
        if (leagueId || activeTab === 'players') {
            loadData();
        }
    }, [activeTab, matchFilter, playerPage, playerSearch, playerPosition, leagueId]);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            if (activeTab === 'standings' && leagueId) {
                const data = await getStandings(leagueId);
                // Ensure data is array
                const arr = Array.isArray(data) ? data : [];
                // Sort: points desc → goal difference desc → goals_for desc
                arr.sort((a, b) => {
                    if (b.points !== a.points) return b.points - a.points;
                    if (b.goal_difference !== a.goal_difference) return b.goal_difference - a.goal_difference;
                    return b.goals_for - a.goals_for;
                });
                setStandings(arr);
            } else if (activeTab === 'matches') {
                const params = leagueId ? { 'week__league': leagueId } : {};
                const data = await getMatches(params);

                let allData = Array.isArray(data) ? data : [];
                setAllMatches(allData);
                const now = new Date();

                let filtered = allData;
                if (matchFilter === 'live') {
                    filtered = allData.filter(m => m.is_live);
                } else if (matchFilter === 'played') {
                    filtered = allData.filter(m => m.is_finished);
                } else if (matchFilter === 'upcoming') {
                    filtered = allData.filter(m => !m.is_finished && !m.is_live);
                }
                setMatches(filtered);
            } else if (activeTab === 'players') {
                const data = await getPlayers({ page: playerPage, search: playerSearch, position: playerPosition });
                if (data.results) {
                    setPlayers(data.results);
                    setPlayerTotalPages(Math.ceil(data.count / 5));
                } else if (Array.isArray(data)) {
                    // Fallback if API changes and returns plain array
                    setPlayers(data);
                    setPlayerTotalPages(1);
                } else {
                    setPlayers([]);
                }
            }
        } catch (error) {
            console.error("Data load error:", error);
            setError("Veri yüklenemedi.");
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (tab) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('tab', tab);
        if (tab !== 'matches') newParams.delete('filter');
        setSearchParams(newParams);
    };

    const handleMatchFilterChange = (filter) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('filter', filter);
        setSearchParams(newParams);
    };

    const handleTeamClick = (teamId) => {
        navigate(`/teams/${teamId}`);
    };

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Close dropdown when clicking outside (simple version)
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isDropdownOpen && !event.target.closest('.league-selector-wrapper')) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isDropdownOpen]);

    return (
        <div className="league-page-container">
            {/* Header Tabs */}
            <div className="league-tabs" id="league-tabs-container">

                <button
                    onClick={() => handleTabChange('standings')}
                    className={`league-tab ${activeTab === 'standings' ? 'active' : ''}`}
                    id="tab-standings"
                >
                    Puan Durumu
                </button>
                <button
                    onClick={() => handleTabChange('matches')}
                    className={`league-tab ${activeTab === 'matches' ? 'active' : ''}`}
                    id="tab-matches"
                >
                    Maçlar
                </button>
                <button
                    onClick={() => handleTabChange('players')}
                    className={`league-tab ${activeTab === 'players' ? 'active' : ''}`}
                    id="tab-players"
                >
                    Oyuncular
                </button>
            </div>

            {/* League Selector */}
            <div className="league-header-row">
                <div className="league-selector-wrapper">
                    {leaguesList.length > 0 ? (
                        <>
                            <div
                                className="league-dropdown-trigger"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            >
                                <span className="selected-league-text">
                                    {leaguesList.find(l => l.id === leagueId)?.name}
                                    <span className="league-season-text"> ({leaguesList.find(l => l.id === leagueId)?.season})</span>
                                </span>
                                <ChevronDown className={`league-dropdown-arrow ${isDropdownOpen ? 'rotate-180' : ''}`} size={16} />
                            </div>

                            {isDropdownOpen && (
                                <div className="league-custom-dropdown-menu">
                                    {leaguesList.map(league => (
                                        <div
                                            key={league.id}
                                            className={`league-dropdown-item ${league.id === leagueId ? 'selected' : ''}`}
                                            onClick={() => {
                                                setLeagueId(league.id);
                                                setIsDropdownOpen(false);
                                            }}
                                        >
                                            {league.name} <span className="league-season-dim">({league.season})</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div style={{ color: 'var(--text-muted)' }}>Yükleniyor...</div>
                    )}
                </div>
            </div>

            {/* Content Area */}
            <div className={`transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>

                {error && <div className="error-message" style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>{error}</div>}

                {activeTab === 'standings' && (
                    <StandingsTable standings={standings} onTeamClick={handleTeamClick} />
                )}

                {activeTab === 'matches' && (
                    <div className="matches-view-container">
                        <div className="match-filters">
                            {['live', 'all', 'played', 'upcoming'].map(f => {
                                // Only show 'live' tab if there are live matches
                                if (f === 'live' && !allMatches.some(m => m.is_live) && matchFilter !== 'live') return null;
                                return (
                                    <button
                                        key={f}
                                        onClick={() => handleMatchFilterChange(f)}
                                        className={`filter-btn ${matchFilter === f ? 'active' : ''}`}
                                        style={f === 'live' ? { display: 'flex', alignItems: 'center', gap: '6px' } : {}}
                                    >
                                        {f === 'live' && (
                                            <span style={{
                                                width: '8px',
                                                height: '8px',
                                                borderRadius: '50%',
                                                background: '#ef4444',
                                                display: 'inline-block',
                                                animation: 'pulse-live 1.5s ease-in-out infinite'
                                            }} />
                                        )}
                                        {f === 'live' ? 'Canlı' : f === 'played' ? 'Oynanmış' : f === 'upcoming' ? 'Gelecek' : 'Tümü'}
                                    </button>
                                );
                            })}
                        </div>
                        <MatchesList matches={matches} filter={matchFilter} />
                    </div>
                )}

                {activeTab === 'players' && (
                    <div className="players-view-container">
                        <div className="player-search-container">
                            <div className="search-input-wrapper">
                                <Search size={18} className="search-icon-abs" />
                                <input
                                    type="text"
                                    placeholder="Oyuncu ara..."
                                    className="search-input"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && setPlayerSearch(searchTerm)}
                                />
                                <button
                                    onClick={() => setShowPlayerFilter(!showPlayerFilter)}
                                    className={`filter-toggle-btn ${showPlayerFilter || playerPosition ? 'active' : ''}`}
                                >
                                    <Filter size={16} />
                                </button>
                            </div>
                            <button
                                onClick={() => setPlayerSearch(searchTerm)}
                                className="search-action-btn"
                            >
                                Ara
                            </button>
                        </div>

                        {showPlayerFilter && (
                            <div className="position-filter-grid">
                                {['KL', 'STP', 'SLB', 'SĞB', 'DOS', 'MO', 'MOO', 'SLK', 'SGK', 'ST'].map(pos => (
                                    <button
                                        key={pos}
                                        onClick={() => {
                                            setPlayerPosition(pos === playerPosition ? '' : pos);
                                            setShowPlayerFilter(false);
                                        }}
                                        className={`pos-btn ${playerPosition === pos ? 'active' : ''}`}
                                    >
                                        {pos}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="player-list-container">
                            {players.length > 0 ? players.map(player => (
                                <div key={player.id} onClick={() => navigate(`/players/${player.id}`)} className="player-list-item">
                                    <div className="player-avatar">
                                        {player.photo ? (
                                            <img src={player.photo} alt={player.name} />
                                        ) : (
                                            <Users size={18} className="text-neutral-500" />
                                        )}
                                    </div>
                                    <div className="player-info-col">
                                        <div className="player-name-text">{player.name}</div>
                                        <div className="player-details-row">
                                            <span>{player.position}</span>
                                            {player.jersey_number && <span className="jersey-num">#{player.jersey_number}</span>}
                                        </div>
                                    </div>
                                    <div className="player-overall-badge">
                                        <span className="overall-val">{player.overall}</span>
                                        {player.current_team_logo && (
                                            <img src={player.current_team_logo} alt="" className="player-team-logo-small" />
                                        )}
                                    </div>
                                </div>
                            )) : (
                                !loading && <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Oyuncu bulunamadı.</div>
                            )}
                        </div>

                        {playerTotalPages > 1 && (
                            <div className="pagination-controls">
                                <button onClick={() => setPlayerPage(Math.max(1, playerPage - 1))} disabled={playerPage === 1} className="page-btn"><ChevronLeft size={20} /></button>
                                <div className="page-numbers">
                                    {(() => {
                                        let startPage = Math.max(1, playerPage - 1);
                                        let endPage = Math.min(playerTotalPages, startPage + 2);

                                        if (endPage - startPage < 2 && startPage > 1) {
                                            startPage = Math.max(1, endPage - 2);
                                        }

                                        const pages = [];
                                        for (let i = startPage; i <= endPage; i++) {
                                            pages.push(i);
                                        }
                                        return pages.map(p => (
                                            <button
                                                key={p}
                                                onClick={() => setPlayerPage(p)}
                                                className={`page-number-btn ${playerPage === p ? 'active' : ''}`}
                                            >
                                                {p}
                                            </button>
                                        ));
                                    })()}
                                </div>
                                <button onClick={() => setPlayerPage(Math.min(playerTotalPages, playerPage + 1))} disabled={playerPage === playerTotalPages} className="page-btn"><ChevronRight size={20} /></button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
