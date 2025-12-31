import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import Teams from './pages/Teams';
import TeamDetail from './pages/TeamDetail';
import TeamRequests from './pages/TeamRequests';
import Players from './pages/Players';
import PlayerDetail from './pages/PlayerDetail';
import Matches from './pages/Matches';
import MatchDetail from './pages/MatchDetail';

import Leaderboard from './pages/Leaderboard';
import Register from './pages/Register';
import Login from './pages/Login';
import CreateTeam from './pages/CreateTeam';
import { ToastProvider } from './context/ToastContext';
import './styles/main.css';

function App() {
  return (
    <ToastProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/create-team" element={<CreateTeam />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/teams/:id" element={<TeamDetail />} />
          <Route path="/teams/:id/requests" element={<TeamRequests />} />
          <Route path="/players" element={<Players />} />
          <Route path="/players/:id" element={<PlayerDetail />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/matches/:id" element={<MatchDetail />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;
