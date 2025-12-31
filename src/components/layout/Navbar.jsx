import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Trophy, Swords, BarChart3, Menu, X, User, LogIn, LogOut } from 'lucide-react';
import { isAuthenticated, logout } from '../../services/api';
import './Navbar.css';

function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [loggedIn, setLoggedIn] = useState(isAuthenticated());
    const location = useLocation();

    useEffect(() => {
        setLoggedIn(isAuthenticated());
    }, [location]); // Re-check on route change (e.g. after login redirect)

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    const handleLogout = () => {
        logout();
        setLoggedIn(false);
        closeMenu();
    };

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <nav className="navbar">
            <div className="nav-container">
                <Link to="/" className="nav-logo" onClick={closeMenu}>
                    <Swords size={28} className="logo-icon" />
                    <span className="logo-text">CSE-LİG</span>
                </Link>

                <button
                    className={`hamburger ${isMenuOpen ? 'active' : ''}`}
                    onClick={toggleMenu}
                    aria-label="Toggle menu"
                >
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
                    <li className="nav-item">
                        <Link
                            to="/"
                            className={`nav-link ${isActive('/') ? 'active' : ''}`}
                            onClick={closeMenu}
                        >
                            <Home size={20} />
                            <span>Ana Sayfa</span>
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link
                            to="/teams"
                            className={`nav-link ${isActive('/teams') ? 'active' : ''}`}
                            onClick={closeMenu}
                        >
                            <Trophy size={20} />
                            <span>Takımlar</span>
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link
                            to="/players"
                            className={`nav-link ${isActive('/players') ? 'active' : ''}`}
                            onClick={closeMenu}
                        >
                            <Users size={20} />
                            <span>Oyuncular</span>
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link
                            to="/matches"
                            className={`nav-link ${isActive('/matches') ? 'active' : ''}`}
                            onClick={closeMenu}
                        >
                            <Swords size={20} />
                            <span>Maçlar</span>
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link
                            to="/leaderboard"
                            className={`nav-link ${isActive('/leaderboard') ? 'active' : ''}`}
                            onClick={closeMenu}
                        >
                            <BarChart3 size={20} />
                            <span>Liderlik</span>
                        </Link>
                    </li>

                    {loggedIn ? (
                        <li className="nav-item">
                            <button
                                onClick={handleLogout}
                                className="nav-link"
                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}
                            >
                                <LogOut size={20} />
                                <span>Çıkış Yap</span>
                            </button>
                        </li>
                    ) : (
                        <li className="nav-item">
                            <Link
                                to="/login"
                                className={`nav-link ${isActive('/login') ? 'active' : ''}`}
                                onClick={closeMenu}
                            >
                                <LogIn size={20} />
                                <span>Giriş Yap</span>
                            </Link>
                        </li>
                    )}
                </ul>
            </div>
        </nav>
    );
}

export default Navbar;
