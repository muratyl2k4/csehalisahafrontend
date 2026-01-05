import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Users, Swords, BarChart3, Calendar, TrendingUp } from 'lucide-react';
import { getRecentMatches, getTopTeams, getTopPlayers, getTeams, getPlayers } from '../services/api';
import creatorLogo from '../assets/Murat Yıldırm (1).png';
import '../styles/home.css';

function Home() {
    const [topPlayers, setTopPlayers] = useState([]);
    const [topTeams, setTopTeams] = useState([]);
    const [loading, setLoading] = useState(true);



    const [totalStats, setTotalStats] = useState({ teams: 0, players: 0 });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            // Load Top Lists AND Total Counts
            // getTeams() returns all teams (array)
            // getPlayers({page: 1}) returns { count: ... }
            const [playersData, teamsData, allTeams, playersPage] = await Promise.all([
                getTopPlayers(),
                getTopTeams(),
                getTeams(),
                getPlayers({ page: 1 })
            ]);

            setTopPlayers(playersData);
            setTopTeams(teamsData);
            setTotalStats({
                teams: allTeams.length || 0,
                players: playersPage.count || 0
            });

            setLoading(false);
        } catch (error) {
            console.error('Error loading data:', error);
            setLoading(false);
        }
    };

    return (
        <div className="container">
            {/* Creator Header */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem', marginTop: '1rem' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 600 }}>Created By</span>
                <img src={creatorLogo} alt="Murat Yıldırım" style={{ height: '200px', width: 'auto', borderRadius: '10px' }} />
            </div>



            <h1>AKDENİZ CSE HALISAHA LİGİ</h1>
            <p className="subtitle">Akdeniz Üniversitesi Öğrencileri İçin Halı Saha Lig Simülasyonu</p>

            {/* Total Stats Section - Squares (Relocated & Styled) */}
            {/* Total Stats Section */}
            <div className="home-stats-grid">
                <div className="stat-card copper-glow">
                    <Trophy size={28} className="stat-icon-gold" />
                    <span className="stat-value gold-text">
                        {loading ? '-' : totalStats.teams}
                    </span>
                    <span className="stat-label">
                        TAKIM
                    </span>
                </div>

                <div className="stat-card copper-glow">
                    <Users size={28} className="stat-icon-copper" />
                    <span className="stat-value copper-text">
                        {loading ? '-' : totalStats.players}
                    </span>
                    <span className="stat-label">
                        OYUNCU
                    </span>
                </div>
            </div>

            {/* Widget Section */}
            <div className="widgets-section">

                {/* Top Teams */}
                <div className="widget">
                    <h2>
                        <TrendingUp size={24} style={{ color: '#fbbf24' }} />
                        <span style={{ background: 'linear-gradient(to right, #fbbf24, #d97706)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Takımlar
                        </span>
                    </h2>
                    {loading ? (
                        <div className="loading-placeholder">
                            <div className="skeleton-line"></div>
                            <div className="skeleton-line"></div>
                            <div className="skeleton-line"></div>
                        </div>
                    ) : (
                        <div className="teams-list">
                            {topTeams.slice(0, 3).map((team, index) => (
                                <Link to={`/teams/${team.id}`} key={team.id} className={`team-item rank-${index + 1}`} style={{ alignItems: 'center', padding: '1rem' }}>
                                    <div className={`team-rank rank-badge-${index + 1}`}>{index + 1}</div>
                                    {team.logo && <img src={team.logo} alt={team.name} className="list-logo" style={{ width: '40px', height: '40px', objectFit: 'contain', marginRight: '1rem' }} />}
                                    <div className="team-info" style={{ display: 'flex', alignItems: 'center' }}>
                                        <div className="team-name-text" style={{ fontSize: '1.1rem', fontWeight: 600 }}>{team.name}</div>
                                    </div>
                                </Link>
                            ))}
                            <Link to="/search?tab=teams" className="view-all-btn">
                                Tüm Takımlar
                            </Link>
                        </div>
                    )}
                </div>

                {/* Top Players */}
                <div className="widget">
                    <h2>
                        <Users size={24} style={{ color: '#fbbf24' }} />
                        <span style={{ background: 'linear-gradient(to right, #fbbf24, #d97706)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Oyuncular
                        </span>
                    </h2>
                    {loading ? (
                        <div className="loading-placeholder">
                            <div className="skeleton-line"></div>
                            <div className="skeleton-line"></div>
                            <div className="skeleton-line"></div>
                        </div>
                    ) : (
                        <div className="teams-list">
                            {topPlayers.slice(0, 3).map((player, index) => (
                                <Link to={`/players/${player.id}`} key={player.id} className={`team-item rank-${index + 1}`}>
                                    <div className={`team-rank rank-badge-${index + 1}`} style={{ fontSize: '1.2rem', fontWeight: 900 }}>{player.overall}</div>
                                    {player.photo ? (
                                        <img src={player.photo} alt={player.name} className="list-logo" style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '50%', border: '2px solid var(--bg-secondary)' }} />
                                    ) : (
                                        <div className="list-logo" style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Users size={20} />
                                        </div>
                                    )}
                                    <div className="team-info">
                                        <div className="team-name-text" style={{ fontSize: '1.1rem' }}>{player.name}</div>
                                        <div className="team-stats">
                                            {player.current_team_logo && <img src={player.current_team_logo} style={{ height: '16px' }} alt="" />}
                                            <span>{player.position}</span>
                                        </div>
                                    </div>

                                </Link>
                            ))}
                            <Link to="/search?tab=players" className="view-all-btn">
                                Tüm Oyuncular
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Dashboard Grid */}
            <h2 className="section-title">Hızlı Erişim</h2>
            <div className="dashboard-grid">
                <Link to="/search?tab=teams" className="dashboard-card">
                    <div className="card-icon">
                        <Trophy size={48} />
                    </div>
                    <h3>Takımlar</h3>
                    <p>Takım istatistiklerini görüntüle</p>
                </Link>

                <Link to="/search?tab=players" className="dashboard-card">
                    <div className="card-icon">
                        <Users size={48} />
                    </div>
                    <h3>Oyuncular</h3>
                    <p>Oyuncu kartları ve istatistikler</p>
                </Link>

                <Link to="/matches" className="dashboard-card">
                    <div className="card-icon">
                        <Swords size={48} />
                    </div>
                    <h3>Maçlar</h3>
                    <p>Maç sonuçları ve detayları</p>
                </Link>

                <Link to="/leaderboard" className="dashboard-card">
                    <div className="card-icon">
                        <BarChart3 size={48} />
                    </div>
                    <h3>Liderlik</h3>
                    <p>Gol ve asist krallığı</p>
                </Link>
            </div>
        </div>
    );
}

export default Home;
