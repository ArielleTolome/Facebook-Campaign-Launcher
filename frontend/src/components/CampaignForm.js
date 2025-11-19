import React, { useState } from 'react';
import { campaignAPI } from '../services/api';
import '../styles/CampaignForm.css';

const CampaignForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    objective: 'LINK_CLICKS',
    dailyBudget: '',
    lifetimeBudget: '',
    status: 'PAUSED',
    isTemplate: false,
  });
  const [adAccountId, setAdAccountId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const objectives = [
    'LINK_CLICKS',
    'CONVERSIONS',
    'REACH',
    'BRAND_AWARENESS',
    'APP_INSTALLS',
    'VIDEO_VIEWS',
    'LEAD_GENERATION',
    'MESSAGES',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = {
        ...formData,
        dailyBudget: formData.dailyBudget ? parseFloat(formData.dailyBudget) : null,
        lifetimeBudget: formData.lifetimeBudget ? parseFloat(formData.lifetimeBudget) : null,
      };

      await campaignAPI.create(data, adAccountId);
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  return (
    <div className="campaign-form">
      <h2>Create New Campaign</h2>
      {error && <div className="error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Campaign Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="objective">Objective *</label>
          <select
            id="objective"
            name="objective"
            value={formData.objective}
            onChange={handleChange}
            required
          >
            {objectives.map((obj) => (
              <option key={obj} value={obj}>
                {obj.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="dailyBudget">Daily Budget ($)</label>
            <input
              type="number"
              id="dailyBudget"
              name="dailyBudget"
              value={formData.dailyBudget}
              onChange={handleChange}
              min="0"
              step="0.01"
            />
          </div>

          <div className="form-group">
            <label htmlFor="lifetimeBudget">Lifetime Budget ($)</label>
            <input
              type="number"
              id="lifetimeBudget"
              name="lifetimeBudget"
              value={formData.lifetimeBudget}
              onChange={handleChange}
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="ACTIVE">Active</option>
            <option value="PAUSED">Paused</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="adAccountId">Facebook Ad Account ID</label>
          <input
            type="text"
            id="adAccountId"
            value={adAccountId}
            onChange={(e) => setAdAccountId(e.target.value)}
            placeholder="Optional - for Facebook sync"
          />
        </div>

        <div className="form-group checkbox">
          <label>
            <input
              type="checkbox"
              name="isTemplate"
              checked={formData.isTemplate}
              onChange={handleChange}
            />
            Save as Template
          </label>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Campaign'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CampaignForm;
