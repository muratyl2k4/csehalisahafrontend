import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Trophy, Swords, BarChart3, Menu, X, User, LogIn, LogOut, Search, Bell, Moon, Shirt } from 'lucide-react';
import { isAuthenticated, logout, getUnreadNotificationCount } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import './Navbar.css';

function Navbar() {
    const { theme, toggleTheme } = useTheme();

    // Debugging Theme
    console.log("Current Theme:", theme);

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [loggedIn, setLoggedIn] = useState(isAuthenticated());
    const [unreadCount, setUnreadCount] = useState(0);
    const location = useLocation();

    useEffect(() => {
        setLoggedIn(isAuthenticated());

        if (isAuthenticated()) {
            fetchUnreadCount();
        }
    }, [location]);

    const fetchUnreadCount = async () => {
        try {
            const count = await getUnreadNotificationCount();
            setUnreadCount(count);
        } catch (error) {
            console.error("Failed to fetch notifications count", error);
        }
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <nav className="navbar">
            <div className="nav-container">
                <Link to="/" className="nav-logo" onClick={closeMenu}>
                    <img src="/logo11.png" alt="CSE-LİG Logo" style={{ height: '50px', width: 'auto', objectFit: 'contain' }} />
                    <span className="logo-text">CSE-LİG</span>
                </Link>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {/* Always Visible Notification Bell (Mobile & Desktop) */}
                    {loggedIn && (
                        <Link
                            to="/notifications"
                            style={{ position: 'relative', display: 'flex', alignItems: 'center', color: 'white', textDecoration: 'none' }}
                        >
                            <Bell size={24} />
                            {unreadCount > 0 && (
                                <span style={{
                                    position: 'absolute',
                                    top: '-6px',
                                    right: '-6px',
                                    backgroundColor: '#ef4444',
                                    color: 'white',
                                    fontSize: '0.7rem',
                                    fontWeight: 'bold',
                                    minWidth: '18px',
                                    height: '18px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '2px solid var(--primary-dark)', // Border to separate from background
                                    padding: '2px'
                                }}>
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </Link>
                    )}

                    {/* Theme Toggle */}
                    {/* Theme Switch */}
                    <div
                        onClick={toggleTheme}
                        style={{
                            width: '42px',
                            height: '22px',
                            background: theme === 'pitch' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(30, 41, 59, 0.6)',
                            borderRadius: '99px',
                            border: theme === 'pitch' ? '1px solid #10b981' : '1px solid #475569',
                            position: 'relative',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            transition: 'all 0.3s ease',
                            marginRight: '0.5rem'
                        }}
                        title="Tema Değiştir"
                    >
                        <div style={{
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            background: theme === 'pitch' ? '#10b981' : '#94a3b8',
                            position: 'absolute',
                            left: theme === 'pitch' ? '22px' : '3px',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                        }} />
                    </div>

                    <button
                        className={`hamburger ${isMenuOpen ? 'active' : ''}`}
                        onClick={toggleMenu}
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

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
                            to="/search"
                            className={`nav-link ${isActive('/search') ? 'active' : ''}`}
                            onClick={closeMenu}
                        >
                            <Search size={20} />
                            <span>Ara</span>
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
                            <Link
                                to="/profile"
                                className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
                                onClick={closeMenu}
                            >
                                <User size={20} />
                                <span>Profil</span>
                            </Link>
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
            </div >
        </nav >
    );
}

export default Navbar;
