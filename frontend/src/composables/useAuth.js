import { ref, computed } from 'vue';
import { authService } from '../services/authService';

const currentUser = ref(null);

export function useAuth() {
  const token = computed(() => localStorage.getItem('token'));
  const isAuthenticated = computed(() => !!currentUser.value && !!token.value);

  const hasAdminAccess = computed(() => {
    if (!currentUser.value || !currentUser.value.role) return false;
    const role = currentUser.value.role.trim().toLocaleLowerCase('tr-TR');
    return role === 'admin' || role === 'müdür' || role === 'mudur';
  });

  const initAuth = () => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        currentUser.value = JSON.parse(savedUser);
      } catch (e) {
        currentUser.value = null;
      }
    }
  };

  const setAuthUser = (user, jwtToken) => {
    currentUser.value = user;
    if (user) localStorage.setItem('currentUser', JSON.stringify(user));
    if (jwtToken) localStorage.setItem('token', jwtToken);
  };

  const logout = async () => {
    if (currentUser.value?.id) {
      try {
        await authService.logout(currentUser.value.id);
      } catch (e) {
        console.error('Logout error:', e);
      }
    }
    currentUser.value = null;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
  };

  return {
    currentUser,
    token,
    isAuthenticated,
    hasAdminAccess,
    initAuth,
    setAuthUser,
    logout
  };
}
