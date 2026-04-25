import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Plus, Clock, X, Upload } from 'lucide-react';
import api from '../services/api';
import '../styles/NewsPage.css';

const NewsFormModal = ({ isOpen, onClose, onNewsAdded }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [photo, setPhoto] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhoto(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        if (photo) {
            formData.append('photo', photo);
        }

        try {
            const res = await api.post('/news/', formData);
            onNewsAdded(res.data);
            setTitle('');
            setContent('');
            setPhoto(null);
            setPreview(null);
            onClose();
        } catch (err) {
            setError('Haber eklenirken bir hata oluştu.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="news-modal-overlay">
            <div className="news-modal-content">
                <div className="news-modal-header">
                    <h3>Yeni Haber Ekle</h3>
                    <button onClick={onClose} className="close-btn">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="news-modal-body custom-scrollbar">
                    {error && (
                        <div className="error-alert">
                            {error}
                        </div>
                    )}
                    
                    <form id="news-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Başlık</label>
                            <input 
                                type="text"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="form-input"
                                placeholder="Haber başlığı..."
                            />
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label">Fotoğraf (Opsiyonel)</label>
                            <div className="image-upload-container">
                                {preview ? (
                                    <div className="image-preview-wrapper">
                                        <img src={preview} alt="Preview" className="image-preview" />
                                        <button 
                                            type="button"
                                            onClick={() => { setPhoto(null); setPreview(null); }}
                                            className="remove-image-btn"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="image-upload-area" onClick={() => document.getElementById('file-upload').click()}>
                                        <Upload className="upload-icon" size={32} />
                                        <div className="upload-text">
                                            <span className="upload-link">Dosya Seç</span> veya sürükle bırak
                                        </div>
                                        <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: 'var(--text-muted)' }}>
                                            PNG, JPG, GIF (Max 5MB)
                                        </p>
                                        <input id="file-upload" type="file" style={{ display: 'none' }} accept="image/*" onChange={handlePhotoChange} />
                                    </div>
                                )}
                            </div>
                        </div>
 
                        <div className="form-group">
                            <label className="form-label">Açıklama</label>
                            <textarea 
                                required
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                rows={6}
                                className="form-textarea custom-scrollbar"
                                placeholder="Haber detaylarını buraya yazın..."
                            />
                        </div>
                    </form>
                </div>
                
                <div className="news-modal-footer">
                    <button 
                        type="button" 
                        onClick={onClose}
                        className="btn-cancel"
                        disabled={loading}
                    >
                        İptal
                    </button>
                    <button 
                        type="submit" 
                        form="news-form"
                        disabled={loading}
                        className="btn-publish"
                    >
                        {loading ? (
                            <>
                                <div className="spinner-sm" />
                                Ekleniyor...
                            </>
                        ) : (
                            'Haberi Yayınla'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function NewsPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        try {
            const res = await api.get('/news/');
            setNews(res.data.results || res.data);
        } catch (error) {
            console.error("Haberler yüklenemedi:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleNewsAdded = (newNewsItem) => {
        setNews([newNewsItem, ...news]);
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' };
        return new Date(dateString).toLocaleDateString('tr-TR', options);
    };

    if (loading) {
        return (
            <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ textAlign: 'left', margin: 0 }}>HABERLER</h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Ligten en son gelişmeler ve duyurular</p>
                </div>
                {(user?.is_staff || user?.is_superuser) && (
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="btn-publish"
                    >
                        <Plus size={20} />
                        Haber Ekle
                    </button>
                )}
            </div>

            {news.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
                    <p style={{ color: 'var(--text-muted)' }}>Henüz haber bulunmuyor.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
                    {news.map((item) => (
                        <div 
                            key={item.id} 
                            className="card" 
                            style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
                            onClick={() => navigate(`/news/${item.id}`)}
                        >
                            {item.photo && (
                                <div style={{ height: '200px', width: '100%', overflow: 'hidden' }}>
                                    <img 
                                        src={item.photo} 
                                        alt={item.title} 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                    />
                                </div>
                            )}
                            <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <Clock size={14} />
                                        {formatDate(item.created_at)}
                                    </span>
                                </div>
                                <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', lineHeight: '1.4' }}>{item.title}</h2>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {item.content}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <NewsFormModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onNewsAdded={handleNewsAdded}
            />
        </div>
    );
}
