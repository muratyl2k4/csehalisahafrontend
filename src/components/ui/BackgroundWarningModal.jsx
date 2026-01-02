import Modal from './Modal';

const BackgroundWarningModal = ({ isOpen, onClose, onConfirm }) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="⚠️ Önemli Uyarı"
        >
            <div style={{ textAlign: 'center', padding: '1rem' }}>
                <p style={{ marginBottom: '1rem', fontSize: '1.1rem', color: '#ff4444', fontWeight: 'bold' }}>
                    Lütfen Dikkat!
                </p>
                <p style={{ marginBottom: '1rem', lineHeight: '1.5', color: 'var(--text-primary)' }}>
                    Yükleyeceğiniz fotoğrafın arka planı <span style={{ fontWeight: 'bold', textDecoration: 'underline' }}>mutlaka temizlenmiş olmalıdır.</span>
                </p>
                <p style={{ marginBottom: '1.5rem', lineHeight: '1.5', color: 'var(--text-muted)' }}>

                    Profesyonel bir görünüm için lütfen aşağıdaki siteyi kullanın:
                </p>

                <a
                    href="https://www.remove.bg/upload"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                    style={{
                        display: 'inline-block',
                        textDecoration: 'none',
                        marginBottom: '1.5rem',
                        padding: '0.75rem 1.5rem'
                    }}
                >
                    remove.bg Sitesine Git ↗
                </a>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <button
                        className="btn-secondary"
                        onClick={onConfirm}
                        style={{ width: '100%', justifyContent: 'center' }}
                    >
                        Anladım, Yüklemeye Devam Et
                    </button>

                    <button
                        className="btn-ghost"
                        onClick={onClose}
                        style={{ width: '100%', justifyContent: 'center', color: 'var(--text-muted)' }}
                    >
                        İptal
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default BackgroundWarningModal;
