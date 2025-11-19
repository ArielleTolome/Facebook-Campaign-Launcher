import React, { useState, useEffect } from 'react';
import { audienceAPI } from '../services/api';
import AudienceCard from './AudienceCard';
import AudienceBuilder from './AudienceBuilder';
import AudienceOverlapVisualization from './AudienceOverlapVisualization';
import '../styles/AudienceLibrary.css';

const AudienceLibrary = ({ selectionMode = false, onAudienceSelect, selectedAudienceId }) => {
  const [audiences, setAudiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingAudience, setEditingAudience] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedForAnalysis, setSelectedForAnalysis] = useState([]);
  const [showOverlapAnalysis, setShowOverlapAnalysis] = useState(false);

  useEffect(() => {
    fetchAudiences();
  }, [filter]);

  const fetchAudiences = async () => {
    try {
      setLoading(true);
      const params = filter !== 'ALL' ? { audienceType: filter } : { status: 'ACTIVE' };
      const response = await audienceAPI.getAll(params);
      setAudiences(response.data.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch audiences');
      setLoading(false);
    }
  };

  const handleCreateAudience = () => {
    setEditingAudience(null);
    setShowBuilder(true);
  };

  const handleEditAudience = (audience) => {
    setEditingAudience(audience);
    setShowBuilder(true);
  };

  const handleDeleteAudience = async (audience) => {
    if (window.confirm(`Are you sure you want to archive "${audience.name}"?`)) {
      try {
        await audienceAPI.delete(audience.id);
        fetchAudiences();
      } catch (err) {
        setError('Failed to delete audience');
      }
    }
  };

  const handleSaveAudience = async (audienceData) => {
    try {
      if (editingAudience) {
        await audienceAPI.update(editingAudience.id, audienceData);
      } else {
        await audienceAPI.create(audienceData);
      }
      setShowBuilder(false);
      setEditingAudience(null);
      fetchAudiences();
    } catch (err) {
      setError('Failed to save audience');
      throw err;
    }
  };

  const handleCancelBuilder = () => {
    setShowBuilder(false);
    setEditingAudience(null);
  };

  const handleSelectAudience = (audience) => {
    if (onAudienceSelect) {
      onAudienceSelect(audience);
    }
  };

  const handleToggleAnalysis = (audience) => {
    setSelectedForAnalysis((prev) => {
      const isSelected = prev.some((a) => a.id === audience.id);
      if (isSelected) {
        return prev.filter((a) => a.id !== audience.id);
      } else {
        return [...prev, audience];
      }
    });
  };

  const handleAnalyzeOverlap = () => {
    if (selectedForAnalysis.length >= 2) {
      setShowOverlapAnalysis(true);
    }
  };

  const filteredAudiences = audiences.filter((audience) => {
    const matchesSearch =
      audience.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (audience.description &&
        audience.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  if (loading) {
    return <div className="loading">Loading audiences...</div>;
  }

  return (
    <div className="audience-library">
      {!showBuilder && !showOverlapAnalysis ? (
        <>
          <div className="audience-library-header">
            <h1>Audience Library</h1>
            <button onClick={handleCreateAudience} className="create-btn">
              Create Audience
            </button>
          </div>

          {error && <div className="error">{error}</div>}

          <div className="audience-controls">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search audiences..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filter-buttons">
              <button
                className={`filter-btn ${filter === 'ALL' ? 'active' : ''}`}
                onClick={() => setFilter('ALL')}
              >
                All
              </button>
              <button
                className={`filter-btn ${filter === 'SAVED' ? 'active' : ''}`}
                onClick={() => setFilter('SAVED')}
              >
                Saved
              </button>
              <button
                className={`filter-btn ${filter === 'CUSTOM' ? 'active' : ''}`}
                onClick={() => setFilter('CUSTOM')}
              >
                Custom
              </button>
              <button
                className={`filter-btn ${filter === 'LOOKALIKE' ? 'active' : ''}`}
                onClick={() => setFilter('LOOKALIKE')}
              >
                Lookalike
              </button>
            </div>
          </div>

          {!selectionMode && selectedForAnalysis.length >= 2 && (
            <div className="analysis-banner">
              <span>
                {selectedForAnalysis.length} audiences selected for overlap analysis
              </span>
              <button onClick={handleAnalyzeOverlap} className="analyze-btn">
                Analyze Overlap
              </button>
              <button
                onClick={() => setSelectedForAnalysis([])}
                className="clear-btn"
              >
                Clear Selection
              </button>
            </div>
          )}

          <div className="audiences-list">
            {filteredAudiences.length === 0 ? (
              <div className="empty-state">
                {searchQuery
                  ? 'No audiences match your search.'
                  : 'No audiences in library. Create your first audience to get started!'}
              </div>
            ) : (
              filteredAudiences.map((audience) => (
                <AudienceCard
                  key={audience.id}
                  audience={audience}
                  onSelect={
                    selectionMode
                      ? handleSelectAudience
                      : handleToggleAnalysis
                  }
                  onEdit={!selectionMode ? handleEditAudience : null}
                  onDelete={!selectionMode ? handleDeleteAudience : null}
                  isSelected={
                    selectionMode
                      ? selectedAudienceId === audience.id
                      : selectedForAnalysis.some((a) => a.id === audience.id)
                  }
                />
              ))
            )}
          </div>
        </>
      ) : showBuilder ? (
        <AudienceBuilder
          audience={editingAudience}
          onSave={handleSaveAudience}
          onCancel={handleCancelBuilder}
        />
      ) : (
        <div className="overlap-analysis-view">
          <div className="overlap-header">
            <h2>Audience Overlap Analysis</h2>
            <button
              onClick={() => setShowOverlapAnalysis(false)}
              className="back-btn"
            >
              Back to Library
            </button>
          </div>
          <AudienceOverlapVisualization audiences={selectedForAnalysis} />
        </div>
      )}
    </div>
  );
};

export default AudienceLibrary;
