import { useState, useEffect } from 'react';
import { X, Star, Save, User } from 'lucide-react';
import '../styles/main.css';

const ATTRIBUTES = [
    { key: 'pace', label: 'Hız (PAC)', color: '#ef4444' },
    { key: 'shooting', label: 'Şut (SHO)', color: '#f59e0b' },
    { key: 'passing', label: 'Pas (PAS)', color: '#10b981' },
    { key: 'dribbling', label: 'Top Sürme (DRI)', color: '#3b82f6' },
    { key: 'defense', label: 'Defans (DEF)', color: '#6366f1' },
    { key: 'physical', label: 'Fizik (PHY)', color: '#8b5cf6' }
];

export default function PlayerRatingModal({ isOpen, onClose, opponents, onSubmit, alreadyRatedIds = [] }) {
    const [selectedPlayerId, setSelectedPlayerId] = useState('');
    const [ratings, setRatings] = useState({
        pace: 5, shooting: 5, passing: 5, dribbling: 5, defense: 5, physical: 5
    });
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setSelectedPlayerId('');
            setRatings({ pace: 5, shooting: 5, passing: 5, dribbling: 5, defense: 5, physical: 5 });
            setComment('');
            setSubmitting(false);
        }
    }, [isOpen]);

    const handleRatingChange = (key, value) => {
        setRatings(prev => ({ ...prev, [key]: parseInt(value) }));
    };

    const handleSubmit = async () => {
        if (!selectedPlayerId) return;

        setSubmitting(true);
        try {
            await onSubmit(selectedPlayerId, ratings, comment);
            // Success handled by parent (closing modal or showing toast)
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    // Filter out players who are already rated
    const availableOpponents = opponents.filter(p => !alreadyRatedIds.includes(p.player_id));

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
            backdropFilter: 'blur(5px)'
        }}>
            <div style={{
                backgroundColor: 'var(--bg-secondary)', width: '90%', maxWidth: '400px',
                borderRadius: '12px', padding: '1.5rem', border: '1px solid var(--border-light)',
                maxHeight: '90vh', overflowY: 'auto'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white' }}>
                        <Star size={24} className="text-yellow-500" fill="#eab308" color="#eab308" />
                        Rakibi Oyla
                    </h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>

                {availableOpponents.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        <p>Oylanabilecek rakip oyuncu kalmadı.</p>
                        <button className="btn-secondary" onClick={onClose} style={{ marginTop: '1rem', width: '100%', padding: '0.75rem', borderRadius: '6px', background: 'var(--bg-hover)', color: 'white', border: 'none' }}>Kapat</button>
                    </div>
                ) : (
                    <>
                        {/* 1. Select Player */}
                        {!selectedPlayerId ? (
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                    Kimi oylamak istiyorsun?
                                </label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', gap: '0.75rem' }}>
                                    {availableOpponents.map(p => (
                                        <div
                                            key={p.player_id}
                                            onClick={() => setSelectedPlayerId(p.player_id)}
                                            style={{
                                                border: '1px solid var(--border-light)',
                                                borderRadius: '8px',
                                                padding: '0.5rem',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                cursor: 'pointer',
                                                background: 'var(--bg-primary)',
                                                transition: 'all 0.2s',
                                                gap: '0.5rem'
                                            }}
                                        >
                                            {p.player_photo ? (
                                                <img src={p.player_photo} alt="" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <User size={24} color="var(--text-muted)" />
                                                </div>
                                            )}
                                            <span style={{ fontSize: '0.75rem', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', color: 'white' }}>
                                                {p.player_name ? p.player_name.split(' ')[0] : 'Oyuncu'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="rating-form fade-in">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-light)' }}>
                                    <button onClick={() => setSelectedPlayerId('')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}>&larr; Geri</button>
                                    <span style={{ fontWeight: 600, color: 'white' }}>
                                        {availableOpponents.find(p => p.player_id === selectedPlayerId)?.player_name}
                                    </span>
                                </div>

                                {/* 2. Sliders */}
                                <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
                                    {ATTRIBUTES.map(attr => (
                                        <div key={attr.key}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: attr.color }}>{attr.label}</label>
                                                <span style={{ fontWeight: 700, color: 'white', background: attr.color, padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem' }}>{ratings[attr.key]}</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="1"
                                                max="10"
                                                step="1"
                                                value={ratings[attr.key]}
                                                onChange={(e) => handleRatingChange(attr.key, e.target.value)}
                                                style={{ width: '100%', accentColor: attr.color, height: '6px' }}
                                            />
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                                <span>1</span>
                                                <span>10</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* 3. Comment */}
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Yorum (İsteğe bağlı)</label>
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Performans notu..."
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-light)', background: 'var(--bg-primary)', color: 'white', minHeight: '60px', resize: 'vertical' }}
                                    />
                                </div>

                                <button
                                    className="btn-primary"
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: '6px', background: 'var(--primary)', color: 'white', border: 'none', cursor: submitting ? 'not-allowed' : 'pointer' }}
                                >
                                    {submitting ? 'Kaydediliyor...' : (
                                        <>
                                            <Save size={18} />
                                            Puanı Kaydet
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
