import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Dashboard } from './views/Dashboard';
import { AssetDetail } from './views/AssetDetail';

function App() {
  return (
    <Router>
      <div className="app-container">
        <header className="app-header">
          <div>
            <h1>GridGuard AI</h1>
            <p>Power Outage Prediction & Advisor</p>
          </div>
          <nav className="header-nav">
            <Link to="/" className="nav-link">Dashboard</Link>
          </nav>
        </header>
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/asset/:id" element={<AssetDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
