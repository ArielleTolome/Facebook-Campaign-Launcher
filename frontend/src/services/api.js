import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const campaignAPI = {
  getAll: (params) => apiClient.get('/campaigns', { params }),
  getById: (id) => apiClient.get(`/campaigns/${id}`),
  create: (data, adAccountId) => apiClient.post(`/campaigns?adAccountId=${adAccountId}`, data),
  bulkCreate: (campaigns, adAccountId) => apiClient.post(`/campaigns/bulk?adAccountId=${adAccountId}`, { campaigns }),
  update: (id, data) => apiClient.put(`/campaigns/${id}`, data),
  delete: (id) => apiClient.delete(`/campaigns/${id}`),
  bulkUpdate: (ids, data) => apiClient.put('/campaigns/bulk/update', { ids, data }),
  bulkDelete: (ids) => apiClient.post('/campaigns/bulk/delete', { ids }),
  createFromTemplate: (templateId, data, adAccountId) => 
    apiClient.post(`/campaigns/templates/${templateId}/create?adAccountId=${adAccountId}`, data),
  getInsights: (id) => apiClient.get(`/campaigns/${id}/insights`),
};

export const creativeAPI = {
  getAll: (params) => apiClient.get('/creatives', { params }),
  getById: (id) => apiClient.get(`/creatives/${id}`),
  create: (data, adAccountId) => apiClient.post(`/creatives?adAccountId=${adAccountId}`, data),
  bulkCreate: (creatives, adAccountId) => apiClient.post(`/creatives/bulk?adAccountId=${adAccountId}`, { creatives }),
  update: (id, data) => apiClient.put(`/creatives/${id}`, data),
  delete: (id) => apiClient.delete(`/creatives/${id}`),
};

export const abTestAPI = {
  getAll: (params) => apiClient.get('/ab-tests', { params }),
  getById: (id) => apiClient.get(`/ab-tests/${id}`),
  create: (data) => apiClient.post('/ab-tests', data),
  update: (id, data) => apiClient.put(`/ab-tests/${id}`, data),
  start: (id) => apiClient.post(`/ab-tests/${id}/start`),
  complete: (id, results) => apiClient.post(`/ab-tests/${id}/complete`, { results }),
  analyze: (id) => apiClient.get(`/ab-tests/${id}/analyze`),
};

export default apiClient;
