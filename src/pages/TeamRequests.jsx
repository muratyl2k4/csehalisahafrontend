import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, Shield, Users } from 'lucide-react';
import { getTeam, respondToRequest } from '../services/api';
import '../styles/home.css';

function TeamRequests() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            const data = await getTeam(id);
            setTeam(data);
            // If strictly checking captain on frontend, could redirect here
            // But backend filters pending_requests anyway.
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleRespond = async (requestId, action) => {
        setActionLoading(requestId);
        try {
            await respondToRequest(requestId, action);
            loadData();
        } catch (error) {
            alert(error.response?.data?.detail || 'İşlem başarısız.');
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) return <div className="container loading-text">Yükleniyor...</div>;
    if (!team) return <div className="container error-text">Takım bulunamadı.</div>;

    // If no requests or not accessible (empty array), show message
    const requests = team.pending_requests || [];

    return (
        <div className="container" style={{ maxWidth: '800px' }}>
            <Link to={`/teams/${id}`} className="back-link">
                <ArrowLeft size={20} />
                Takıma Dön
            </Link>

            <div className="section-title">
                <h1>Transfer İstekleri</h1>
                <p className="subtitle" style={{ margin: 0 }}>{team.name}</p>
            </div>

            <div className="detail-section highlight-section" style={{ border: 'none', background: 'transparent', padding: 0 }}>
                {requests.length > 0 ? (
                    <div className="requests-list" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {requests.map(req => (
                            <div key={req.id} className="request-card" style={{ padding: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    {req.player_photo ? (
                                        <img src={req.player_photo} alt={req.player_name} style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-light)' }} />
                                    ) : (
                                        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={30} /></div>
                                    )}
                                    <div>
                                        <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{req.player_name}</div>
                                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{req.player_position} • OVR: {req.player_overall}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '5px' }}>
                                            {new Date(req.created_at).toLocaleDateString('tr-TR')}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <button
                                        onClick={() => handleRespond(req.id, 'ACCEPT')}
                                        disabled={actionLoading === req.id}
                                        className="btn-accept"
                                        title="Kabul Et"
                                        style={{ width: '48px', height: '48px', borderRadius: '50%' }}
                                    >
                                        <Check size={24} />
                                    </button>
                                    <button
                                        onClick={() => handleRespond(req.id, 'REJECT')}
                                        disabled={actionLoading === req.id}
                                        className="btn-reject"
                                        title="Reddet"
                                        style={{ width: '48px', height: '48px', borderRadius: '50%' }}
                                    >
                                        <X size={24} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="error-text" style={{ color: 'var(--text-muted)' }}>Bekleyen istek bulunmamaktadır.</div>
                )}
            </div>
        </div>
    );
}

export default TeamRequests;
