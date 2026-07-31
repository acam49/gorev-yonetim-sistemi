import httpClient from '../api/httpClient';

export const taskTypeService = {
  async getTypes() {
    const response = await httpClient.get('/task-types');
    return response.data;
  },

  async createType(typeData) {
    const response = await httpClient.post('/task-types', typeData);
    return response.data;
  },

  async deleteType(id) {
    const response = await httpClient.delete(`/task-types/${id}`);
    return response.data;
  }
};
