import { defineStore } from 'pinia';
import { authService } from '../services/authService';
import { isManagerOrAdmin } from '../constants/roles';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    currentUser: JSON.parse(localStorage.getItem('currentUser') || 'null'),
    token: localStorage.getItem('token') || ''
  }),
  getters: {
    isAuthenticated: (state) => !!state.currentUser,
    hasAdminAccess: (state) => isManagerOrAdmin(state.currentUser?.role)
  },
  actions: {
    initAuth() {
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        try {
          this.currentUser = JSON.parse(savedUser);
        } catch (e) {
          this.currentUser = null;
        }
      }
    },
    setAuthUser(user, token) {
      this.currentUser = user;
      if (token) this.token = token;
      if (user) localStorage.setItem('currentUser', JSON.stringify(user));
      if (token) localStorage.setItem('token', token);
    },
    async login(username, password) {
      const res = await authService.login({ username, password });
      if (res.token && res.user) {
        this.setAuthUser(res.user, res.token);
      }
      return res;
    },
    async logout() {
      if (this.currentUser?.id) {
        try {
          await authService.logout(this.currentUser.id);
        } catch (e) {
          console.error('Logout error:', e);
        }
      }
      this.currentUser = null;
      this.token = '';
      localStorage.removeItem('currentUser');
      localStorage.removeItem('token');
    }
  }
});
