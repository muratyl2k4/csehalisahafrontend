import '../../styles/fifa-card.css';

function FifaCard({ player, small = false }) {
    if (!player) return null;

    // Player photo URL
    const playerPhoto = player.photo && !player.photo.startsWith('http')
        ? `http://127.0.0.1:8000/media/${player.photo}`
        : (player.photo || '/2.png');

    return (
        <div className="ucl-card">
            {/* Oyuncu Fotoğrafı */}
            <div className="player-container">
                <img src={playerPhoto} alt={player.name} className="player-photo" />
            </div>

            {/* Sol Üst: Rating ve Pozisyon */}
            <div className="top-info">
                <div className="rating">{player.overall}</div>
                <div className="position">{player.position}</div>
            </div>

            {/* Alt Bilgiler */}
            <div className="bottom-info">
                {/* Oyuncu İsmi */}
                <div className="name-section">
                    <h1>{player.name}</h1>
                </div>

                {/* İstatistikler */}
                <div className="stats-grid">
                    <div className="s-box">
                        <span className="lbl">PAC</span>
                        <span className="val">{player.pace}</span>
                    </div>
                    <div className="s-box">
                        <span className="lbl">SHO</span>
                        <span className="val">{player.shooting}</span>
                    </div>
                    <div className="s-box">
                        <span className="lbl">PAS</span>
                        <span className="val">{player.passing}</span>
                    </div>
                    <div className="s-box">
                        <span className="lbl">DRI</span>
                        <span className="val">{player.dribbling}</span>
                    </div>
                    <div className="s-box">
                        <span className="lbl">DEF</span>
                        <span className="val">{player.defense}</span>
                    </div>
                    <div className="s-box">
                        <span className="lbl">PHY</span>
                        <span className="val">{player.physical}</span>
                    </div>
                </div>

                {/* Logolar */}
                <div className="logos">
                    <img src="https://flagcdn.com/w40/tr.png" alt="Türkiye" className="logo-img" />
                </div>
            </div>
        </div>
    );
}

export default FifaCard;
