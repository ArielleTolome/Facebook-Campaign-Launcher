import React from 'react';
import '../styles/BulkActionsToolbar.css';

const BulkActionsToolbar = ({ selectedCount, onPause, onActivate, onDelete, onEdit }) => {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="bulk-actions-toolbar">
      <div className="selected-count">
        {selectedCount} item{selectedCount > 1 ? 's' : ''} selected
      </div>
      <div className="actions">
        <button onClick={onActivate} className="action-btn">
          Activate
        </button>
        <button onClick={onPause} className="action-btn">
          Pause
        </button>
        <button onClick={onEdit} className="action-btn">
          Edit
        </button>
        <button onClick={onDelete} className="action-btn delete">
          Delete
        </button>
      </div>
    </div>
  );
};

export default BulkActionsToolbar;
