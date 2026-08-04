import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { isManagerOrAdmin } from '../constants/roles';

import LandingView from '../components/LandingView.vue';
import Login from '../components/Login.vue';
import Dashboard from '../components/Dashboard.vue';
import TaskManager from '../components/TaskManager.vue';
import Personnel from '../components/Personnel.vue';
import TaskTypes from '../components/TaskTypes.vue';
import SystemLogs from '../components/SystemLogs.vue';

const routes = [
  { path: '/', name: 'landing', component: LandingView },
  { path: '/login', name: 'login', component: Login },
  { path: '/dashboard', name: 'dashboard', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/tasks', name: 'tasks', component: TaskManager, meta: { requiresAuth: true } },
  { path: '/personnel', name: 'personnel', component: Personnel, meta: { requiresAuth: true, requiresManager: true } },
  { path: '/task-types', name: 'task-types', component: TaskTypes, meta: { requiresAuth: true, requiresManager: true } },
  { path: '/logs', name: 'logs', component: SystemLogs, meta: { requiresAuth: true, requiresManager: true } },
  { path: '/:pathMatch(.*)*', redirect: '/' }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  const savedUser = localStorage.getItem('currentUser');
  
  let currentUser = null;
  try {
    currentUser = savedUser ? JSON.parse(savedUser) : null;
  } catch (e) {
    currentUser = null;
  }

  const isAuthenticated = !!(token && currentUser);
  const hasAdminAccess = isManagerOrAdmin(currentUser?.role);

  const authStore = useAuthStore();
  if (currentUser && !authStore.currentUser) {
    authStore.setAuthUser(currentUser, token);
  }

  if (to.meta.requiresAuth && !isAuthenticated) {
    if (from.name === 'login') return next(false);
    return next({ name: 'login' });
  }

  if (to.meta.requiresManager && !hasAdminAccess) {
    if (from.name === 'dashboard') return next(false);
    return next({ name: 'dashboard' });
  }

  if (to.name === 'login' && isAuthenticated) {
    if (from.name === 'dashboard') return next(false);
    return next({ name: 'dashboard' });
  }

  next();
});

export default router;