import httpClient from '../api/httpClient';

export const logService = {
  async getLogs() {
    const response = await httpClient.get('/logs');
    return response.data;
  },

  async createLog(logData) {
    const response = await httpClient.post('/logs', logData);
    return response.data;
  },

  async deleteLog(id) {
    const response = await httpClient.delete(`/logs/${id}`);
    return response.data;
  }
};
