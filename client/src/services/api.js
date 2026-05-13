import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});


api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post('/api/auth/refresh', { refreshToken });
        localStorage.setItem('accessToken', data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);


export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/update-profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};


export const servicesAPI = {
  getAll: (params) => api.get('/services', { params }),
  getOne: (id) => api.get(`/services/${id}`),
  create: (data) => api.post('/services', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/services/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/services/${id}`),
  getMyServices: () => api.get('/services/my-services'),
};


export const bookingsAPI = {
  create: (data) => api.post('/bookings', data),
  getMyBookings: (params) => api.get('/bookings/my-bookings', { params }),
  getProviderBookings: (params) => api.get('/bookings/provider-bookings', { params }),
  getOne: (id) => api.get(`/bookings/${id}`),
  updateStatus: (id, status) => api.put(`/bookings/${id}/status`, { status }),
  cancel: (id, reason) => api.put(`/bookings/${id}/cancel`, { reason }),
  getBookedSlots: (providerId, date) => api.get('/bookings/slots', { params: { providerId, date } }),
  getProviderStats: () => api.get('/bookings/provider-stats'),
};


export const providersAPI = {
  getAll: (params) => api.get('/providers', { params }),
  getNearby: (params) => api.get('/providers/nearby', { params }),
  getOne: (id) => api.get(`/providers/${id}`),
  getMyProfile: () => api.get('/providers/my-profile'),
  updateMyProfile: (data) => api.put('/providers/my-profile', data),
  toggleAvailability: () => api.put('/providers/availability'),
};



export const reviewsAPI = {
  create: (data) => api.post('/reviews', data),
  getServiceReviews: (serviceId, params) => api.get(`/reviews/service/${serviceId}`, { params }),
  getProviderReviews: (providerId, params) => api.get(`/reviews/provider/${providerId}`, { params }),
  reply: (id, reply) => api.put(`/reviews/${id}/reply`, { reply }),
  delete: (id) => api.delete(`/reviews/${id}`),
};

export default api;
