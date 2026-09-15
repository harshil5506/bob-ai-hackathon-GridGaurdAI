import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Dashboard } from './views/Dashboard';
import { AssetDetail } from './views/AssetDetail';
import { Predict } from './views/Predict';
import { Assets } from './views/Assets';
import { AiSimulator } from './views/AiSimulator';
import { Weather } from './views/Weather';
import { Ai } from './views/Ai';
import { Crew } from './views/Crew';
import { SignIn } from './views/SignIn';
import { SignUp } from './views/SignUp';
import { ForgotPassword } from './views/ForgotPassword';
import { Profile } from './views/Profile';
import { AnimatedBackground } from './components/AnimatedBackground';
import { getCurrentlyLoggedInUser, logoutUser, UserProfile } from './services/authService';
import { Zap, User, LogOut } from 'lucide-react';

function TopHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;
  const isAuthPage = path === '/signin' || path === '/login' || path === '/signup' || path === '/forgot-password';
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    setCurrentUser(getCurrentlyLoggedInUser());
  }, [location.pathname]);

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    navigate('/signin');
  };

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        background: 'linear-gradient(180deg, rgba(2, 6, 17, 0.95) 0%, rgba(2, 6, 17, 0.6) 100%)',
        borderBottom: '1px solid rgba(0, 243, 255, 0.25)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
        zIndex: 60,
        backdropFilter: 'blur(10px)',
        fontFamily: "'Share Tech Mono', monospace"
      }}
    >
      <Link
        to="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          textDecoration: 'none',
          color: 'var(--text-primary)'
        }}
      >
        <Zap size={22} className="text-cyan" style={{ filter: 'drop-shadow(0 0 8px #00f3ff)' }} />
        <span style={{ fontSize: '1.2rem', fontWeight: 'bold', letterSpacing: '0.12em' }}>
          GRIDGUARD <span style={{ color: 'var(--accent-cyan)' }}>AI</span>
        </span>
        <span
          style={{
            fontSize: '0.65rem',
            background: 'rgba(0, 243, 255, 0.12)',
            border: '1px solid rgba(0, 243, 255, 0.4)',
            color: 'var(--accent-cyan)',
            padding: '2px 6px',
            borderRadius: '4px',
            letterSpacing: '0.08em'
          }}
        >
          SCADA ONLINE
        </span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {isAuthPage ? (
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              background: 'rgba(0, 243, 255, 0.12)',
              border: '1px solid var(--accent-cyan)',
              color: 'var(--accent-cyan)',
              textDecoration: 'none',
              fontSize: '0.85rem',
              letterSpacing: '0.08em',
              transition: 'all 0.2s'
            }}
          >
            <span>RETURN TO GRID DASHBOARD ➔</span>
          </Link>
        ) : currentUser ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link
              to="/profile"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '5px 12px',
                background: 'rgba(10, 25, 50, 0.85)',
                border: '1px solid var(--accent-cyan)',
                color: 'var(--text-primary)',
                textDecoration: 'none',
                fontSize: '0.82rem',
                letterSpacing: '0.06em',
                transition: 'all 0.2s',
                boxShadow: '0 0 10px rgba(0, 243, 255, 0.2)'
              }}
            >
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: 'rgba(0, 243, 255, 0.2)',
                  border: '1px solid var(--accent-cyan)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <User size={12} className="text-cyan" />
              </div>
              <span>{currentUser.name.toUpperCase()}</span>
              <span
                style={{
                  fontSize: '0.65rem',
                  padding: '1px 5px',
                  background: 'rgba(0, 243, 255, 0.15)',
                  border: '1px solid var(--accent-cyan)',
                  color: 'var(--accent-cyan)',
                  borderRadius: '2px'
                }}
              >
                {currentUser.clearanceLevel === 'level3'
                  ? 'LVL 3 CHIEF'
                  : currentUser.clearanceLevel === 'level2'
                  ? 'LVL 2 DISPATCH'
                  : 'LVL 1 MONITOR'}
              </span>
            </Link>

            <button
              onClick={handleLogout}
              title="End SCADA Session"
              style={{
                background: 'rgba(255, 51, 51, 0.12)',
                border: '1px solid rgba(255, 51, 51, 0.4)',
                color: 'var(--accent-red)',
                padding: '5px 9px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontFamily: 'inherit',
                fontSize: '0.78rem'
              }}
            >
              <LogOut size={13} />
              <span>LOGOUT</span>
            </button>
          </div>
        ) : (
          <Link
            to="/signin"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              background: 'rgba(10, 25, 50, 0.8)',
              border: '1px solid rgba(0, 243, 255, 0.4)',
              color: 'var(--accent-cyan)',
              textDecoration: 'none',
              fontSize: '0.85rem',
              letterSpacing: '0.08em',
              transition: 'all 0.2s',
              boxShadow: '0 0 12px rgba(0, 243, 255, 0.15)'
            }}
          >
            <User size={15} />
            <span>OPERATOR SIGN IN</span>
          </Link>
        )}
      </div>
    </header>
  );
}

function NavLinks() {
  const location = useLocation();
  const path = location.pathname;
  const navigate = useNavigate();

  // Hide bottom nav on authentication pages for a focused login experience
  const isAuthPage = path === '/signin' || path === '/login' || path === '/signup' || path === '/forgot-password';
  if (isAuthPage) return null;

  return (
    <nav className="hud-bottom-nav">
      <div className="nav-bar-container">
        <Link to="/" className={`nav-link ${path === '/' ? 'active' : ''}`}>GRID</Link>
        <Link to="/predict" className={`nav-link ${path === '/predict' ? 'active' : ''}`}>PREDICT</Link>
        <Link to="/assets" className={`nav-link ${path.includes('/asset') ? 'active' : ''}`}>ASSETS</Link>
        
        <button className="run-sim-btn" onClick={() => navigate('/simulate')}>RUN AI SIMULATION</button>
        
        <Link to="/weather" className={`nav-link ${path === '/weather' ? 'active' : ''}`}>WEATHER</Link>
        <Link to="/ai" className={`nav-link ${path === '/ai' ? 'active' : ''}`}>AI</Link>
        <Link to="/crew" className={`nav-link ${path === '/crew' ? 'active' : ''}`}>CREW</Link>
      </div>
    </nav>
  );
}

function MainContent() {
  const location = useLocation();
  const isAuthPage =
    location.pathname === '/signin' ||
    location.pathname === '/login' ||
    location.pathname === '/signup' ||
    location.pathname === '/forgot-password';

  return (
    <div className="app-container">
      {!isAuthPage && <AnimatedBackground />}
      <TopHeader />
      <main className="app-main" style={{ paddingTop: isAuthPage ? '0' : '4rem' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/predict" element={<Predict />} />
          <Route path="/assets" element={<Assets />} />
          <Route path="/simulate" element={<AiSimulator />} />
          <Route path="/weather" element={<Weather />} />
          <Route path="/ai" element={<Ai />} />
          <Route path="/crew" element={<Crew />} />
          <Route path="/asset/:id" element={<AssetDetail />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/login" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
      <NavLinks />
    </div>
  );
}

const App: React.FC = () => {
  return (
    <Router>
      <MainContent />
    </Router>
  );
};

export default App;
