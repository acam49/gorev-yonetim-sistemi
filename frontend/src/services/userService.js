import httpClient from '../api/httpClient';

export const userService = {
  async getUsers() {
    const response = await httpClient.get('/users');
    return response.data;
  },

  async registerUser(userData) {
    const response = await httpClient.post('/users/register', userData);
    return response.data;
  },

  async updateUser(id, userData) {
    const response = await httpClient.put(`/users/${id}`, userData);
    return response.data;
  },

  async deleteUser(id) {
    const response = await httpClient.delete(`/users/${id}`);
    return response.data;
  }
};
