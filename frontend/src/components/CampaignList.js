import React, { useState, useEffect, useCallback } from 'react';
import { campaignAPI } from '../services/api';
import BulkActionsToolbar from './BulkActionsToolbar';
import BulkEditModal from './BulkEditModal';
import '../styles/CampaignList.css';
import '../styles/BulkActionsToolbar.css';
import '../styles/Feedback.css';
import '../styles/BulkEditModal.css';

const CampaignList = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({ status: '', isTemplate: '' });
  const [selectedCampaigns, setSelectedCampaigns] = useState([]);
  const [bulkActionStatus, setBulkActionStatus] = useState({ inProgress: false, message: '', error: false });
  const [isEditModalOpen, setEditModalOpen] = useState(false);

  const fetchCampaigns = useCallback(async () => {
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
  }, [filter]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns, filter]);

  // Reset selection when campaigns are re-fetched
  useEffect(() => {
    setSelectedCampaigns([]);
  }, [campaigns]);

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

  const handleSelectCampaign = (id) => {
    setSelectedCampaigns((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((campaignId) => campaignId !== id)
        : [...prevSelected, id]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedCampaigns(campaigns.map((c) => c.id));
    } else {
      setSelectedCampaigns([]);
    }
  };

  const executeBulkAction = async (action, successMessage) => {
    setBulkActionStatus({ inProgress: true, message: 'Processing...', error: false });
    try {
      await action();
      setBulkActionStatus({ inProgress: false, message: successMessage, error: false });
      fetchCampaigns(); // Refresh the list
      setSelectedCampaigns([]); // Clear selection
    } catch (err) {
      const errorMessage = err.response?.data?.error || `Failed to perform bulk action`;
      setBulkActionStatus({ inProgress: false, message: errorMessage, error: true });
    } finally {
      // Hide status message after a few seconds
      setTimeout(() => setBulkActionStatus({ inProgress: false, message: '', error: false }), 5000);
    }
  };

  const handleBulkPause = () => {
    executeBulkAction(
      () => campaignAPI.bulkUpdate(selectedCampaigns, { status: 'PAUSED' }),
      'Campaigns paused successfully.'
    );
  };

  const handleBulkActivate = () => {
    executeBulkAction(
      () => campaignAPI.bulkUpdate(selectedCampaigns, { status: 'ACTIVE' }),
      'Campaigns activated successfully.'
    );
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedCampaigns.length} campaigns?`)) {
      executeBulkAction(
        () => campaignAPI.bulkDelete(selectedCampaigns),
        'Campaigns deleted successfully.'
      );
    }
  };

  const handleBulkEdit = (updatedValues) => {
    executeBulkAction(
      () => campaignAPI.bulkUpdate(selectedCampaigns, updatedValues),
      'Campaigns updated successfully.'
    );
  };

  if (loading) return <div className="loading">Loading campaigns...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="campaign-list">
      <div className="header">
        <input
          type="checkbox"
          onChange={handleSelectAll}
          checked={campaigns.length > 0 && selectedCampaigns.length === campaigns.length}
          disabled={campaigns.length === 0}
          className="select-all-checkbox"
          title="Select All"
        />
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
          <div key={campaign.id} className={`campaign-card ${selectedCampaigns.includes(campaign.id) ? 'selected' : ''}`} onClick={() => handleSelectCampaign(campaign.id)}>
             <input
                type="checkbox"
                checked={selectedCampaigns.includes(campaign.id)}
                onChange={(e) => {
                    e.stopPropagation(); // prevent card click event from firing
                    handleSelectCampaign(campaign.id);
                }}
                className="campaign-checkbox"
             />
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
                <button onClick={(e) => {e.stopPropagation(); handleStatusChange(campaign.id, 'ACTIVE')}}>
                  Activate
                </button>
              )}
              {campaign.status === 'ACTIVE' && (
                <button onClick={(e) => {e.stopPropagation(); handleStatusChange(campaign.id, 'PAUSED')}}>
                  Pause
                </button>
              )}
              <button onClick={(e) => {e.stopPropagation(); handleDelete(campaign.id)}} className="delete">
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

      <BulkActionsToolbar
        selectedCount={selectedCampaigns.length}
        onPause={handleBulkPause}
        onActivate={handleBulkActivate}
        onDelete={handleBulkDelete}
        onEdit={() => setEditModalOpen(true)}
        disabled={bulkActionStatus.inProgress}
      />

      <BulkEditModal
        isOpen={isEditModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSubmit={handleBulkEdit}
        campaignCount={selectedCampaigns.length}
      />

      {bulkActionStatus.inProgress && (
        <div className="progress-bar-container">
          <div className="progress-bar"></div>
          <span>{bulkActionStatus.message}</span>
        </div>
      )}

      {bulkActionStatus.message && !bulkActionStatus.inProgress && (
        <div className={`feedback-message ${bulkActionStatus.error ? 'error' : 'success'}`}>
          {bulkActionStatus.message}
        </div>
      )}
    </div>
  );
};

export default CampaignList;
