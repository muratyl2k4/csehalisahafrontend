import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import ScrollToTop from './components/layout/ScrollToTop';
import Home from './pages/Home';
import Teams from './pages/Teams';
import TeamDetail from './pages/TeamDetail';
import TeamRequests from './pages/TeamRequests';
import Players from './pages/Players';
import PlayerDetail from './pages/PlayerDetail';
import Matches from './pages/Matches';
import MatchDetail from './pages/MatchDetail';

import Leaderboard from './pages/Leaderboard';
import SearchPage from './pages/SearchPage';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile'; // Import Profile
import ProfileEdit from './pages/ProfileEdit';
import Register from './pages/Register';
import Login from './pages/Login';
import CreateTeam from './pages/CreateTeam';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import { ToastProvider } from './context/ToastContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import './styles/main.css';

// Global Verification Check Component
const VerificationEnforcer = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      // Check if user is verified
      // We assume user_info is updated upon login/refresh
      const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');

      // If we have verification status in userInfo (we generally should after login update)
      // But if it's missing (old login), we might need to fetch or just let them pass until next refresh.
      // Let's rely on 'is_email_verified' being present. 
      // NOTE: The 'login' response now includes it, but we need to make sure 'user_info' stores it.
      // We need to check if 'login' function in api.js stores it! (It currently does NOT store extra fields automatically)
      // So we'll need to update api.js login function first to store keys.

      // Wait, I updated the serializer but I might not have updated the front-end login function to SAVE that new field.
      // I should check api.js login function.

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
  return (
    <ToastProvider>
      <Router>
        <VerificationEnforcer>
          <ScrollToTop />
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/create-team" element={<CreateTeam />} />
            <Route path="/search" element={<SearchPage />} />
            {/* Teams list route removed, redirected to search */}
            <Route path="/teams/:id" element={<TeamDetail />} />
            <Route path="/teams/:id/requests" element={<TeamRequests />} />
            {/* Players list route removed, redirected to search */}
            <Route path="/players/:id" element={<PlayerDetail />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/edit" element={<ProfileEdit />} />
            <Route path="/matches" element={<Matches />} />
            <Route path="/matches/:id" element={<MatchDetail />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Routes>
        </VerificationEnforcer>
      </Router>
    </ToastProvider>
  );
}

export default App;
