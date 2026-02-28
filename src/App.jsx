import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import ScrollToTop from './components/layout/ScrollToTop';
import Home from './pages/Home';
import Rules from './pages/Rules';
import Teams from './pages/Teams';
import TeamDetail from './pages/TeamDetail';
import TeamRequests from './pages/TeamRequests';
import Players from './pages/Players';
import PlayerDetail from './pages/PlayerDetail';
import Matches from './pages/Matches';
import MatchDetail from './pages/MatchDetail';
import RefereePage from './pages/RefereePage';
import VotingPage from './pages/VotingPage';

import Leaderboard from './pages/Leaderboard';
import LeaguePage from './pages/LeaguePage';
import NewsPage from './pages/NewsPage';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile'; // Import Profile
import ProfileEdit from './pages/ProfileEdit';
import Register from './pages/Register';
import Login from './pages/Login';
import CreateTeam from './pages/CreateTeam';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { subscribeToPushNotifications } from './utils/pushNotification';
import PWAInstallPrompt from './components/layout/PWAInstallPrompt';
import NotificationPermissionPrompt from './components/layout/NotificationPermissionPrompt';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import './styles/main.css';

// Global Verification Check Component
const VerificationEnforcer = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 1. Bildirim Kaydı (Sadece İZİN VERİLMİŞSE otomatik yenile)
    // iOS'ta "User Gesture" hatası almamak için izin verilmemişse dokunmuyoruz.
    const token = localStorage.getItem('access_token');
    // iOS Safari Render sorunu için try-catch
    try {
      if (token && 'serviceWorker' in navigator && Notification.permission === 'granted') {
        subscribeToPushNotifications().catch(err => console.error("Push sub error:", err));
      }
    } catch (e) {
      console.warn("Safari Push Check Skipped:", e);
    }

    // 2. Email Doğrulama Kontrolü
    if (token) {
      // Check if user is verified
      const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');



      if (userInfo.is_email_verified === false) {
        if (location.pathname !== '/verify-email') {
          navigate('/verify-email');
        }
      } else {
        if (location.pathname === '/verify-email') {
          navigate('/');
        }
      }
    }
  }, [location, navigate]);

  return children;
};

function App() {
  useEffect(() => {
    // Sadece ZATEN İZİN VARSA sessizce aboneliği tazele.
    const attemptAutoSub = async () => {
      try {
        if ('serviceWorker' in navigator && Notification.permission === 'granted') {
          await subscribeToPushNotifications();
        }
      } catch (e) {
        console.log("Auto-sub failed silently:", e);
      }
    };
    attemptAutoSub();
  }, []);

  return (
    <ToastProvider>
      <Router>
        <VerificationEnforcer>
          <ScrollToTop />
          <Navbar />
          <PWAInstallPrompt /> {/* iOS Install Prompt (Install APP) */}
          <NotificationPermissionPrompt /> {/* iOS Permission Prompt (Enable Push) */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/create-team" element={<CreateTeam />} />
            {/* Teams list route removed, redirected to search */}
            <Route path="/teams/:id" element={<TeamDetail />} />
            <Route path="/teams/:id/requests" element={<TeamRequests />} />
            {/* Players list route removed, redirected to search */}
            <Route path="/league" element={<LeaguePage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/players/:id" element={<PlayerDetail />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/edit" element={<ProfileEdit />} />
            <Route path="/matches" element={<Matches />} />
            <Route path="/matches/:id" element={<MatchDetail />} />
            <Route path="/matches/:id/vote" element={<VotingPage />} /> {/* Added route */}
            <Route path="/matches/:id/manage" element={<RefereePage />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/rules" element={<Rules />} />
          </Routes>
        </VerificationEnforcer>
      </Router>
    </ToastProvider>
  );
}

export default App;
