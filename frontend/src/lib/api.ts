import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// Auth
export const authApi = {
  register: (data: RegisterData) => api.post('/auth/register', data),
  login: (data: LoginData) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

// Jobs
export const jobsApi = {
  getAll: (params?: object) => api.get('/jobs', { params }),
  getOne: (id: string) => api.get(`/jobs/${id}`),
  create: (data: object) => api.post('/jobs', data),
  update: (id: string, data: object) => api.put(`/jobs/${id}`, data),
  delete: (id: string) => api.delete(`/jobs/${id}`),
};

// Applications
export const applicationsApi = {
  apply: (jobId: string, formData: FormData) =>
    api.post(`/applications/job/${jobId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  myApplications: () => api.get('/applications/my'),
  getOne: (id: string) => api.get(`/applications/${id}`),
};

// Questionnaire
export const questionnaireApi = {
  submit: (applicationId: string, data: object) =>
    api.post(`/questionnaire/application/${applicationId}`, data),
  get: (applicationId: string) =>
    api.get(`/questionnaire/application/${applicationId}`),
};

// Admin
export const adminApi = {
  stats: () => api.get('/admin/stats'),
  allJobs: (params?: object) => api.get('/admin/jobs', { params }),
  candidates: (jobId: string, params?: object) =>
    api.get(`/admin/jobs/${jobId}/candidates`, { params }),
  updateStatus: (id: string, data: object) =>
    api.patch(`/admin/applications/${id}/status`, data),
};

// Companies
export const companiesApi = {
  getAll: () => api.get('/companies'),
  getOne: (id: string) => api.get(`/companies/${id}`),
  create: (data: object) => api.post('/companies', data),
};

// Types
export interface LoginData { email: string; password: string; }
export interface RegisterData { name: string; email: string; password: string; role?: string; }
