import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API,
  timeout: 30000,
});

// Auth
export const login = (username, password) => 
  api.post('/auth/login', { username, password });

export const register = (userData) => 
  api.post('/auth/register', userData);

// Admin - Client Management
export const getClients = () => api.get('/admin/clients');
export const createClient = (data) => api.post('/admin/clients', data);
export const updateClient = (clientId, data) => api.put(`/admin/clients/${clientId}`, data);
export const deleteClient = (clientId) => api.delete(`/admin/clients/${clientId}`);
export const getAdminStats = () => api.get('/admin/stats');

// Devices
export const getDevices = (userId) => api.get(`/devices/${userId}`);
export const getDeviceStats = (userId) => api.get(`/devices/${userId}/stats`);
export const createDevice = (userId, data) => api.post(`/devices/${userId}`, data);
export const updateDevice = (deviceId, data) => api.put(`/devices/${deviceId}`, data);
export const deleteDevice = (deviceId) => api.delete(`/devices/${deviceId}`);

// SMS
export const getSms = (userId, limit = 100) => api.get(`/sms/${userId}?limit=${limit}`);
export const createSms = (userId, data) => api.post(`/sms/${userId}`, data);
export const deleteSms = (messageId) => api.delete(`/sms/${messageId}`);

// Firebase
export const getFirebaseAccounts = (userId) => api.get(`/firebase/${userId}`);
export const createFirebaseAccount = (userId, data) => api.post(`/firebase/${userId}`, data);
export const deleteFirebaseAccount = (accountId) => api.delete(`/firebase/${accountId}`);

// Sessions
export const getSessions = (userId) => api.get(`/sessions/${userId}`);
export const deleteSession = (sessionId) => api.delete(`/sessions/${sessionId}`);

// User
export const updateUser = (userId, data) => api.put(`/users/${userId}`, data);
export const changePassword = (userId, oldPassword, newPassword) => 
  api.put(`/users/${userId}/password?old_password=${oldPassword}&new_password=${newPassword}`);

export default api;
