import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, Info, ChevronRight, X } from 'lucide-react';
import { getNotifications, markNotificationRead, markAllNotificationsRead, sendBroadcastNotification } from '../services/api';
import '../styles/main.css';
import { useToast } from '../context/ToastContext';

function Notifications() {
    const navigate = useNavigate();
    const { success, error: showError } = useToast();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedModalContent, setSelectedModalContent] = useState(null);
    const [broadcastMessage, setBroadcastMessage] = useState('');
    const [broadcastTitle, setBroadcastTitle] = useState('');
    const [broadcastTarget, setBroadcastTarget] = useState('users'); // 'users' | 'all'

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleBroadcast = async () => {
        if (!broadcastMessage.trim() || !broadcastTitle.trim()) return;
        try {
            await sendBroadcastNotification(broadcastMessage, broadcastTitle, broadcastTarget);
            success('Duyuru başarıyla gönderildi.');
            setBroadcastMessage('');
            setBroadcastTitle('');
            fetchNotifications(); // Refresh list to see own message (only valid for 'users' target or logged in user)
        } catch (err) {
            console.error(err);
            showError('Duyuru gönderilemedi.');
        }
    };

    const fetchNotifications = async () => {
        try {
            const data = await getNotifications();
            setNotifications(data);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllNotificationsRead();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch (error) {
            console.error(error);
        }
    };

    const handleNotificationClick = async (notification) => {
        // Mark as read immediately
        if (!notification.is_read) {
            try {
                await markNotificationRead(notification.id);
                setNotifications(prev =>
                    prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
                );
            } catch (e) {
                console.error(e);
            }
        }

        // Action logic
        if (notification.notification_type === 'SYSTEM') {
            setSelectedModalContent(notification.message);
        } else if (notification.related_link) {
            navigate(notification.related_link);
        }
    };

    if (loading) return <div className="container"><div className="loading">Yükleniyor...</div></div>;

    return (
        <div className="container" style={{ maxWidth: '600px' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h1 className="page-title" style={{ margin: 0 }}>Bildirimler</h1>
                {notifications.some(n => !n.is_read) && (
                    <button
                        onClick={handleMarkAllRead}
                        style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}
                    >
                        Tümünü Okundu İşaretle
                    </button>
                )}
            </div>

            {/* Admin Broadcast Panel */}
            {JSON.parse(localStorage.getItem('user_info') || '{}').is_staff && (
                <div style={{
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    border: '1px border var(--primary)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    marginBottom: '2rem'
                }}>
                    <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
                        <Info size={20} color="var(--primary)" />
                        Sistem Duyurusu Yayınla (Admin Paneli)
                    </h3>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Hedef Kitle:</label>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="target"
                                    value="users"
                                    checked={broadcastTarget === 'users'}
                                    onChange={(e) => setBroadcastTarget(e.target.value)}
                                />
                                Sadece Kayıtlı Kullanıcılar
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="target"
                                    value="all"
                                    checked={broadcastTarget === 'all'}
                                    onChange={(e) => setBroadcastTarget(e.target.value)}
                                />
                                Herkes (Anonim Dahil)
                            </label>
                        </div>
                    </div>

                    <input
                        type="text"
                        value={broadcastTitle}
                        onChange={(e) => setBroadcastTitle(e.target.value)}
                        placeholder="Bildirim Başlığı"
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: '8px',
                            border: '1px solid var(--border-light)',
                            backgroundColor: 'var(--bg-primary)',
                            color: 'var(--text-primary)',
                            marginBottom: '1rem',
                            fontFamily: 'inherit'
                        }}
                    />

                    <textarea
                        value={broadcastMessage}
                        onChange={(e) => setBroadcastMessage(e.target.value)}
                        placeholder="Mesaj içeriği..."
                        style={{
                            width: '100%',
                            padding: '1rem',
                            borderRadius: '8px',
                            border: '1px solid var(--border-light)',
                            backgroundColor: 'var(--bg-primary)',
                            color: 'var(--text-primary)',
                            marginBottom: '1rem',
                            minHeight: '80px',
                            fontFamily: 'inherit'
                        }}
                    />
                    <div style={{ textAlign: 'right' }}>
                        <button
                            className="btn-primary"
                            onClick={handleBroadcast}
                            disabled={!broadcastMessage.trim() || !broadcastTitle.trim()}
                        >
                            Gönder ({broadcastTarget === 'all' ? 'Herkese' : 'Kullanıcılara'})
                        </button>
                    </div>
                </div>
            )}

            {/* List */}
            {notifications.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                    <Bell size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                    <p>Henüz bildiriminiz yok.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {notifications.map((notif) => (
                        <div
                            key={notif.id}
                            onClick={() => handleNotificationClick(notif)}
                            style={{
                                backgroundColor: notif.is_read ? 'var(--bg-secondary)' : '#2a2a35', // Highlight unread
                                border: `1px solid ${notif.is_read ? 'var(--border-light)' : 'var(--primary)'}`,
                                borderRadius: '12px',
                                padding: '1rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                transition: 'transform 0.1s'
                            }}
                            className="notification-item"
                        >
                            {/* Icon based on Type */}
                            <div style={{
                                minWidth: '40px', height: '40px', borderRadius: '50%',
                                background: getTypeColor(notif.notification_type),
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                {getTypeIcon(notif.notification_type)}
                            </div>

                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.25rem', lineHeight: '1.4' }}>
                                    {notif.message.length > 100 ? `${notif.message.substring(0, 100)}...` : notif.message}
                                </p>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    {new Date(notif.created_at).toLocaleDateString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>

                            {!notif.is_read && (
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary)' }}></div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* System Message Modal */}
            {selectedModalContent && (
                <div style={overlayStyle}>
                    <div style={modalStyle}>
                        <div style={modalHeaderStyle}>
                            <h3>Sistem Mesajı</h3>
                            <button onClick={() => setSelectedModalContent(null)} style={closeBtnStyle}><X size={20} /></button>
                        </div>
                        <div style={{ padding: '1.5rem', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                            {selectedModalContent}
                        </div>
                        <div style={{ padding: '1rem', textAlign: 'right', borderTop: '1px solid var(--border-light)' }}>
                            <button className="btn-primary" onClick={() => setSelectedModalContent(null)}>Kapat</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

// Helpers
const getTypeColor = (type) => {
    switch (type) {
        case 'TEAM_REQUEST': return 'rgba(59, 130, 246, 0.2)'; // Blue
        case 'TEAM_RESPONSE': return 'rgba(16, 185, 129, 0.2)'; // Green
        default: return 'rgba(255, 255, 255, 0.1)'; // Gray
    }
};

const getTypeIcon = (type) => {
    switch (type) {
        case 'TEAM_REQUEST': return <Info size={20} color="#3b82f6" />;
        case 'TEAM_RESPONSE': return <Check size={20} color="#10b981" />;
        default: return <Bell size={20} color="var(--text-muted)" />;
    }
};

// Styles
const overlayStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 2000,
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
};
const modalStyle = {
    backgroundColor: 'var(--bg-secondary)', borderRadius: '16px',
    width: '100%', maxWidth: '500px', overflow: 'hidden'
};
const modalHeaderStyle = {
    padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-light)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    fontWeight: 600
};
const closeBtnStyle = { background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' };

export default Notifications;
