import React, { useState, useEffect } from 'react';
import { campaignAPI } from '../services/api';
import '../styles/CampaignList.css';

const CampaignList = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({ status: '', isTemplate: '' });

  useEffect(() => {
    fetchCampaigns();
  }, [filter]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter.status) params.status = filter.status;
      if (filter.isTemplate !== '') params.isTemplate = filter.isTemplate;
      
      const response = await campaignAPI.getAll(params);
      setCampaigns(response.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await campaignAPI.update(id, { status: newStatus });
      fetchCampaigns();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update campaign');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      try {
        await campaignAPI.delete(id);
        fetchCampaigns();
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to delete campaign');
      }
    }
  };

  if (loading) return <div className="loading">Loading campaigns...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="campaign-list">
      <div className="header">
        <h1>Campaigns</h1>
        <div className="filters">
          <select 
            value={filter.status} 
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="PAUSED">Paused</option>
            <option value="ARCHIVED">Archived</option>
          </select>
          <select 
            value={filter.isTemplate} 
            onChange={(e) => setFilter({ ...filter, isTemplate: e.target.value })}
          >
            <option value="">All Types</option>
            <option value="true">Templates</option>
            <option value="false">Campaigns</option>
          </select>
        </div>
      </div>

      <div className="campaigns-grid">
        {campaigns.map((campaign) => (
          <div key={campaign.id} className="campaign-card">
            <div className="campaign-header">
              <h3>{campaign.name}</h3>
              <span className={`status ${campaign.status.toLowerCase()}`}>
                {campaign.status}
              </span>
            </div>
            <div className="campaign-details">
              <p><strong>Objective:</strong> {campaign.objective}</p>
              <p><strong>Daily Budget:</strong> ${campaign.dailyBudget || 'N/A'}</p>
              <p><strong>Lifetime Budget:</strong> ${campaign.lifetimeBudget || 'N/A'}</p>
              {campaign.isTemplate && <span className="template-badge">Template</span>}
            </div>
            <div className="campaign-actions">
              {campaign.status === 'PAUSED' && (
                <button onClick={() => handleStatusChange(campaign.id, 'ACTIVE')}>
                  Activate
                </button>
              )}
              {campaign.status === 'ACTIVE' && (
                <button onClick={() => handleStatusChange(campaign.id, 'PAUSED')}>
                  Pause
                </button>
              )}
              <button onClick={() => handleDelete(campaign.id)} className="delete">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {campaigns.length === 0 && (
        <div className="empty-state">
          No campaigns found. Create your first campaign to get started!
        </div>
      )}
    </div>
  );
};

export default CampaignList;
