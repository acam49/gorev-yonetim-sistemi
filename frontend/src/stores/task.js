import { defineStore } from 'pinia';
import { taskService } from '../services/taskService';
import { taskTypeService } from '../services/taskTypeService';

export const useTaskStore = defineStore('task', {
  state: () => ({
    tasks: [],
    taskTypes: [],
    loading: false,
    error: null
  }),
  getters: {
    activeTasks: (state) => state.tasks.filter(t => t.status !== 'Tamamlandı'),
    archivedTasks: (state) => state.tasks.filter(t => t.status === 'Tamamlandı')
  },
  actions: {
    async fetchTasks() {
      this.loading = true;
      try {
        this.tasks = await taskService.getTasks();
      } catch (err) {
        this.error = err.response?.data?.message || 'Görevler yüklenemedi.';
      } finally {
        this.loading = false;
      }
    },
    async fetchTaskTypes() {
      try {
        this.taskTypes = await taskTypeService.getTypes();
      } catch (err) {
        console.error('Görev türleri alınamadı:', err);
      }
    },
    async createTask(payload) {
      const newTask = await taskService.createTask(payload);
      await this.fetchTasks();
      return newTask;
    },
    async updateTaskStatus(taskId, status, assignedToId) {
      const payload = {};
      if (status !== undefined) payload.status = status;
      if (assignedToId !== undefined) payload.assignedToId = assignedToId;
      const updated = await taskService.updateTask(taskId, payload);
      await this.fetchTasks();
      return updated;
    },
    async claimTask(taskId, userId) {
      const result = await taskService.claimTask(taskId, userId);
      await this.fetchTasks();
      return result;
    },
    async deleteTask(taskId) {
      const result = await taskService.deleteTask(taskId);
      await this.fetchTasks();
      return result;
    }
  }
});
