import React, { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { audienceAPI } from '../services/api';
import '../styles/AudienceBuilder.css';

const ItemTypes = {
  TARGETING_OPTION: 'targeting_option',
};

// Draggable targeting option component
const TargetingOption = ({ option, category }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.TARGETING_OPTION,
    item: { option, category },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`targeting-option ${isDragging ? 'dragging' : ''}`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      {option.name || option}
    </div>
  );
};

// Drop zone for selected targeting criteria
const TargetingDropZone = ({ category, items, onDrop, onRemove }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.TARGETING_OPTION,
    drop: (item) => {
      if (item.category === category) {
        onDrop(item.option, category);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      className={`targeting-drop-zone ${isOver ? 'drag-over' : ''}`}
    >
      {items.length === 0 ? (
        <div className="drop-placeholder">
          Drag and drop {category.toLowerCase()} here
        </div>
      ) : (
        <div className="selected-items">
          {items.map((item, idx) => (
            <div key={idx} className="selected-item">
              <span>{item.name || item}</span>
              <button
                onClick={() => onRemove(idx, category)}
                className="remove-btn"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AudienceBuilder = ({ audience, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    audienceType: 'SAVED',
    targeting: {
      age: { min: 18, max: 65 },
      gender: 'ALL',
      locations: [],
      interests: [],
      behaviors: [],
    },
    metadata: {
      tags: [],
    },
  });

  const [estimatedSize, setEstimatedSize] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newTag, setNewTag] = useState('');

  // Sample data for targeting options
  const targetingOptions = {
    locations: [
      { name: 'United States', id: 'US' },
      { name: 'United Kingdom', id: 'GB' },
      { name: 'Canada', id: 'CA' },
      { name: 'Australia', id: 'AU' },
      { name: 'Germany', id: 'DE' },
      { name: 'France', id: 'FR' },
      { name: 'New York', id: 'NY' },
      { name: 'California', id: 'CA-STATE' },
      { name: 'Texas', id: 'TX' },
    ],
    interests: [
      { name: 'Technology', id: 'tech' },
      { name: 'Fashion', id: 'fashion' },
      { name: 'Sports', id: 'sports' },
      { name: 'Travel', id: 'travel' },
      { name: 'Food & Dining', id: 'food' },
      { name: 'Health & Fitness', id: 'fitness' },
      { name: 'Entertainment', id: 'entertainment' },
      { name: 'Business', id: 'business' },
    ],
    behaviors: [
      { name: 'Online Shoppers', id: 'online_shoppers' },
      { name: 'Small Business Owners', id: 'small_biz' },
      { name: 'Frequent Travelers', id: 'travelers' },
      { name: 'Early Adopters', id: 'early_adopters' },
      { name: 'Mobile Users', id: 'mobile' },
      { name: 'Desktop Users', id: 'desktop' },
    ],
  };

  useEffect(() => {
    if (audience) {
      setFormData({
        name: audience.name || '',
        description: audience.description || '',
        audienceType: audience.audienceType || 'SAVED',
        targeting: audience.targeting || {
          age: { min: 18, max: 65 },
          gender: 'ALL',
          locations: [],
          interests: [],
          behaviors: [],
        },
        metadata: audience.metadata || { tags: [] },
      });
    }
  }, [audience]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAgeChange = (field, value) => {
    setFormData({
      ...formData,
      targeting: {
        ...formData.targeting,
        age: {
          ...formData.targeting.age,
          [field]: parseInt(value),
        },
      },
    });
  };

  const handleGenderChange = (e) => {
    setFormData({
      ...formData,
      targeting: {
        ...formData.targeting,
        gender: e.target.value,
      },
    });
  };

  const handleDrop = (option, category) => {
    const currentItems = formData.targeting[category.toLowerCase()] || [];
    const optionId = option.id || option;

    // Check if already added
    if (currentItems.some((item) => (item.id || item) === optionId)) {
      return;
    }

    setFormData({
      ...formData,
      targeting: {
        ...formData.targeting,
        [category.toLowerCase()]: [...currentItems, option],
      },
    });
  };

  const handleRemove = (index, category) => {
    const currentItems = formData.targeting[category.toLowerCase()];
    const newItems = currentItems.filter((_, idx) => idx !== index);

    setFormData({
      ...formData,
      targeting: {
        ...formData.targeting,
        [category.toLowerCase()]: newItems,
      },
    });
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.metadata.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        metadata: {
          ...formData.metadata,
          tags: [...formData.metadata.tags, newTag.trim()],
        },
      });
      setNewTag('');
    }
  };

  const handleRemoveTag = (index) => {
    setFormData({
      ...formData,
      metadata: {
        ...formData.metadata,
        tags: formData.metadata.tags.filter((_, idx) => idx !== index),
      },
    });
  };

  const handleEstimateSize = async () => {
    try {
      setLoading(true);
      const response = await audienceAPI.estimateSize(formData.targeting);
      setEstimatedSize(response.data.data.estimatedSize);
      setLoading(false);
    } catch (err) {
      setError('Failed to estimate audience size');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSave(formData);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save audience');
      setLoading(false);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="audience-builder">
        <div className="builder-header">
          <h2>{audience ? 'Edit Audience' : 'Create New Audience'}</h2>
          <button onClick={onCancel} className="close-btn">
            ×
          </button>
        </div>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <div className="builder-section">
            <h3>Basic Information</h3>
            <div className="form-group">
              <label>Audience Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="e.g., Tech-Savvy Millennials"
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                placeholder="Describe this audience..."
              />
            </div>

            <div className="form-group">
              <label>Audience Type</label>
              <select
                name="audienceType"
                value={formData.audienceType}
                onChange={handleInputChange}
              >
                <option value="SAVED">Saved Audience</option>
                <option value="CUSTOM">Custom Audience</option>
                <option value="LOOKALIKE">Lookalike Audience</option>
              </select>
            </div>
          </div>

          {/* Demographics */}
          <div className="builder-section">
            <h3>Demographics</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Age Range</label>
                <div className="age-range">
                  <input
                    type="number"
                    value={formData.targeting.age.min}
                    onChange={(e) => handleAgeChange('min', e.target.value)}
                    min="13"
                    max="65"
                  />
                  <span>to</span>
                  <input
                    type="number"
                    value={formData.targeting.age.max}
                    onChange={(e) => handleAgeChange('max', e.target.value)}
                    min="13"
                    max="65"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Gender</label>
                <select value={formData.targeting.gender} onChange={handleGenderChange}>
                  <option value="ALL">All</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </div>
            </div>
          </div>

          {/* Drag and Drop Targeting */}
          <div className="builder-section">
            <h3>Targeting Criteria</h3>
            <p className="section-hint">
              Drag and drop targeting options to build your audience
            </p>

            <div className="targeting-builder">
              {/* Locations */}
              <div className="targeting-row">
                <div className="targeting-source">
                  <h4>Available Locations</h4>
                  <div className="options-list">
                    {targetingOptions.locations.map((location) => (
                      <TargetingOption
                        key={location.id}
                        option={location}
                        category="Locations"
                      />
                    ))}
                  </div>
                </div>
                <div className="targeting-target">
                  <h4>Selected Locations</h4>
                  <TargetingDropZone
                    category="Locations"
                    items={formData.targeting.locations}
                    onDrop={handleDrop}
                    onRemove={handleRemove}
                  />
                </div>
              </div>

              {/* Interests */}
              <div className="targeting-row">
                <div className="targeting-source">
                  <h4>Available Interests</h4>
                  <div className="options-list">
                    {targetingOptions.interests.map((interest) => (
                      <TargetingOption
                        key={interest.id}
                        option={interest}
                        category="Interests"
                      />
                    ))}
                  </div>
                </div>
                <div className="targeting-target">
                  <h4>Selected Interests</h4>
                  <TargetingDropZone
                    category="Interests"
                    items={formData.targeting.interests}
                    onDrop={handleDrop}
                    onRemove={handleRemove}
                  />
                </div>
              </div>

              {/* Behaviors */}
              <div className="targeting-row">
                <div className="targeting-source">
                  <h4>Available Behaviors</h4>
                  <div className="options-list">
                    {targetingOptions.behaviors.map((behavior) => (
                      <TargetingOption
                        key={behavior.id}
                        option={behavior}
                        category="Behaviors"
                      />
                    ))}
                  </div>
                </div>
                <div className="targeting-target">
                  <h4>Selected Behaviors</h4>
                  <TargetingDropZone
                    category="Behaviors"
                    items={formData.targeting.behaviors}
                    onDrop={handleDrop}
                    onRemove={handleRemove}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="builder-section">
            <h3>Tags (Optional)</h3>
            <div className="tag-input-group">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="Add a tag..."
              />
              <button type="button" onClick={handleAddTag} className="add-tag-btn">
                Add Tag
              </button>
            </div>
            {formData.metadata.tags.length > 0 && (
              <div className="tags-list">
                {formData.metadata.tags.map((tag, idx) => (
                  <span key={idx} className="tag">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(idx)}
                      className="remove-tag-btn"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Estimated Size */}
          <div className="builder-section">
            <h3>Audience Size Estimate</h3>
            <button
              type="button"
              onClick={handleEstimateSize}
              className="estimate-btn"
              disabled={loading}
            >
              {loading ? 'Estimating...' : 'Estimate Audience Size'}
            </button>
            {estimatedSize && (
              <div className="size-estimate">
                <p>
                  Estimated Reach: <strong>
                    {estimatedSize.min?.toLocaleString()} -{' '}
                    {estimatedSize.max?.toLocaleString()}
                  </strong>
                </p>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="builder-actions">
            <button type="button" onClick={onCancel} disabled={loading}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className="save-btn">
              {loading ? 'Saving...' : audience ? 'Update Audience' : 'Create Audience'}
            </button>
          </div>
        </form>
      </div>
    </DndProvider>
  );
};

export default AudienceBuilder;
