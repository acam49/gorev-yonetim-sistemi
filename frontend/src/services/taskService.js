import httpClient from '../api/httpClient';

export const taskService = {
  async getTasks() {
    const response = await httpClient.get('/tasks');
    return response.data;
  },

  async getUserTasks(userId) {
    const response = await httpClient.get(`/tasks/user/${userId}`);
    return response.data;
  },

  async createTask(taskData) {
    const response = await httpClient.post('/tasks', taskData);
    return response.data;
  },

  async updateTask(id, updateData) {
    const response = await httpClient.put(`/tasks/${id}`, updateData);
    return response.data;
  },

  async claimTask(id, userId) {
    const response = await httpClient.put(`/tasks/${id}`, {
      assignedToId: userId,
      status: 'Devam Ediyor'
    });
    return response.data;
  },

  async deleteTask(id) {
    const response = await httpClient.delete(`/tasks/${id}`);
    return response.data;
  }
};
