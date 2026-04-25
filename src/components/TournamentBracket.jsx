import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Trophy, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TournamentBracket = ({ tournament }) => {
    const [scale, setScale] = useState(0.8);
    const [position, setPosition] = useState({ x: 50, y: 50 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const containerRef = useRef(null);
    const contentRef = useRef(null);
    const navigate = useNavigate();
    const [lines, setLines] = useState([]);

    // Group matches by round
    const rounds = useMemo(() => {
        if (!tournament?.matches) return {};
        return tournament.matches.reduce((acc, match) => {
            if (!acc[match.round_index]) acc[match.round_index] = [];
            acc[match.round_index].push(match);
            return acc;
        }, {});
    }, [tournament]);

    const sortedRoundIndices = useMemo(() => Object.keys(rounds).sort((a, b) => a - b), [rounds]);

    // Calculate lines between matches
    useEffect(() => {
        const calculateLines = () => {
            const newLines = [];
            if (!contentRef.current) return;

            tournament.matches.forEach(match => {
                if (match.next_match) {
                    const fromEl = document.querySelector(`[data-match-id="${match.id}"]`);
                    const toEl = document.querySelector(`[data-match-id="${match.next_match}"]`);

                    if (fromEl && toEl) {
                        const contentRect = contentRef.current.getBoundingClientRect();
                        const fromRect = fromEl.getBoundingClientRect();
                        const toRect = toEl.getBoundingClientRect();

                        // Coordinates relative to the content container
                        const x1 = (fromRect.right - contentRect.left) / scale;
                        const y1 = (fromRect.top + fromRect.height / 2 - contentRect.top) / scale;
                        const x2 = (toRect.left - contentRect.left) / scale;
                        const y2 = (toRect.top + toRect.height / 2 - contentRect.top) / scale;

                        newLines.push({ x1, y1, x2, y2 });
                    }
                }
            });
            setLines(newLines);
        };

        // Delay to ensure elements are rendered
        const timeoutId = setTimeout(calculateLines, 100);
        window.addEventListener('resize', calculateLines);
        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('resize', calculateLines);
        };
    }, [tournament, scale, rounds]);

    // Zoom handler with native event to properly prevent page scroll
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleNativeWheel = (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            setScale(prev => Math.min(Math.max(prev * delta, 0.2), 3));
        };

        container.addEventListener('wheel', handleNativeWheel, { passive: false });
        return () => container.removeEventListener('wheel', handleNativeWheel);
    }, []);

    const handleMouseDown = (e) => {
        if (e.button === 0) {
            setIsDragging(true);
            setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
        }
    };

    const handleTouchStart = (e) => {
        setIsDragging(true);
        setDragStart({ x: e.touches[0].clientX - position.x, y: e.touches[0].clientY - position.y });
    };

    const handleMouseMove = (e) => {
        if (isDragging) {
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
    };

    const handleTouchMove = (e) => {
        if (isDragging) {
            setPosition({
                x: e.touches[0].clientX - dragStart.x,
                y: e.touches[0].clientY - dragStart.y
            });
        }
    };

    const handleMouseUp = () => setIsDragging(false);
    const handleTouchEnd = () => setIsDragging(false);

    if (!tournament || !tournament.matches?.length) return null;

    return (
        <div className="tournament-bracket-wrapper">
            <div className="bracket-header">
                <div className="header-info">
                    <Trophy size={18} className="text-primary" />
                    <h3>{tournament.name}</h3>
                </div>
         
            </div>

            <div 
                className="bracket-viewport"
                ref={containerRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            >
                <div 
                    className="bracket-content"
                    ref={contentRef}
                    style={{
                        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                        transformOrigin: '0 0'
                    }}
                >
                    {/* SVG Layer for Connections */}
                    <svg className="bracket-svg-layer">
                        {lines.map((line, idx) => {
                            const dx = line.x2 - line.x1;
                            const controlPoint = dx * 0.5;
                            const d = `M ${line.x1} ${line.y1} C ${line.x1 + controlPoint} ${line.y1}, ${line.x2 - controlPoint} ${line.y2}, ${line.x2} ${line.y2}`;
                            return (
                                <path 
                                    key={idx}
                                    d={d}
                                    fill="none"
                                    stroke="rgba(255,255,255,0.15)"
                                    strokeWidth="2"
                                    strokeDasharray="4 2"
                                />
                            );
                        })}
                    </svg>

                    {sortedRoundIndices.map((roundIdx) => (
                        <div key={roundIdx} className="bracket-round">
                            <div className="round-title">{rounds[roundIdx][0].round_name}</div>
                            <div className="round-matches">
                                {rounds[roundIdx].sort((a,b) => a.position - b.position).map(node => (
                                    <div 
                                        key={node.id} 
                                        data-match-id={node.id}
                                        className={`bracket-match-node ${node.is_finished ? 'finished' : ''}`}
                                        onClick={() => navigate(`/matches/${node.id}`)}
                                    >
                                        {/* Team 1 */}
                                        <div className={`node-team ${node.is_finished && node.team1_score > node.team2_score ? 'winner' : ''}`}>
                                            <div className="team-logo-small">
                                                {node.team1_logo ? <img src={node.team1_logo} alt="" /> : <Users size={12} />}
                                            </div>
                                            <span className="team-name">{node.team1_name || 'Bekleniyor...'}</span>
                                            <span className="team-score">{node.is_finished ? node.team1_score : '-'}</span>
                                        </div>
                                        
                                        {/* Team 2 */}
                                        <div className={`node-team ${node.is_finished && node.team2_score > node.team1_score ? 'winner' : ''}`}>
                                            <div className="team-logo-small">
                                                {node.team2_logo ? <img src={node.team2_logo} alt="" /> : <Users size={12} />}
                                            </div>
                                            <span className="team-name">{node.team2_name || 'Bekleniyor...'}</span>
                                            <span className="team-score">{node.is_finished ? node.team2_score : '-'}</span>
                                        </div>

                                        {node.is_live && <div className="live-badge-mini">CANLI</div>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .tournament-bracket-wrapper {
                    background: #0f172a;
                    border-radius: 16px;
                    margin-bottom: 2rem;
                    border: 1px solid rgba(255,255,255,0.1);
                    overflow: hidden;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.4);
                }
                .bracket-header {
                    padding: 1rem 1.5rem;
                    background: rgba(255,255,255,0.02);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }
                .header-info {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                .bracket-header h3 {
                    margin: 0;
                    font-size: 1rem;
                    color: #fff;
                    font-weight: 600;
                }
                .bracket-controls {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                .zoom-text {
                    color: rgba(255,255,255,0.5);
                    font-size: 0.75rem;
                    min-width: 40px;
                }
                .bracket-controls button {
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    color: #fff;
                    padding: 0.25rem 0.75rem;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.8rem;
                    transition: all 0.2s;
                }
                .bracket-controls button:hover {
                    background: rgba(255,255,255,0.1);
                    border-color: var(--primary);
                }
                .bracket-viewport {
                    height: 350px;
                    width: 100%;
                    position: relative;
                    overflow: hidden;
                    background: radial-gradient(circle at 2px 2px, rgba(255,255,255,0.03) 1px, transparent 0);
                    background-size: 30px 30px;
                }
                .bracket-content {
                    display: flex;
                    padding: 40px 100px;
                    gap: 120px;
                    min-width: max-content;
                    position: absolute;
                    user-select: none;
                }
                .bracket-svg-layer {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    z-index: 0;
                }
                .bracket-round {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                    z-index: 1;
                }
                .round-title {
                    text-align: center;
                    font-weight: 800;
                    color: rgba(255,255,255,0.3);
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    font-size: 0.7rem;
                    margin-bottom: 2rem;
                }
                .round-matches {
                    display: flex;
                    flex-direction: column;
                    justify-content: space-around;
                    flex: 1;
                    gap: 3rem;
                }
                .bracket-match-node {
                    background: #1e293b;
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 12px;
                    width: 200px;
                    overflow: hidden;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.5);
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .bracket-match-node:hover {
                    border-color: var(--primary);
                    transform: translateX(5px);
                    box-shadow: 0 10px 25px rgba(99, 102, 241, 0.2);
                }
                .node-team {
                    display: flex;
                    align-items: center;
                    padding: 0.75rem 1rem;
                    gap: 0.75rem;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }
                .node-team:last-child {
                    border-bottom: none;
                }
                .node-team.winner {
                    background: linear-gradient(90deg, rgba(99, 102, 241, 0.15) 0%, transparent 100%);
                }
                .node-team.winner .team-name {
                    color: #818cf8;
                    font-weight: 600;
                }
                .team-logo-small {
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(255,255,255,0.03);
                    border-radius: 6px;
                }
                .team-logo-small img {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                }
                .team-name {
                    flex: 1;
                    font-size: 0.85rem;
                    color: rgba(255,255,255,0.8);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .team-score {
                    font-weight: 900;
                    color: #fff;
                    font-size: 1rem;
                    min-width: 20px;
                    text-align: right;
                    font-family: 'Inter', sans-serif;
                }
                .live-badge-mini {
                    position: absolute;
                    top: -10px;
                    right: -10px;
                    background: #ef4444;
                    color: white;
                    font-size: 0.6rem;
                    font-weight: 900;
                    padding: 3px 8px;
                    border-radius: 6px;
                    border: 2px solid #0f172a;
                    animation: pulse-live 1.5s infinite;
                    box-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
                }
                @keyframes pulse-live {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.1); opacity: 0.8; }
                    100% { transform: scale(1); opacity: 1; }
                }
            ` }} />
        </div>
    );
};

export default TournamentBracket;
