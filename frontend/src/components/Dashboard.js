import React, { useState, useEffect } from 'react';
import { campaignAPI } from '../services/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  useEffect(() => {
    if (selectedCampaign) {
      fetchInsights(selectedCampaign);
    }
  }, [selectedCampaign]);

  const fetchCampaigns = async () => {
    try {
      const response = await campaignAPI.getAll({ isTemplate: false });
      const activeCampaigns = response.data.data.filter(c => c.fbCampaignId);
      setCampaigns(activeCampaigns);
      if (activeCampaigns.length > 0) {
        setSelectedCampaign(activeCampaigns[0].id);
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch campaigns');
      setLoading(false);
    }
  };

  const fetchInsights = async (campaignId) => {
    try {
      const response = await campaignAPI.getInsights(campaignId);
      setInsights(response.data.data);
    } catch (err) {
      console.error('Failed to fetch insights:', err);
      setInsights(null);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value || 0);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-US').format(value || 0);
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (error) return <div className="error">{error}</div>;

  if (campaigns.length === 0) {
    return (
      <div className="dashboard empty">
        <h1>Performance Dashboard</h1>
        <div className="empty-state">
          No active campaigns with Facebook sync found. Create and sync campaigns to see performance data.
        </div>
      </div>
    );
  }

  const currentCampaign = campaigns.find(c => c.id === selectedCampaign);
  const insightData = insights?.data?.[0] || {};

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Performance Dashboard</h1>
        <select
          value={selectedCampaign}
          onChange={(e) => setSelectedCampaign(e.target.value)}
          className="campaign-selector"
        >
          {campaigns.map((campaign) => (
            <option key={campaign.id} value={campaign.id}>
              {campaign.name}
            </option>
          ))}
        </select>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <h3>Impressions</h3>
          <div className="metric-value">{formatNumber(insightData.impressions)}</div>
        </div>
        <div className="metric-card">
          <h3>Clicks</h3>
          <div className="metric-value">{formatNumber(insightData.clicks)}</div>
        </div>
        <div className="metric-card">
          <h3>Spend</h3>
          <div className="metric-value">{formatCurrency(insightData.spend)}</div>
        </div>
        <div className="metric-card">
          <h3>CTR</h3>
          <div className="metric-value">{(insightData.ctr || 0).toFixed(2)}%</div>
        </div>
        <div className="metric-card">
          <h3>CPC</h3>
          <div className="metric-value">{formatCurrency(insightData.cpc)}</div>
        </div>
        <div className="metric-card">
          <h3>CPM</h3>
          <div className="metric-value">{formatCurrency(insightData.cpm)}</div>
        </div>
      </div>

      <div className="campaign-details">
        <h2>Campaign Details</h2>
        {currentCampaign && (
          <div className="details-grid">
            <div className="detail-item">
              <span className="label">Name:</span>
              <span className="value">{currentCampaign.name}</span>
            </div>
            <div className="detail-item">
              <span className="label">Status:</span>
              <span className={`value status ${currentCampaign.status.toLowerCase()}`}>
                {currentCampaign.status}
              </span>
            </div>
            <div className="detail-item">
              <span className="label">Objective:</span>
              <span className="value">{currentCampaign.objective}</span>
            </div>
            <div className="detail-item">
              <span className="label">Daily Budget:</span>
              <span className="value">{formatCurrency(currentCampaign.dailyBudget)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
