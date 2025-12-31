import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://muratyl2k4.pythonanywhere.com/api/';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
});

// Request Interceptor: Attach Token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
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



export const logout = () => {
    clearTokens();
    window.location.href = '/'; // Redirect to home
};

// Helper to extract results from paginated response
const handleResponse = (response) => {
    return response.data.results || response.data;
};

// Teams
export const getTeams = async () => {
    const response = await api.get('/teams/');
    return handleResponse(response);
};

export const createTeam = async (formData) => {
    const response = await api.post('/teams/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
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
            photo: response.data.photo
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
export const getPlayers = async () => {
    const response = await api.get('/players/');
    return handleResponse(response);
};

export const getTopPlayers = async () => {
    const response = await api.get('/players/?limit=5');
    return handleResponse(response);
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
export const getMatches = async () => {
    const response = await api.get('/matches/');
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

export const respondToRequest = async (requestId, action) => {
    const response = await api.post(`/teams/requests/${requestId}/respond/`, { action });
    return response.data;
};

export default api;
