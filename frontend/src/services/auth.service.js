import api from '../lib/axios';

const authService = {
  /**
   * Mock login for development.
   * @param {string} role - 'user' or 'admin'
   */
  loginMock: async (role) => {
    const response = await api.post('/test-auth/login-mock', { role });
    return response.data; // Expected: { success, token, user }
  },
};

export default authService;
