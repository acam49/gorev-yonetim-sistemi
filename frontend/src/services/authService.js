import httpClient from '../api/httpClient';

export const authService = {
  async login(credentials) {
    const response = await httpClient.post('/users/login', credentials);
    return response.data;
  },

  async changeFirstPassword(payload) {
    const response = await httpClient.post('/users/change-first-password', payload);
    return response.data;
  },

  async changePassword(payload) {
    const response = await httpClient.put('/users/change-password', payload);
    return response.data;
  },

  async logout(userId) {
    if (userId) {
      await httpClient.put(`/users/logout/${userId}`);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
  }
};
