import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMatch, ratePlayer, getPlayer } from '../services/api';
import { useToast } from '../context/ToastContext';
import PlayerCard from '../components/PlayerCard';
import FifaCard from '../components/cards/FifaCard';
import { ArrowLeft, Check, X, AlertCircle } from 'lucide-react';
import '../styles/main.css';

export default function VotingPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { success, error: showError } = useToast();

    const [match, setMatch] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);

    // Opponent Logic
    const [opponents, setOpponents] = useState([]);

    // Voting State
    const [ratedPlayerIds, setRatedPlayerIds] = useState([]);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'vote'

    // Ratings (1-10 scale)
    const [ratings, setRatings] = useState({
        pace: 5, shooting: 5, passing: 5, dribbling: 5, defense: 5, physical: 5,
        diving: 5, handling: 5, kicking: 5, reflexes: 5, speed: 5, positioning: 5
    });

    const [submitting, setSubmitting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isFetchingPlayer, setIsFetchingPlayer] = useState(false);

    useEffect(() => {
        const userInfo = localStorage.getItem('user_info');
        if (userInfo) setCurrentUser(JSON.parse(userInfo));
        loadMatch();
    }, [id]);

    const loadMatch = async () => {
        try {
            const data = await getMatch(id);
            setMatch(data);

            // Determine Opponents
            const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
            const team1Players = data.team1_players || [];
            const team2Players = data.team2_players || [];

            const inTeam1 = team1Players.some(p => p.player_id === userInfo.id);
            const inTeam2 = team2Players.some(p => p.player_id === userInfo.id);

            let ops = [];
            if (inTeam1) ops = team2Players;
            else if (inTeam2) ops = team1Players;
            else if (userInfo.is_staff) {
                ops = [...team1Players, ...team2Players];
            }
            setOpponents(ops);
        } catch (err) {
            console.error(err);
            showError('Maç bilgileri yüklenemedi.');
        } finally {
            setLoading(false);
        }
    };

    const handlePlayerClick = async (player) => {
        if (ratedPlayerIds.includes(player.player_id)) return;

        setIsFetchingPlayer(true);
        try {
            // Fetch full details to get FIFA Card stats (pace, shooting, etc.)
            const fullPlayer = await getPlayer(player.player_id);
            setSelectedPlayer(fullPlayer);

            // Reset ratings to defaults (5)
            setRatings({
                pace: 5, shooting: 5, passing: 5, dribbling: 5, defense: 5, physical: 5,
                diving: 5, handling: 5, kicking: 5, reflexes: 5, speed: 5, positioning: 5
            });
            setViewMode('vote');
        } catch (err) {
            console.error(err);
            showError("Oyuncu bilgileri alınamadı.");
        } finally {
            setIsFetchingPlayer(false);
        }
    };

    const handleVoteSubmit = () => {
        if (!selectedPlayer) return;
        setShowConfirmModal(true);
    };

    const handleFinalConfirm = async () => {
        if (!selectedPlayer) return;

        setSubmitting(true);
        try {
            // Prepare payload based on position
            const load = {
                rated_player_id: selectedPlayer.id,
                ratings: ratings
            };

            await ratePlayer(id, load); // match id is from params
            success(`${selectedPlayer.name} başarıyla oylandı.`);

            // Note: ratedPlayerIds check uses p.player_id from list. 
            // setRatedPlayerIds expects IDs matching the list source.
            // The list source has 'player_id'. Full object has 'id'. They should be same integer.
            setRatedPlayerIds(prev => [...prev, selectedPlayer.id]);

            setShowConfirmModal(false);
            setViewMode('list');
            setSelectedPlayer(null);
        } catch (err) {
            console.error(err);
            showError(err.response?.data?.detail || 'Puan kaydedilemedi.');
        } finally {
            setSubmitting(false);
        }
    };

    // Helper to get attributes based on position
    const getAttributes = (pos) => {
        if (pos === 'KL') {
            return [
                { key: 'diving', label: 'UÇM', fullName: 'Uçma', color: '#eab308' },
                { key: 'handling', label: 'EL', fullName: 'Elle Kontrol', color: '#eab308' },
                { key: 'kicking', label: 'AYK', fullName: 'Ayak', color: '#eab308' },
                { key: 'reflexes', label: 'REF', fullName: 'Refleks', color: '#eab308' },
                { key: 'speed', label: 'HIZ', fullName: 'Hız', color: '#eab308' },
                { key: 'positioning', label: 'YER', fullName: 'Yer Tutma', color: '#eab308' }
            ];
        }
        return [
            { key: 'pace', label: 'HIZ', fullName: 'Hız', color: '#ef4444' },
            { key: 'shooting', label: 'ŞUT', fullName: 'Şut', color: '#f59e0b' },
            { key: 'passing', label: 'PAS', fullName: 'Pas', color: '#10b981' },
            { key: 'dribbling', label: 'SÜR', fullName: 'Dribling', color: '#3b82f6' },
            { key: 'defense', label: 'DEF', fullName: 'Defans', color: '#6366f1' },
            { key: 'physical', label: 'FİZ', fullName: 'Fizik', color: '#8b5cf6' }
        ];
    };

    if (loading) return <div className="container loading-text">Yükleniyor...</div>;
    if (!match) return <div className="container error-text">Maç bulunamadı.</div>;

    // --- RENDER VOTE SCREEN ---
    if (viewMode === 'vote' && selectedPlayer) {
        const attributes = getAttributes(selectedPlayer.position);

        return (
            <div className="voting-overlay">
                {/* Header / Actions */}
                <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-light)' }}>
                    <button onClick={() => setViewMode('list')} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)' }}>
                        <X size={28} />
                    </button>
                    <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--text-secondary)' }}>OYLAMA</span>
                    <button onClick={handleVoteSubmit} disabled={submitting} style={{ background: 'transparent', border: 'none', color: '#4ade80' }}>
                        <Check size={28} />
                    </button>
                </div>

                {/* Main Content Split: Top (Card) - Bottom (Controls) */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '1rem', paddingBottom: '80px', gap: '1.5rem', overflowY: 'auto' }}>

                    {/* 1. FIFA CARD (Static - No Preview) */}
                    <div style={{ transform: 'scale(1)' }}>
                        <FifaCard player={selectedPlayer} />
                    </div>

                    {/* 2. SLIDERS */}
                    <div style={{ width: '100%', maxWidth: '400px', background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'x-large', columnGap: '2rem' }}>
                            {attributes.map(attr => (
                                <div key={attr.key} style={{ marginBottom: '0.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px', color: 'var(--text-muted)' }}>
                                        <span>
                                            {attr.fullName}
                                            <span style={{ fontSize: '0.85em', opacity: 0.9, marginLeft: '4px', fontWeight: 'normal' }}>(75 + 2.5x)</span>
                                        </span>
                                        <span style={{ color: attr.color, fontSize: '1rem' }}>{ratings[attr.key]}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="1" max="10" step="1"
                                        value={ratings[attr.key]}
                                        onChange={(e) => setRatings(prev => ({ ...prev, [attr.key]: parseInt(e.target.value) }))}
                                        style={{
                                            width: '100%',
                                            accentColor: attr.color,
                                            cursor: 'pointer',
                                            height: '6px'
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Confirmation Modal OVER the Vote Screen */}
                {showConfirmModal && (
                    <div style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2100, backdropFilter: 'blur(5px)'
                    }}>
                        <div style={{
                            background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '16px', maxWidth: '400px', width: '90%',
                            textAlign: 'center', border: '1px solid var(--border-light)'
                        }}>
                            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--bg-hover)', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <AlertCircle size={40} color="var(--primary)" />
                            </div>
                            <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1.25rem' }}>Puanları Onayla</h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                                <strong>{selectedPlayer.name}</strong> için girdiğiniz puanları onaylıyor musunuz? Bu işlem geri alınamaz.
                            </p>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                <button
                                    onClick={() => setShowConfirmModal(false)}
                                    style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', background: 'transparent', border: '1px solid var(--border-medium)', color: 'var(--text-primary)', cursor: 'pointer' }}
                                >
                                    Düzenle
                                </button>
                                <button
                                    onClick={handleFinalConfirm}
                                    style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', background: '#eab308', border: 'none', color: 'black', fontWeight: 'bold', cursor: 'pointer' }}
                                >
                                    {submitting ? 'Kaydediliyor...' : 'Onayla'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // --- RENDER LIST SCREEN ---
    return (
        <div className="container">
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
                <button onClick={() => navigate(-1)} className="btn-ghost" style={{ display: 'flex', gap: '0.5rem', paddingLeft: 0 }}>
                    <ArrowLeft size={24} />
                    Maça Dön
                </button>
                <div style={{ flex: 1, textAlign: 'center', paddingRight: '24px' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>OYLAMA</h2>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}></p>
                </div>
            </div>

            {isFetchingPlayer && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    Oyuncu bilgileri alınıyor...
                </div>
            )}

            {/* Players Grid */}
            <div className="player-grid-list" style={{ width: '100%', maxWidth: '800px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
                {opponents.length > 0 ? opponents.map(p => {
                    const isRated = ratedPlayerIds.includes(p.player_id);
                    return (
                        <div
                            key={p.player_id}
                            onClick={() => handlePlayerClick(p)}
                            style={{
                                opacity: isRated ? 0.5 : 1,
                                filter: isRated ? 'grayscale(100%)' : 'none',
                                pointerEvents: isRated ? 'none' : 'auto',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                transform: isRated ? 'scale(0.95)' : 'none'
                            }}
                        >
                            <PlayerCard player={p} disableLink={true} />
                            {isRated && <div style={{ textAlign: 'center', color: '#10b981', fontWeight: 'bold', marginTop: '0.5rem' }}>Oylandı</div>}
                        </div>
                    );
                }) : (
                    <div style={{ colSpan: 3, textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Oylanacak rakip bulunamadı.</div>
                )}
            </div>
        </div>
    );
}
