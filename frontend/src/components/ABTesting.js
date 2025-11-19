import React, { useState, useEffect } from 'react';
import { abTestAPI } from '../services/api';
import '../styles/ABTesting.css';

const ABTesting = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const response = await abTestAPI.getAll();
      setTests(response.data.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch A/B tests');
      setLoading(false);
    }
  };

  const handleStart = async (id) => {
    try {
      await abTestAPI.start(id);
      fetchTests();
    } catch (err) {
      setError('Failed to start A/B test');
    }
  };

  const handleComplete = async (id) => {
    try {
      await abTestAPI.complete(id, {});
      fetchTests();
    } catch (err) {
      setError('Failed to complete A/B test');
    }
  };

  if (loading) return <div className="loading">Loading A/B tests...</div>;

  return (
    <div className="ab-testing">
      <div className="header">
        <h1>A/B Testing</h1>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="tests-grid">
        {tests.map((test) => (
          <div key={test.id} className="test-card">
            <div className="test-header">
              <h3>{test.name}</h3>
              <span className={`status ${test.status.toLowerCase()}`}>
                {test.status}
              </span>
            </div>
            <div className="test-details">
              <p><strong>Type:</strong> {test.testType.replace(/_/g, ' ')}</p>
              <p><strong>Variants:</strong> {test.variants?.length || 0}</p>
              {test.startDate && (
                <p><strong>Started:</strong> {new Date(test.startDate).toLocaleDateString()}</p>
              )}
              {test.endDate && (
                <p><strong>Ended:</strong> {new Date(test.endDate).toLocaleDateString()}</p>
              )}
            </div>
            <div className="test-actions">
              {test.status === 'DRAFT' && (
                <button onClick={() => handleStart(test.id)}>
                  Start Test
                </button>
              )}
              {test.status === 'RUNNING' && (
                <button onClick={() => handleComplete(test.id)}>
                  Complete Test
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {tests.length === 0 && (
        <div className="empty-state">
          No A/B tests found. Create your first test to optimize your campaigns!
        </div>
      )}
    </div>
  );
};

export default ABTesting;
