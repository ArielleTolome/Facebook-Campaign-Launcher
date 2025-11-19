import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import CampaignsPage from './pages/CampaignsPage';
import CreativesPage from './pages/CreativesPage';
import AudiencesPage from './pages/AudiencesPage';
import ABTestingPage from './pages/ABTestingPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="sidebar">
          <div className="logo">
            <h2>FB Campaign Launcher</h2>
          </div>
          <ul className="nav-menu">
            <li>
              <Link to="/">Dashboard</Link>
            </li>
            <li>
              <Link to="/campaigns">Campaigns</Link>
            </li>
            <li>
              <Link to="/creatives">Creative Library</Link>
            </li>
            <li>
              <Link to="/audiences">Audience Library</Link>
            </li>
            <li>
              <Link to="/ab-testing">A/B Testing</Link>
            </li>
          </ul>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/campaigns" element={<CampaignsPage />} />
            <Route path="/creatives" element={<CreativesPage />} />
            <Route path="/audiences" element={<AudiencesPage />} />
            <Route path="/ab-testing" element={<ABTestingPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
