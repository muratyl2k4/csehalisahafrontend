import React from 'react';
import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import '../styles/home.css';

const PlayerCard = ({ player, isCaptain = false, stats = [], onClick, disableLink = false }) => {
    // Data Normalization
    const id = player.player_id || player.id;
    const rawName = player.name || player.player_name;
    const photo = player.photo || player.player_photo;
    const position = player.position;
    const jerseyNumber = player.jersey_number;

    // Helper to format long names (3+ words) -> "A. Eren Karataş"
    const formatName = (fullName) => {
        if (!fullName) return '';
        const parts = fullName.trim().split(/\s+/);
        if (parts.length >= 3) {
            const first = parts[0];
            const rest = parts.slice(1).join(' ');
            return `${first.charAt(0)}. ${rest}`;
        }
        return fullName;
    };

    const name = formatName(rawName);

    const content = (
        <>
            <div className="player-list-left">
                {photo ? (
                    <img src={photo} alt={name} className="player-list-photo" />
                ) : (
                    <div className="player-list-placeholder">
                        <Users size={20} />
                    </div>
                )}
                <div className="player-list-info">
                    <span className="player-list-name">
                        {name}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {jerseyNumber && (
                            <span style={{ fontWeight: 600, background: 'rgba(255,255,255,0.1)', padding: '0 6px', borderRadius: '4px' }}>
                                #{jerseyNumber}
                            </span>
                        )}
                        {position && <span>{position}</span>}
                        {isCaptain && (
                            <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
                                (C)
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="player-list-stats">
                {stats.map((stat, index) => (
                    stat && (
                        <div key={index} className="p-stat">
                            <span className="p-stat-value" style={stat.color ? { color: stat.color } : {}}>
                                {stat.value}
                            </span>
                            <span className="p-stat-label">{stat.label}</span>
                        </div>
                    )
                ))}
            </div>
        </>
    );

    if (onClick) {
        return (
            <div className="player-list-item" onClick={onClick} style={{ cursor: 'pointer' }}>
                {content}
            </div>
        );
    }

    if (disableLink) {
        return (
            <div className="player-list-item">
                {content}
            </div>
        );
    }

    return (
        <Link to={`/players/${id}`} className="player-list-item">
            {content}
        </Link>
    );
};

export default PlayerCard;
