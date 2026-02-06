import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 20000,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

// Request Interceptor: Attach Token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 & Refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response && error.response.status === 401 && !originalRequest._retry) {

            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers['Authorization'] = 'Bearer ' + token;
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = localStorage.getItem('refresh_token');

            if (!refreshToken) {
                clearTokens();
                window.location.href = '/login';
                return Promise.reject(error);
            }

            try {
                // Determine URL relative to baseURL or just use absolute path logic if needed
                // Since api has baseURL, calls are relative.
                // refresh endpoint: /auth/refresh/ (based on previous check)

                // We create a fresh axios instance to avoid interceptor loop if refresh fails with 401
                const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
                    refresh: refreshToken
                });

                if (response.status === 200) {
                    const { access } = response.data;
                    localStorage.setItem('access_token', access);

                    // SimpleJWT refresh view might return new refresh token depending on settings 
                    // (ROTATE_REFRESH_TOKENS). If so, update it.
                    if (response.data.refresh) {
                        localStorage.setItem('refresh_token', response.data.refresh);
                    }

                    api.defaults.headers.common['Authorization'] = 'Bearer ' + access;
                    originalRequest.headers['Authorization'] = 'Bearer ' + access;

                    processQueue(null, access);
                    return api(originalRequest);
                }
            } catch (err) {
                processQueue(err, null);
                console.warn("Token refresh failed. Logging out.");
                clearTokens();
                localStorage.removeItem('user_info');
                window.location.href = '/login';
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

// Auth Helpers
export const setTokens = (access, refresh) => {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
};

export const clearTokens = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
};

export const isAuthenticated = () => {
    return !!localStorage.getItem('access_token');
};

// Auth Actions
export const register = async (formData) => {
    // Multipart form data support for image upload
    const response = await api.post('/auth/register/', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const verifyEmail = async (data) => {
    const response = await api.post('/players/verify-email/', data);
    return response.data;
};


export const resendVerificationCode = async (data) => {
    const response = await api.post('/players/resend-code/', data);
    return response.data;
};

export const forgotPassword = async (data) => {
    const response = await api.post('/players/forgot-password/', data);
    return response.data;
};

export const verifyForgotPasswordCode = async (data) => {
    const response = await api.post('/players/verify-forgot-password-code/', data);
    return response.data;
};

export const resetPassword = async (data) => {
    const response = await api.post('/players/reset-password/', data);
    return response.data;
};



export const logout = () => {
    clearTokens();
    window.location.href = '/'; // Redirect to home
};

// Helper to extract results from paginated response
const handleResponse = (response) => {
    return response.data.results || response.data;
};

// Teams
export const getTeams = async (params = {}) => {
    const { page } = params;
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/teams/${queryString ? `?${queryString}` : ''}`);

    // Check if it's a paginated response AND page was requested
    if (page || response.data.results) {
        return response.data;
    }
    return handleResponse(response);
};

export const createTeam = async (formData) => {
    const response = await api.post('/teams/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

export const updateTeam = async (id, data) => {
    // Determine content type (Multipart if photo exists in data, otherwise JSON)
    const isFormData = data instanceof FormData;
    const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};

    const response = await api.patch(`/teams/${id}/`, data, config);
    return response.data;
};

export const getTeam = async (id) => {
    const response = await api.get(`/teams/${id}/`);
    return response.data;
};

// ... existing code ...

export const login = async (credentials) => {
    const response = await api.post('/auth/login/', credentials);
    if (response.data.access) {
        setTokens(response.data.access, response.data.refresh);
        // Store User Info (Name, TeamID, Photo)
        const userInfo = {
            name: response.data.name,
            id: response.data.id,
            teamId: response.data.current_team,
            photo: response.data.photo,
            is_email_verified: response.data.is_email_verified,
            is_staff: response.data.is_staff // Store admin status
        };
        localStorage.setItem('user_info', JSON.stringify(userInfo));
    }
    return response.data;
};

export const getTopTeams = async () => {
    const response = await api.get('/teams/top/');
    return response.data;
};

// Players
export const getPlayers = async (params = {}) => {
    // If explicit page param is passed, return full response (for pagination metadata)
    // Otherwise return results array (for backward compatibility)
    const { page } = params;
    const queryString = new URLSearchParams(params).toString();
    const url = `/players/${queryString ? `?${queryString}` : ''}`;

    const response = await api.get(url);

    // Check if it's a paginated response (has count/results) AND page was requested
    if (page || response.data.results) {
        return response.data; // Return full object: { count, next, previous, results: [...] }
    }
    return handleResponse(response);
};

export const getTopPlayers = async () => {
    const response = await api.get('/players/?limit=5');
    return handleResponse(response);
};

// Profile Update
export const updateProfile = async (data) => {
    // Determine content type (Multipart if photo exists in data, otherwise JSON)
    const isFormData = data instanceof FormData;
    const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};

    // Using PATCH for partial updates
    const response = await api.patch('/players/me/', data, config);

    // Update local storage user info
    const currentUser = JSON.parse(localStorage.getItem('user_info') || '{}');
    const updatedUser = {
        ...currentUser,
        name: response.data.name,
        photo: response.data.photo,
        is_email_verified: response.data.is_email_verified // Important: Update verification status
    };
    localStorage.setItem('user_info', JSON.stringify(updatedUser));

    return response.data;
};

export const getPlayer = async (id) => {
    const response = await api.get(`/players/${id}/`);
    return response.data;
};

export const getGoalLeaderboard = async () => {
    const response = await api.get('/players/leaderboard/goals/');
    return handleResponse(response);
};

export const getAssistLeaderboard = async () => {
    const response = await api.get('/players/leaderboard/assists/');
    return handleResponse(response);
};

// Matches
export const getMatches = async (params = {}) => {
    // params allow filtering by week, league, etc.
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/matches/${queryString ? `?${queryString}` : ''}`);
    return handleResponse(response);
};

// Leagues
export const getLeagues = async () => {
    const response = await api.get('/leagues/');
    return handleResponse(response);
};

export const getWeeks = async (leagueId) => {
    const response = await api.get(`/leagues/weeks/?league=${leagueId}`);
    return handleResponse(response);
};

export const getStandings = async (params) => {
    let queryString = '';
    if (typeof params === 'object') {
        queryString = new URLSearchParams(params).toString();
    } else {
        queryString = `league=${params}`;
    }
    const response = await api.get(`/leagues/standings/?${queryString}`);
    return handleResponse(response);
};



export const getMatch = async (id) => {
    const response = await api.get(`/matches/${id}/`);
    return response.data;
};

export const getRecentMatches = async () => {
    const response = await api.get('/matches/recent/');
    return response.data;
};

export const getTeamMatches = async (teamId) => {
    const response = await api.get(`/matches/?team=${teamId}`);
    return handleResponse(response);
};

export const joinTeam = async (teamId) => {
    const token = localStorage.getItem('access_token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.post(`/teams/${teamId}/join/`, {}, { headers });
    return response.data;
};

export const leaveTeam = async () => {
    const response = await api.post('/teams/leave/');
    return response.data;
};

export const respondToRequest = async (requestId, action) => {
    const response = await api.post(`/teams/requests/${requestId}/respond/`, { action });
    return response.data;
};

// Notifications
export const getNotifications = async () => {
    const response = await api.get('/notifications/');
    return handleResponse(response);
};

export const getUnreadNotificationCount = async () => {
    const response = await api.get('/notifications/unread_count/');
    return response.data.count;
};

export const markNotificationRead = async (id) => {
    const response = await api.post(`/notifications/${id}/mark_read/`);
    return response.data;
};


export const sendBroadcastNotification = async (message, title = 'Duyuru', target = 'users', username = null) => {
    const response = await api.post('/notifications/broadcast/', { message, title, target, username });
    return response.data;
};

export const markAllNotificationsRead = async () => {
    const response = await api.post('/notifications/mark_all_read/');
    return response.data;
};

export const refreshUserInfo = async () => {
    try {
        const response = await api.get('/players/me/');
        const data = response.data;

        // User data from 'me' endpoint might rely on serialized fields.
        // We need to ensure 'is_staff' comes from somewhere.
        // Standard PlayerDetailSerializer usually maps to Player model, not User directly for is_staff, logic might differ.
        // Let's assume for now we rely on login for is_staff or we need to add it to PlayerDetailSerializer if we want it on refresh.
        // Actually, let's keep it simple: We save what we have. 
        // If check fails, user re-logins.

        const currentUser = JSON.parse(localStorage.getItem('user_info') || '{}');

        // Update User Info
        const userInfo = {
            ...currentUser, // Keep existing fields like is_staff if not returned by refresh
            name: data.name,
            id: data.id,
            teamId: data.current_team,
            photo: data.photo,
            is_email_verified: data.is_email_verified
        };
        localStorage.setItem('user_info', JSON.stringify(userInfo));
        return userInfo;
    } catch (error) {
        console.error("Failed to refresh user info", error);
        return null;
    }
};

export default api;
