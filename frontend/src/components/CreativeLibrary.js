import React, { useState, useEffect } from 'react';
import { creativeAPI } from '../services/api';
import '../styles/CreativeLibrary.css';

const CreativeLibrary = () => {
  const [creatives, setCreatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    body: '',
    imageUrl: '',
    linkUrl: '',
    callToAction: 'LEARN_MORE',
  });

  useEffect(() => {
    fetchCreatives();
  }, []);

  const fetchCreatives = async () => {
    try {
      const response = await creativeAPI.getAll({ status: 'ACTIVE' });
      setCreatives(response.data.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch creatives');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await creativeAPI.create(formData);
      setShowForm(false);
      setFormData({
        name: '',
        title: '',
        body: '',
        imageUrl: '',
        linkUrl: '',
        callToAction: 'LEARN_MORE',
      });
      fetchCreatives();
    } catch (err) {
      setError('Failed to create creative');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to archive this creative?')) {
      try {
        await creativeAPI.delete(id);
        fetchCreatives();
      } catch (err) {
        setError('Failed to delete creative');
      }
    }
  };

  if (loading) return <div className="loading">Loading creatives...</div>;

  return (
    <div className="creative-library">
      <div className="header">
        <h1>Creative Library</h1>
        <button onClick={() => setShowForm(!showForm)} className="create-btn">
          {showForm ? 'Cancel' : 'Create Creative'}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {showForm && (
        <div className="creative-form">
          <h2>New Creative</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Body Text</label>
              <textarea
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                rows="4"
              />
            </div>

            <div className="form-group">
              <label>Image URL</label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Link URL</label>
              <input
                type="url"
                value={formData.linkUrl}
                onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Call to Action</label>
              <select
                value={formData.callToAction}
                onChange={(e) => setFormData({ ...formData, callToAction: e.target.value })}
              >
                <option value="LEARN_MORE">Learn More</option>
                <option value="SHOP_NOW">Shop Now</option>
                <option value="SIGN_UP">Sign Up</option>
                <option value="DOWNLOAD">Download</option>
                <option value="BOOK_TRAVEL">Book Travel</option>
                <option value="CONTACT_US">Contact Us</option>
              </select>
            </div>

            <button type="submit">Create</button>
          </form>
        </div>
      )}

      <div className="creatives-grid">
        {creatives.map((creative) => (
          <div key={creative.id} className="creative-card">
            {creative.imageUrl && (
              <div className="creative-image">
                <img src={creative.imageUrl} alt={creative.name} />
              </div>
            )}
            <div className="creative-content">
              <h3>{creative.name}</h3>
              {creative.title && <h4>{creative.title}</h4>}
              {creative.body && <p>{creative.body}</p>}
              <div className="creative-meta">
                {creative.callToAction && (
                  <span className="cta">{creative.callToAction}</span>
                )}
              </div>
              <button onClick={() => handleDelete(creative.id)} className="delete">
                Archive
              </button>
            </div>
          </div>
        ))}
      </div>

      {creatives.length === 0 && !showForm && (
        <div className="empty-state">
          No creatives in library. Create your first creative to get started!
        </div>
      )}
    </div>
  );
};

export default CreativeLibrary;
