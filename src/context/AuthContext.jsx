import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api'; // Import api to fetch updated user info

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('access_token');
            const userInfo = localStorage.getItem('user_info');

            if (token && userInfo) {
                try {
                    const parsedUser = JSON.parse(userInfo);
                    setUser(parsedUser);

                    // AUTO-FIX: If user_id is missing (old session), fetch it from backend
                    if (!parsedUser.user_id) {
                        try {
                            const response = await api.get('/players/me/');
                            const updatedUser = {
                                ...parsedUser,
                                user_id: response.data.user_id, // Get the missing ID
                                id: response.data.id // Ensure Player ID is also consistent
                            };

                            localStorage.setItem('user_info', JSON.stringify(updatedUser));
                            setUser(updatedUser);
                        } catch (refreshErr) {
                            console.error("Failed to refresh session details", refreshErr);
                            // Continue with old session, better than nothing
                        }
                    }

                } catch (e) {
                    console.error("Failed to parse user info, clearing session.", e);
                    localStorage.clear();
                    setUser(null);
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const login = (userData, token, refreshToken) => {
        localStorage.setItem('access_token', token);
        localStorage.setItem('refresh_token', refreshToken);
        localStorage.setItem('user_info', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_info');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
