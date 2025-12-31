import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trophy, PlusCircle } from 'lucide-react';
import { getTeams, getPlayer } from '../services/api'; // Import getPlayer
import '../styles/main.css';

function Teams() {
    const navigate = useNavigate();
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userInfo, setUserInfo] = useState(null);

    useEffect(() => {
        loadTeams();
        checkUserStatus();
    }, []);

    const checkUserStatus = async () => {
        const storedUser = localStorage.getItem('user_info');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUserInfo(parsedUser);
                if (parsedUser.id) {
                    try {
                        const playerData = await getPlayer(parsedUser.id);
                        const updatedUser = { ...parsedUser, teamId: playerData.current_team };
                        if (parsedUser.teamId !== playerData.current_team) {
                            setUserInfo(updatedUser);
                            localStorage.setItem('user_info', JSON.stringify(updatedUser));
                        }
                    } catch (err) {
                        console.error("Failed to refresh user status", err);
                    }
                }
            } catch (e) {
                console.error("User info parse error", e);
            }
        }
    };

    const loadTeams = async () => {
        try {
            const data = await getTeams();
            setTeams(data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    if (loading) return <div className="container"><div className="loading">Yükleniyor...</div></div>;
    if (error) return <div className="container"><p style={{ textAlign: 'center', color: '#ef4444' }}>Hata: {error}</p></div>;

    return (
        <div className="container">
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'end',
                marginBottom: '2rem',
                paddingBottom: '1rem',
                borderBottom: '1px solid var(--border-light)'
            }}>
                <div>
                    <h1 style={{
                        fontSize: '2rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        marginBottom: '0.25rem',
                        background: 'linear-gradient(135deg, #fff 0%, #aaa 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        <Trophy size={32} color="var(--primary)" style={{ WebkitTextFillColor: 'initial' }} />
                        Puan Durumu
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginLeft: '3.5rem' }}>
                        Sezon 1
                    </p>
                </div>

                {/* Show Create Team button if user is logged in AND doesn't have a team */}
                {userInfo && userInfo.id && !userInfo.teamId && (
                    <Link
                        to="/create-team"
                        className="btn-primary"
                        style={{
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1.25rem'
                        }}
                    >
                        <PlusCircle size={20} />
                        Takım Oluştur
                    </Link>
                )}
            </div>

            {teams.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '2rem' }}>Henüz takım eklenmemiş.</p>
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
                            {teams.map((team, index) => (
                                <tr key={team.id} onClick={() => navigate(`/teams/${team.id}`)}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <div className="team-cell">
                                            {team.logo ? (
                                                <img src={team.logo} alt={team.name} className="team-logo" />
                                            ) : (
                                                <div className="team-logo" style={{ background: '#eee', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <span style={{ fontSize: '10px' }}>Logo</span>
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
    );
}

export default Teams;
