import React from 'react';
import { Dashboard } from './views/Dashboard';

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>GridGuard AI</h1>
        <p>Power Outage Prediction & Advisor</p>
      </header>
      <main className="app-main">
        <Dashboard />
      </main>
    </div>
  );
}

export default App;
