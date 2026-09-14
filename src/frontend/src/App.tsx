import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Dashboard } from './views/Dashboard';
import { AssetDetail } from './views/AssetDetail';
import { Predict } from './views/Predict';
import { Assets } from './views/Assets';
import { AiSimulator } from './views/AiSimulator';
import { Weather } from './views/Weather';
import { Ai } from './views/Ai';
import { Crew } from './views/Crew';
import { AnimatedBackground } from './components/AnimatedBackground';

function NavLinks() {
  const location = useLocation();
  const path = location.pathname;
  const navigate = useNavigate();

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

const App: React.FC = () => {
  return (
    <Router>
      <div className="app-container">
        <AnimatedBackground />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/predict" element={<Predict />} />
            <Route path="/assets" element={<Assets />} />
            <Route path="/simulate" element={<AiSimulator />} />
            <Route path="/weather" element={<Weather />} />
            <Route path="/ai" element={<Ai />} />
            <Route path="/crew" element={<Crew />} />
            <Route path="/asset/:id" element={<AssetDetail />} />
          </Routes>
        </main>
        <NavLinks />
      </div>
    </Router>
  );
};

export default App;
