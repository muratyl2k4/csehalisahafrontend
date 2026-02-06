import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Hourglass } from 'lucide-react';
import '../styles/LeaguePage.css'; // Inherit styles for match-item

const MatchCard = ({ match }) => {
    const navigate = useNavigate();

    return (
        <div
            className="match-item"
            onClick={() => navigate(`/matches/${match.id}`)}
            style={{ marginBottom: '0.75rem' }} // Add some spacing default
        >
            <div className="match-team-col home-team">
                <span className="match-team-name">{match.team1_short_name || match.team1_name}</span>
                {match.team1_logo ? (
                    <img src={match.team1_logo} alt="" className="match-team-logo" />
                ) : (
                    <div className="team-logo-placeholder-sm" style={{ width: '32px', height: '32px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}>
                        {match.team1_short_name?.[0] || 'A'}
                    </div>
                )}
            </div>

            <div className="match-center-col">
                <span className="match-date-text">
                    {new Date(match.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
                <div className={`match-score-box ${!match.is_finished ? 'upcoming' : ''}`}>
                    {match.is_finished ? `${match.team1_score} - ${match.team2_score}` : <Hourglass size={16} />}
                </div>
            </div>

            <div className="match-team-col away-team">
                {match.team2_logo ? (
                    <img src={match.team2_logo} alt="" className="match-team-logo" />
                ) : (
                    <div className="team-logo-placeholder-sm" style={{ width: '32px', height: '32px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}>
                        {match.team2_short_name?.[0] || 'B'}
                    </div>
                )}
                <span className="match-team-name">{match.team2_short_name || match.team2_name}</span>
            </div>
        </div>
    );
};

export default MatchCard;
