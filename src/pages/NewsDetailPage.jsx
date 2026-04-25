import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Clock } from 'lucide-react';
import api from '../services/api';
import '../styles/NewsPage.css';

export default function NewsDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [news, setNews] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNewsDetail = async () => {
            try {
                const res = await api.get(`/news/${id}/`);
                setNews(res.data);
            } catch (err) {
                console.error("Haber detayı yüklenemedi:", err);
                setError("Haber bulunamadı veya bir hata oluştu.");
            } finally {
                setLoading(false);
            }
        };

        fetchNewsDetail();
    }, [id]);

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('tr-TR', options);
    };

    if (loading) {
        return (
            <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    if (error || !news) {
        return (
            <div className="container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
                <div className="card">
                    <h2 style={{ color: '#ef4444' }}>Hata</h2>
                    <p style={{ color: 'var(--text-muted)', margin: '1rem 0 2rem' }}>{error || 'Haber bulunamadı.'}</p>
                    <button className="btn-publish" onClick={() => navigate('/news')}>
                        Haberlere Dön
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="news-detail-container">
            <div className="back-link" onClick={() => navigate('/news')}>
                <ChevronLeft size={20} />
                <span>Haberlere Dön</span>
            </div>

            <article className="news-article">
                <header className="news-article-header">
                    <div className="news-article-meta">
                        <div className="news-article-meta-item">
                            <Clock size={16} className="text-primary" />
                            <span>{formatDate(news.created_at)}</span>
                        </div>
                    </div>
                    <h1 className="news-article-title">{news.title}</h1>
                </header>

                {news.photo && (
                    <div className="news-article-image-wrapper">
                        <img src={news.photo} alt={news.title} className="news-article-image" />
                    </div>
                )}

                <div className="news-article-content">
                    {news.content}
                </div>
            </article>
        </div>
    );
}
