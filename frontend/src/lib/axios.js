import axios from 'axios';

// Create Axios instance
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Hardcoded for Phase 3 dev
  headers: {
    'Content-Type': 'application/json',
  },
});

// NOTE: No implicit auth headers.
// Callers must pass: { headers: { Authorization: `Bearer ${token}` } }

export default api;
