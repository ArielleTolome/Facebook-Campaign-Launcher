import React from 'react';
import '../styles/AudienceCard.css';

const AudienceCard = ({ audience, onSelect, onEdit, onDelete, isSelected }) => {
  const formatNumber = (num) => {
    if (!num) return 'Unknown';
    return num.toLocaleString();
  };

  const getAudienceSize = () => {
    if (audience.size && audience.size.estimatedSize) {
      const { min, max } = audience.size.estimatedSize;
      if (min && max) {
        return `${formatNumber(min)} - ${formatNumber(max)}`;
      }
    }
    return 'Size unknown';
  };

  const getTargetingSummary = () => {
    const targeting = audience.targeting || {};
    const summary = [];

    if (targeting.age) {
      summary.push(`Age: ${targeting.age.min || 18}-${targeting.age.max || 65}`);
    }

    if (targeting.gender) {
      summary.push(`Gender: ${targeting.gender}`);
    }

    if (targeting.locations && targeting.locations.length > 0) {
      const locationCount = targeting.locations.length;
      summary.push(`${locationCount} location${locationCount > 1 ? 's' : ''}`);
    }

    if (targeting.interests && targeting.interests.length > 0) {
      const interestCount = targeting.interests.length;
      summary.push(`${interestCount} interest${interestCount > 1 ? 's' : ''}`);
    }

    if (targeting.behaviors && targeting.behaviors.length > 0) {
      const behaviorCount = targeting.behaviors.length;
      summary.push(`${behaviorCount} behavior${behaviorCount > 1 ? 's' : ''}`);
    }

    return summary.length > 0 ? summary.join(' • ') : 'No targeting criteria';
  };

  return (
    <div className={`audience-card ${isSelected ? 'selected' : ''}`}>
      <div className="audience-card-header">
        <div className="audience-card-title">
          <h3>{audience.name}</h3>
          <span className={`audience-type-badge ${audience.audienceType?.toLowerCase()}`}>
            {audience.audienceType || 'SAVED'}
          </span>
        </div>
        {onSelect && (
          <button
            className={`select-btn ${isSelected ? 'selected' : ''}`}
            onClick={() => onSelect(audience)}
          >
            {isSelected ? 'Selected' : 'Select'}
          </button>
        )}
      </div>

      {audience.description && (
        <p className="audience-description">{audience.description}</p>
      )}

      <div className="audience-stats">
        <div className="stat">
          <span className="stat-label">Estimated Reach</span>
          <span className="stat-value">{getAudienceSize()}</span>
        </div>
      </div>

      <div className="audience-targeting">
        <span className="targeting-label">Targeting:</span>
        <span className="targeting-summary">{getTargetingSummary()}</span>
      </div>

      {audience.metadata?.tags && audience.metadata.tags.length > 0 && (
        <div className="audience-tags">
          {audience.metadata.tags.map((tag, idx) => (
            <span key={idx} className="tag">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="audience-card-footer">
        <span className="audience-date">
          Created: {new Date(audience.createdAt).toLocaleDateString()}
        </span>
        <div className="audience-actions">
          {onEdit && (
            <button className="action-btn edit" onClick={() => onEdit(audience)}>
              Edit
            </button>
          )}
          {onDelete && (
            <button className="action-btn delete" onClick={() => onDelete(audience)}>
              Archive
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AudienceCard;
