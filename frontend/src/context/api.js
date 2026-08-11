import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

// Attach the session token (if present) to every request made through this instance.
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('sasyavedha_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If a session is invalid/expired, clear it out so the app falls back to the login screen.
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('sasyavedha_token');
      localStorage.removeItem('sasyavedha_user');
      if (window.location) {
        window.location.reload();
      }
    }
    return Promise.reject(error);
  }
);

export const getDashboard = () => API.get('/dashboard');
export const detectDisease = (crop, imageBase64) => API.post('/detect-disease', { crop, image: imageBase64 });
export const predictYield = (data) => API.post('/predict-yield', data);
export const getIrrigation = (data) => API.post('/irrigation', data);
export const getFertilizer = (data) => API.post('/fertilizer', data);
export const getFieldDashboard = (fieldId) => API.get(`/dashboard/field/${fieldId}`);
export const updateFieldCrop = (fieldId, crop) => API.put(`/fields/${fieldId}/crop`, { crop });
export const getUsers = () => API.get('/auth/users');
export const updateUserAccess = (userId, changes) => API.put(`/auth/users/${userId}`, changes);

// Enterprise API endpoints
export const getEnterpriseOverview = () => API.get('/enterprise/overview');
export const getFarms = () => API.get('/enterprise/farms');
export const createFarm = (farmData) => API.post('/enterprise/farms', farmData);
export const updateFarm = (farmId, farmData) => API.put(`/enterprise/farms/${farmId}`, farmData);
export const getFarmAnalytics = (farmId) => API.get(`/enterprise/farms/${farmId}/analytics`);
export const getAdvancedAnalytics = (params) => API.get('/enterprise/analytics', { params });
export const getTeamMembers = () => API.get('/enterprise/team');
export const inviteTeamMember = (memberData) => API.post('/enterprise/team/invite', memberData);
export const updateTeamRole = (userId, role) => API.put(`/enterprise/team/${userId}/role`, { role });
export const getInventory = () => API.get('/enterprise/inventory');
export const updateInventory = (itemId, data) => API.put(`/enterprise/inventory/${itemId}`, data);
export const getReports = (params) => API.get('/enterprise/reports', { params });
export const generateReport = (reportConfig) => API.post('/enterprise/reports/generate', reportConfig);

// Climate Simulation API endpoints
export const runClimateSimulation = (simulationParams) => API.post('/climate/simulation', simulationParams);
export const getClimateScenarios = () => API.get('/climate/scenarios');
export const getClimateImpactData = (crop, scenario, timeHorizon) => API.get('/climate/impact', { params: { crop, scenario, timeHorizon } });
export const getAdaptationRecommendations = (impactData) => API.post('/climate/adaptation', impactData);
export const getHistoricalClimateData = (location, years) => API.get('/climate/historical', { params: { location, years } });
