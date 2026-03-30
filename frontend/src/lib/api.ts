import axios from 'axios';

const isDev = typeof window !== 'undefined' && window.location.port === '3000';
const API_BASE = isDev ? 'http://127.0.0.1:8000/api' : '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
