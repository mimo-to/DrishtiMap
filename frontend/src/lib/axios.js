import axios from 'axios';

// Create Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// NOTE: No implicit auth headers.
// Callers must pass: { headers: { Authorization: `Bearer ${token}` } }

export default api;
