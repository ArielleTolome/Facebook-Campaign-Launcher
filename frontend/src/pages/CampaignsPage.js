import React, { useState } from 'react';
import CampaignList from '../components/CampaignList';
import CampaignForm from '../components/CampaignForm';

const CampaignsPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [refresh, setRefresh] = useState(0);

  const handleSuccess = () => {
    setShowForm(false);
    setRefresh(prev => prev + 1);
  };

  return (
    <div className="page">
      {!showForm && (
        <div className="page-header">
          <button onClick={() => setShowForm(true)} className="create-btn">
            Create Campaign
          </button>
        </div>
      )}
      
      {showForm ? (
        <CampaignForm 
          onSuccess={handleSuccess} 
          onCancel={() => setShowForm(false)} 
        />
      ) : (
        <CampaignList key={refresh} />
      )}
    </div>
  );
};

export default CampaignsPage;
