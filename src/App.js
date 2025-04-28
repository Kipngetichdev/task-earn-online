import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';
import theme from './styles/theme';
import Navbar from './components/Navbar';
import InstallPrompt from './components/InstallPrompt';
import Home from './pages/Home';
import Landing from './pages/Landing';
import Rewards from './pages/Rewards';
import Wallet from './pages/Wallet';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }
  return user ? children : <Navigate to="/login" />;
}

// Landing route with redirect for logged-in users
function LandingRoute() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }
  return user ? <Navigate to="/home" /> : <Landing />;
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <TaskProvider>
          <Router>
            <Routes>
              <Route path="/" element={<LandingRoute />} />
              <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/rewards" element={<ProtectedRoute><Rewards /></ProtectedRoute>} />
              <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              {/* Catch-all route */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
            <Navbar />
            <InstallPrompt />
          </Router>
        </TaskProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;