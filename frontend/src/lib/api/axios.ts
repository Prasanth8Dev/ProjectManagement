import axios from 'axios';
import { env } from '@/config/env';

const api = axios.create({
  baseURL: env.apiUrl,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Response interceptor: unwrap { success, data } envelope
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message ?? error.message ?? 'Request failed';
    return Promise.reject({ ...error, message });
  }
);

export { api };
export default api;
