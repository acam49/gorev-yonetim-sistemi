import { defineStore } from 'pinia';
import { userService } from '../services/userService';

export const useUserStore = defineStore('user', {
  state: () => ({
    users: [],
    loading: false,
    error: null
  }),
  actions: {
    async fetchUsers() {
      this.loading = true;
      try {
        this.users = await userService.getUsers();
      } catch (err) {
        this.error = err.response?.data?.message || 'Kullanıcılar alınamadı.';
      } finally {
        this.loading = false;
      }
    },
    async registerUser(userData) {
      const result = await userService.registerUser(userData);
      await this.fetchUsers();
      return result;
    },
    async updateUser(id, updateData) {
      const result = await userService.updateUser(id, updateData);
      await this.fetchUsers();
      return result;
    },
    async deleteUser(id) {
      const result = await userService.deleteUser(id);
      await this.fetchUsers();
      return result;
    }
  }
});
