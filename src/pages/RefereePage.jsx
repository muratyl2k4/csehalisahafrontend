import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMatch, recordGoal, recordCard, finishMatch, startMatch } from '../services/api';
import { useToast } from '../context/ToastContext';
import { ArrowLeft, Dribbble, X, Skull, Users, PlayCircle } from 'lucide-react';
import PlayerCard from '../components/PlayerCard';
import '../styles/referee.css'; // Import new styles

const RefereePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { success, error } = useToast();

    const [match, setMatch] = useState(null);
    const [loading, setLoading] = useState(true);

    // Flow State
    const [flowStep, setFlowStep] = useState('menu'); // menu, select_team, select_player, select_assist, select_card_type
    const [actionType, setActionType] = useState(null); // 'goal', 'card'

    // Selection Data
    const [selection, setSelection] = useState({
        team: null,
        player: null,
        assist: null,
        cardType: null
    });

    useEffect(() => {
        loadMatch();
    }, [id]);

    const loadMatch = async () => {
        try {
            const data = await getMatch(id);
            setMatch(data);
        } catch (err) {
            console.error(err);
            error('Maç detayları yüklenemedi.');
        } finally {
            setLoading(false);
        }
    };

    const resetFlow = () => {
        setFlowStep('menu');
        setActionType(null);
        setSelection({ team: null, player: null, assist: null, cardType: null });
    };

    const handleBack = () => {
        if (flowStep === 'menu') {
            navigate(`/matches/${id}`);
        } else {
            // Go back one step logic could be complex, simple reset for now
            resetFlow();
        }
    };

    // --- Handlers ---

    // Updated: Accept specific team to start action for
    const startGoal = (team) => {
        setActionType('goal');
        setSelection(prev => ({ ...prev, team }));
        // Skip team selection, go straight to player selection
        setFlowStep('select_player');
    };

    const startCard = (team) => {
        setActionType('card');
        setSelection(prev => ({ ...prev, team }));
        // Skip team selection
        setFlowStep('select_player');
    };

    const handleTeamSelect = (team) => {
        // Redundant now but kept for safety
        setSelection(prev => ({ ...prev, team }));
        setFlowStep('select_player');
    };

    const handlePlayerSelect = (player) => {
        setSelection(prev => ({ ...prev, player }));

        if (actionType === 'goal') {
            setFlowStep('select_assist');
        } else {
            setFlowStep('select_card_type');
        }
    };

    const submitOwnGoal = async () => {
        if (!match) return;

        // Own goal is assigned to the OTHER team's score, but recorded for the player
        // Logic: if current selection.team is Team A, own goal increments Team B score? 
        // Backend handles own goal logic usually, but here we just send 'own_goal' flag.

        try {
            await recordGoal(id, {
                player_id: null, // No specific scorer for simple own goal or select player? 
                // Wait, own goal usually has a player who did it. 
                // For simplicity, let's treat "Own Goal" as a generic event or ask for player?
                // Current UI flow: "Kendi Kalesine" button is in player list.
                // If clicked, we might need to know WHO did it, or just record it for the team.
                // Let's assume generic Own Goal for now or require player selection FIRST then 'Own Goal'?
                // Actually button is IN the list, so it implies "Unknown Player / Generic".
                own_goal: true,
                team_id: selection.team.id
            });
            success('Kendi kalesine gol kaydedildi');
            loadMatch();
            resetFlow();
        } catch (err) {
            console.error(err);
            error('Gol kaydedilemedi');
        }
    };

    // Fix Own Goal Flow: separate handler if "Kendi Kalesine" is a button separate from players
    // In new design, it's inside renderPlayerSelection. 

    const submitGoal = async (assistPlayer) => {
        if (!selection.player || !match) return;

        try {
            await recordGoal(id, {
                player_id: selection.player.player_id,
                assist_player_id: assistPlayer ? assistPlayer.player_id : null,
                team_id: selection.team.id,
                own_goal: false
            });
            success('Gol başarıyla kaydedildi');
            loadMatch();
            resetFlow();
        } catch (err) {
            console.error(err);
            error('Gol kaydedilemedi');
        }
    };

    const submitCard = async (cardType) => {
        if (!selection.player || !match) return;

        try {
            await recordCard(id, {
                player_id: selection.player.player_id,
                team_id: selection.team.id,
                card_type: cardType
            });
            success(`${cardType === 'yellow' ? 'Sarı' : 'Kırmızı'} kart kaydedildi`);
            loadMatch();
            resetFlow();
        } catch (err) {
            console.error(err);
            error('Kart kaydedilemedi');
        }
    };

    // State for Finish Confirmation
    const [showConfirmFinish, setShowConfirmFinish] = useState(false);

    const handleFinishClick = () => {
        setShowConfirmFinish(true);
    };

    const confirmFinishMatch = async () => {
        try {
            await finishMatch(id);
            success("Maç başarıyla tamamlandı.");
            navigate(`/matches/${id}`);
        } catch (err) {
            console.error("Maç bitirilirken hata:", err);
            error("Maç bitirilemedi.");
        } finally {
            setShowConfirmFinish(false);
        }
    };

    const handleStartMatch = async () => {
        try {
            await startMatch(id);
            success("Maç başlatıldı!");
            loadMatch(); // Reload to get updated is_live
        } catch (err) {
            console.error("Maç başlatılırken hata:", err);
            error(err?.response?.data?.detail || "Maç başlatılamadı.");
        }
    };

    // --- Helpers ---
    const getTeamPlayers = (teamId) => {
        if (!match) return [];
        if (teamId === match.team1_info.id) return match.team1_players || [];
        if (teamId === match.team2_info.id) return match.team2_players || [];
        return [];
    };

    if (loading) return <div className="referee-container"><div className="loading">Yükleniyor...</div></div>;
    if (!match) return <div className="referee-container"><div style={{ padding: '2rem', textAlign: 'center', color: 'white' }}>Maç bulunamadı.</div></div>;

    // --- Render Logic ---

    // Custom Soccer Ball Icon
    const SoccerBall = ({ size = 24, color = "white" }) => (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
            <path d="M2 12h20" />
            <path d="M12 2v20" />
            <path d="M4.93 4.93l14.14 14.14" />
            <path d="M14.14 4.93l-14.14 14.14" />
        </svg>
    );

    // Standard Hexagon Ball (Better SVG)
    const ClassicBall = ({ size = 24, color = "white" }) => (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 7l-2.5-4.5" />
            <path d="M12 7l2.5-4.5" />
            <path d="M12 7v5" />
            <path d="M12 12l-4.5 2.5" />
            <path d="M12 12l4.5 2.5" />
            <path d="M7.5 14.5l-4.5-2.5" />
            <path d="M16.5 14.5l4.5-2.5" />
            <path d="M7.5 14.5v5" />
            <path d="M16.5 14.5v5" />
        </svg>
    );

    // 1. Menu View (Split Layout)
    const renderMenu = () => (
        <div className="fade-in" style={{
            flex: 1,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
        }}>
            {/* Main Content Area */}
            <div className="menu-container">

                {/* PRE-MATCH: Show Start Button */}
                {!match.is_live && !match.is_finished && (
                    <>
                        {/* Scoreboard Row (Logos only, no score yet) */}
                        <div className="scoreboard-top">
                            <div className="team-info-top">
                                <span className="team-short">{match.team1_info.short_name}</span>
                                <img src={match.team1_info.logo} alt="" className="team-logo-xl" />
                            </div>

                            <div className="score-center">
                                <div style={{
                                    fontSize: '1.2rem',
                                    fontWeight: 700,
                                    color: 'var(--text-muted)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '2px'
                                }}>VS</div>
                            </div>

                            <div className="team-info-top">
                                <span className="team-short">{match.team2_info.short_name}</span>
                                <img src={match.team2_info.logo} alt="" className="team-logo-xl" />
                            </div>
                        </div>

                        {/* Start Match Button */}
                        <div className="finish-container">
                            <button
                                className="finish-btn"
                                onClick={handleStartMatch}
                                style={{
                                    background: 'rgba(34, 197, 94, 0.8)',
                                    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
                                    border: '1px solid rgba(74, 222, 128, 0.3)'
                                }}
                            >
                                <PlayCircle size={24} />
                                MAÇI BAŞLAT
                            </button>
                        </div>
                    </>
                )}

                {/* LIVE MATCH: Show Scoreboard + Actions */}
                {match.is_live && (
                    <>
                        {/* 1. Scoreboard Row (Logos + Score) */}
                        <div className="scoreboard-top">
                            <div className="team-info-top">
                                <span className="team-short">{match.team1_info.short_name}</span>
                                <img src={match.team1_info.logo} alt="" className="team-logo-xl" />
                            </div>

                            <div className="score-center">
                                <div className="score-box">
                                    <span className="score-val">{match.team1_score}</span>
                                    <span className="score-divider">-</span>
                                    <span className="score-val">{match.team2_score}</span>
                                </div>
                            </div>

                            <div className="team-info-top">
                                <span className="team-short">{match.team2_info.short_name}</span>
                                <img src={match.team2_info.logo} alt="" className="team-logo-xl" />
                            </div>
                        </div>

                        {/* 2. Actions Row (Buttons Under Teams) */}
                        <div className="actions-row">
                            <div className="team-actions-col">
                                <button className="action-btn-rect goal" onClick={() => startGoal(match.team1_info)}>
                                    <div className="icon-circle">
                                        <ClassicBall size={24} color="white" />
                                    </div>
                                    <span className="btn-label">GOL</span>
                                </button>
                                <button className="action-btn-rect card" onClick={() => startCard(match.team1_info)}>
                                    <div className="card-mini-group">
                                        <div className="card-mini bg-yellow"></div>
                                        <div className="card-mini bg-red"></div>
                                    </div>
                                    <span className="btn-label">KART</span>
                                </button>
                            </div>

                            <div className="spacer-col"></div>

                            <div className="team-actions-col">
                                <button className="action-btn-rect goal" onClick={() => startGoal(match.team2_info)}>
                                    <div className="icon-circle">
                                        <ClassicBall size={24} color="white" />
                                    </div>
                                    <span className="btn-label">GOL</span>
                                </button>
                                <button className="action-btn-rect card" onClick={() => startCard(match.team2_info)}>
                                    <div className="card-mini-group">
                                        <div className="card-mini bg-yellow"></div>
                                        <div className="card-mini bg-red"></div>
                                    </div>
                                    <span className="btn-label">KART</span>
                                </button>
                            </div>
                        </div>

                        <div className="finish-container">
                            <button className="finish-btn" onClick={handleFinishClick}>
                                <X size={24} />
                                MAÇI BİTİR
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );

    // 2. Team Selection View - REMOVED (Direct flow preferred)

    // 3. Player Selection View (Scorer or Card Receiver)
    const renderPlayerSelection = () => {
        const players = getTeamPlayers(selection.team.id);
        const title = actionType === 'goal'
            ? `${selection.team.name} - Golü Kim Attı?`
            : `${selection.team.name} - Kart Kime?`;

        return (
            <div className="fade-in">
                <h3 className="step-title">{title}</h3>
                <div className="player-grid-list">
                    {/* Special Options for Goal */}
                    {actionType === 'goal' && (
                        <div className="special-card-btn" onClick={submitOwnGoal}>
                            <Skull size={24} />
                            <span>Kendi Kalesine</span>
                        </div>
                    )}

                    {players.map(p => (
                        <PlayerCard
                            key={p.id}
                            player={{ ...p.player, name: p.player_name, photo: p.player_photo }}
                            onClick={() => handlePlayerSelect(p)}
                        />
                    ))}
                </div>
            </div>
        );
    };

    // 4. Assist Selection View
    const renderAssistSelection = () => {
        const players = getTeamPlayers(selection.team.id).filter(p => p.player_id !== selection.player.player_id);

        return (
            <div className="fade-in">
                <h3 className="step-title">Asist Var Mı?</h3>
                <div className="player-grid-list">
                    <div className="special-card-btn" onClick={() => submitGoal(null)}>
                        <X size={24} />
                        <span>Asist Yok</span>
                    </div>

                    {players.map(p => (
                        <PlayerCard
                            key={p.id}
                            player={{ ...p.player, name: p.player_name, photo: p.player_photo }}
                            onClick={() => submitGoal(p)}
                        />
                    ))}
                </div>
            </div>
        );
    };

    // 5. Card Type Selection View
    const renderCardTypeSelection = () => (
        <div className="fade-in">
            <h3 className="step-title">Kart Rengi</h3>
            <div className="card-type-grid">
                <button className="card-type-btn yellow" onClick={() => submitCard('yellow')}>
                    <div className="big-card-rect" style={{ background: '#facc15' }}></div>
                    SARI KART
                </button>
                <button className="card-type-btn red" onClick={() => submitCard('red')}>
                    <div className="big-card-rect" style={{ background: '#ef4444' }}></div>
                    KIRMIZI KART
                </button>
            </div>
        </div>
    );

    return (
        <div className="referee-container">
            {/* Modal for Finish Confirmation */}
            {showConfirmFinish && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(5px)'
                }}>
                    <div style={{
                        background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '16px', maxWidth: '400px', width: '90%',
                        textAlign: 'center', border: '1px solid var(--border-light)'
                    }}>
                        <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1.25rem' }}>Maçı Bitir?</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                            Maçı bitirmek istediğinize emin misiniz? Bu işlem geri alınamaz ve skor kesinleşecektir.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button
                                onClick={() => setShowConfirmFinish(false)}
                                style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', background: 'transparent', border: '1px solid var(--border-medium)', color: 'var(--text-primary)', cursor: 'pointer' }}
                            >
                                İptal
                            </button>
                            <button
                                onClick={confirmFinishMatch}
                                style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', background: '#ef4444', border: 'none', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
                            >
                                Maçı Bitir
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Dynamic Content (Header is now part of the scrollable content) */}
            <div className="referee-content">
                {/* Header with Navigation - Now Scrolls Naturally */}
                <div className="referee-header">
                    {/* Left: Back Button (Only if not in Menu) */}
                    {flowStep !== 'menu' ? (
                        <button className="header-btn" onClick={resetFlow}>
                            <ArrowLeft size={24} />
                        </button>
                    ) : (
                        <div style={{ width: 40 }} /> /* Spacer to keep title centered */
                    )}

                    <h2 className="page-title">MAÇ YÖNETİM PANELİ</h2>

                    {/* Right: Empty Spacer */}
                    <div style={{ width: 40 }} />
                </div>

                {flowStep === 'menu' && renderMenu()}
                {flowStep === 'select_player' && renderPlayerSelection()}
                {flowStep === 'select_assist' && renderAssistSelection()}
                {flowStep === 'select_card_type' && renderCardTypeSelection()}
            </div>
        </div>
    );
};

export default RefereePage;
