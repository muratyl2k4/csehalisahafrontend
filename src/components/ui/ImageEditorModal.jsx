import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X, Check } from 'lucide-react';
import getCroppedImg from '../../utils/cropImage';
import '../../styles/main.css';

const ImageEditorModal = ({ isOpen, onClose, imageSrc, onSave, circularCrop = false }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [loading, setLoading] = useState(false);

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleSave = async () => {
        setLoading(true);
        try {
            const croppedImage = await getCroppedImg(
                imageSrc,
                croppedAreaPixels,
                rotation
            );
            await onSave(croppedImage);
            onClose();
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={overlayStyle}>
            <div style={modalStyle}>
                <div style={headerStyle}>
                    <h3 style={{ margin: 0 }}>Fotoğrafı Düzenle</h3>
                    <button onClick={onClose} style={closeBtnStyle}>
                        <X size={24} />
                    </button>
                </div>

                <div style={cropContainerStyle}>
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={1} // 1:1 for profile pictures
                        onCropChange={setCrop}
                        onCropComplete={onCropComplete}
                        onZoomChange={setZoom}
                        cropShape={circularCrop ? 'round' : 'rect'}
                        showGrid={false}
                    />
                </div>

                <div style={controlsStyle}>
                    <div style={sliderContainerStyle}>
                        <label>Yakınlaştır ({Math.round((zoom - 1) * 10)})</label>
                        <input
                            type="range"
                            value={(zoom - 1) * 10} // Map 1-11 zoom to 0-100 slider? 
                            // Wait, if zoom range is 1 to 11 (range of 10), then (zoom-1)*10 -> 0 to 100.
                            // Let's use 1 to 11 to make math easy: max zoom 11.
                            min={0}
                            max={100}
                            step={1}
                            aria-labelledby="Zoom"
                            onChange={(e) => {
                                const sliderVal = Number(e.target.value);
                                const newZoom = 1 + (sliderVal / 10);
                                setZoom(newZoom);
                            }}
                            className="zoom-range"
                        />
                    </div>

                    <button
                        onClick={handleSave}
                        className="btn-primary"
                        disabled={loading}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    >
                        {loading ? 'İşleniyor...' : (
                            <>
                                <Check size={20} />
                                Kaydet ve Yükle
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Styles
const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem'
};

const modalStyle = {
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '500px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '90vh'
};

const headerStyle = {
    padding: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid var(--border-light)'
};

const closeBtnStyle = {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '0.25rem',
    display: 'flex',
    alignItems: 'center'
};

const cropContainerStyle = {
    position: 'relative',
    width: '100%',
    height: '300px',
    background: '#333'
};

const controlsStyle = {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
};

const sliderContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    color: 'var(--text-primary)',
    fontWeight: 500
};

export default ImageEditorModal;
