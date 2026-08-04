<template>
  <div class="app-background">
    <div class="dashboard-layout">

      <!-- KENAR PANEL (SUB-COMPONENT) -->
      <SidebarNav
        :has-admin-access="hasAdminAccess"
        @open-password-modal="showPasswordModal = true"
        @logout="handleLogout"
      />

      <!-- ANA İÇERİK -->
      <main class="dashboard-main">
        <header class="glass-panel header-panel">
          <div>
            <h1 class="glow-text">Hoş Geldin, {{ currentUser?.fullName || currentUser?.username }}</h1>
            <p style="color: rgba(255,255,255,0.5); font-size: 12px; margin-top: 5px;">Görev Yönetim Sistemi Ana Panel</p>
          </div>
        </header>

        <!-- ================= MÜDÜR / ADMİN PANOSU ================= -->
        <template v-if="hasAdminAccess">

          <p v-if="taskStore.loading" class="plain-text">Görevler kontrol ediliyor...</p>
          <p v-else-if="taskStore.error" class="plain-text" style="color:#ff4d4d;">{{ taskStore.error }}</p>

          <template v-else>
            
            <!-- ADMİNİN KENDİ GÖREVLERİ -->
            <div class="glass-panel">
              <h3 class="panel-title">ADINIZA ATANAN GÖREVLER</h3>
              <p v-if="myAdminTasks.length === 0" class="plain-text">Adınıza kayıtlı aktif görev bulunmamaktadır.</p>

              <div v-else class="task-alert-list">
                <div
                  v-for="t in myAdminTasks"
                  :key="t.id"
                  class="task-alert-card"
                  @click="router.push('/tasks')"
                  title="Görev sayfasına gitmek için tıklayın"
                >
                  <p class="alert-title">Sevgili {{ currentUser?.fullName || currentUser?.username }}, adınıza görev atanmıştır.</p>
                  <p class="alert-task-name">{{ t.title }}</p>
                  <p class="alert-detail">Başlangıç Tarihi: <span style="color:#00f2ff;">{{ formatDate(t.plannedDate) }}</span></p>
                  <p class="alert-detail">Bitiş Tarihi: <span style="color:#00f2ff;">{{ formatDate(t.deadline) }}</span></p>
                </div>
              </div>
            </div>

            <!-- 1. YAPILMAYA DEVAM EDEN GÖREVLER -->
            <div class="glass-panel">
              <h3 class="panel-title">YAPILMAYA DEVAM EDEN GÖREVLER</h3>
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Görev</th>
                    <th>Atanan Kişi</th>
                    <th>Durum</th>
                    <th>Bitiş Tarihi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="normalOngoingTasks.length === 0">
                    <td colspan="4" class="empty-state">Devam eden görev bulunmuyor.</td>
                  </tr>
                  <tr
                    v-for="t in normalOngoingTasks"
                    :key="t.id"
                    class="clickable-row"
                    @click="router.push('/tasks')"
                    title="Görev sayfasına gitmek için tıklayın"
                  >
                    <td style="color:#fff; font-weight:bold;">{{ t.title }}</td>
                    
                    <td>
                      <span v-if="!t.assignedToId" class="unassigned-badge">Henüz Atanmadı</span>
                      <span v-else style="color:#ff8fc0; font-weight:500;">{{ getUserName(t.assignedToId) }}</span>
                    </td>
                    
                    <td><span class="status-badge">{{ t.status || 'Yapılacak' }}</span></td>
                    
                    <td style="color:#00f2ff; font-weight:bold; font-size:12px;">{{ formatDate(t.deadline) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- 2. GECİKEN / HATA BİLDİREN GÖREVLER -->
            <div class="glass-panel">
              <h3 class="panel-title" style="color:#ff4d4d; border-bottom-color: rgba(255,77,77,0.2);">
                GECİKEN / HATA BİLDİREN GÖREVLER
              </h3>
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Görev</th>
                    <th>Atanan Kişi</th>
                    <th>Durum</th>
                    <th>Bitiş Tarihi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="problemTasks.length === 0">
                    <td colspan="4" class="empty-state">Geciken ya da hata bildiren görev bulunmuyor.</td>
                  </tr>
                  <tr
                    v-for="t in problemTasks"
                    :key="t.id"
                    class="clickable-row row-blink"
                    @click="router.push('/tasks')"
                    title="Görev sayfasına gitmek için tıklayın"
                  >
                    <td style="color:#fff; font-weight:bold;">{{ t.title }}</td>
                    <td>
                      <span v-if="!t.assignedToId" class="unassigned-badge">Henüz Atanmadı</span>
                      <span v-else class="blink-name">{{ getUserName(t.assignedToId) }}</span>
                    </td>
                    <td><span class="status-badge" style="color:#ff4d4d; border-color: rgba(255,77,77,0.4); background: rgba(255,77,77,0.1);">{{ t.status || 'Yapılacak' }}</span></td>
                    <td style="color:#ff4d4d; font-weight:bold; font-size:12px;">
                      {{ formatDate(t.deadline) }}
                      <span v-if="isOverdue(t)" style="display:block; font-size:10px;">SÜRESİ GEÇTİ</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- 3. TAMAMLANMIŞ GÖREVLER -->
            <div class="glass-panel">
              <h3 class="panel-title" style="color:#2ecc71; border-bottom-color: rgba(46,204,113,0.2);">
                TAMAMLANMIŞ GÖREVLER
              </h3>
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Görev</th>
                    <th>Atanan Kişi</th>
                    <th>Tamamlanma Tarihi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="completedTasks.length === 0">
                    <td colspan="3" class="empty-state">Henüz tamamlanmış görev yok.</td>
                  </tr>
                  <tr v-for="t in completedTasks" :key="t.id" class="archived-row">
                    <td>{{ t.title }}</td>
                    
                    <td>
                      <span v-if="!t.assignedToId" class="unassigned-badge">Henüz Atanmadı</span>
                      <span v-else style="color:#ff8fc0;">{{ getUserName(t.assignedToId) }}</span>
                    </td>
                    
                    <td style="color:#00f2ff; font-size:12px;">
                      {{ formatDate(t.updatedAt) }}
                      <span v-if="isToday(t.updatedAt)" style="color:#2ecc71; font-size:10px; display:block;">BUGÜN</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>
        </template>

        <!-- ================= NORMAL PERSONEL PANOSU ================= -->
        <div class="glass-panel" v-else>
          <h3 class="panel-title">ADINIZA ATANAN GÖREVLER</h3>

          <p v-if="taskStore.loading" class="plain-text">Görevler kontrol ediliyor...</p>
          <p v-else-if="taskStore.error" class="plain-text" style="color:#ff4d4d;">{{ taskStore.error }}</p>
          <p v-else-if="myStaffTasks.length === 0" class="plain-text">Adınıza kayıtlı aktif görev bulunmamaktadır.</p>

          <div v-else class="task-alert-list">
            <div
              v-for="t in myStaffTasks"
              :key="t.id"
              class="task-alert-card"
              @click="router.push('/tasks')"
              title="Görev sayfasına gitmek için tıklayın"
            >
              <p class="alert-title">Sevgili {{ currentUser?.fullName || currentUser?.username }}, adınıza görev atanmıştır.</p>
              <p class="alert-task-name">{{ t.title }}</p>
              <p class="alert-detail">Başlangıç Tarihi: <span style="color:#00f2ff;">{{ formatDate(t.plannedDate) }}</span></p>
              <p class="alert-detail">Bitiş Tarihi: <span style="color:#00f2ff;">{{ formatDate(t.deadline) }}</span></p>
            </div>
          </div>
        </div>
      </main>

    </div> <!-- /dashboard-layout -->

    <!-- ŞİFRE DEĞİŞTİRME MODALI (SUB-COMPONENT) -->
    <PasswordModal
      :show="showPasswordModal"
      @close="showPasswordModal = false"
    />
  </div> <!-- /app-background -->
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import SidebarNav from './dashboard/SidebarNav.vue';
import PasswordModal from './dashboard/PasswordModal.vue';
import { useAuthStore } from '../stores/auth';
import { useTaskStore } from '../stores/task';
import { useUserStore } from '../stores/user';
import { formatDate } from '../utils/formatters';

const router = useRouter();
const authStore = useAuthStore();
const taskStore = useTaskStore();
const userStore = useUserStore();

const currentUser = computed(() => authStore.currentUser);
const hasAdminAccess = computed(() => authStore.hasAdminAccess);

const showPasswordModal = ref(false);


const handleLogout = async () => {
  await authStore.logout();
  router.push('/login');
};


const getUserName = (userId) => {
  if (!userId) return 'Henüz Atanmadı';
  const u = userStore.users.find(u => String(u.id) === String(userId));
  return u ? (u.fullName || u.username) : 'Henüz Atanmadı';
};

const isOverdue = (task) => {
  if (!task.deadline || task.status === 'Tamamlandı') return false;
  const deadlineDate = new Date(task.deadline);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  deadlineDate.setHours(0, 0, 0, 0);
  return deadlineDate < today;
};

const isProblemTask = (task) => {
  return task.status === 'Hata' || isOverdue(task);
};

const isToday = (dateValue) => {
  if (!dateValue) return false;
  const d = new Date(dateValue);
  const t = new Date();
  return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate();
};

const myAdminTasks = computed(() => {
  return [...taskStore.tasks].filter(t => String(t.assignedToId) === String(currentUser.value?.id) && t.status !== 'Tamamlandı');
});

const myStaffTasks = computed(() => {
  return [...taskStore.tasks].filter(t => String(t.assignedToId) === String(currentUser.value?.id) && t.status !== 'Tamamlandı');
});

const normalOngoingTasks = computed(() => {
  return [...taskStore.tasks]
    .filter(t => t.status !== 'Tamamlandı' && !isProblemTask(t))
    .sort((a, b) => new Date(a.deadline || 0) - new Date(b.deadline || 0));
});

const problemTasks = computed(() => {
  return [...taskStore.tasks]
    .filter(t => t.status !== 'Tamamlandı' && isProblemTask(t))
    .sort((a, b) => new Date(a.deadline || 0) - new Date(b.deadline || 0));
});

const completedTasks = computed(() => {
  return [...taskStore.tasks]
    .filter(t => t.status === 'Tamamlandı')
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
});

onMounted(() => {
  taskStore.fetchTasks();
  if (hasAdminAccess.value) {
    userStore.fetchUsers();
  }
});
</script>

<style scoped>
.dashboard-layout {
  display: flex;
  gap: 25px;
  width: 100%;
  max-width: 1400px;
  min-height: calc(100vh - 80px);
}

.sidebar {
  width: 240px;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.side-menu { flex: 1; }

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 10px;
  color: #ff8fc0;
  cursor: pointer;
  border-radius: 8px;
  font-size: 13px;
  font-weight: bold;
}
.menu-item:hover { background: rgba(255, 143, 192, 0.1); }

.menu-arrow { transition: transform 0.2s; }
.menu-arrow.open { transform: rotate(180deg); }

.submenu { padding-left: 15px; margin-bottom: 10px; }
.submenu-item {
  padding: 10px;
  color: rgba(255,255,255,0.7);
  cursor: pointer;
  font-size: 12px;
  border-radius: 6px;
}
.submenu-item:hover { background: rgba(255, 143, 192, 0.08); color: #ff8fc0; }

.dashboard-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.plain-text { color: rgba(255,255,255,0.6); font-size: 13px; margin: 0; }

.task-alert-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-alert-card {
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 143, 192, 0.2);
  border-radius: 10px;
  padding: 15px;
  cursor: pointer;
  transition: 0.2s;
}
.task-alert-card:hover {
  border-color: #ff8fc0;
  background: rgba(255, 143, 192, 0.05);
}

.alert-title {
  color: #fff;
  font-size: 13px;
  font-weight: bold;
  margin: 0 0 6px 0;
}
.alert-task-name {
  color: #ff8fc0;
  font-size: 13px;
  margin: 0 0 8px 0;
}
.alert-detail {
  color: rgba(255,255,255,0.6);
  font-size: 12px;
  margin: 2px 0;
}

.unassigned-badge {
  background: rgba(255, 143, 192, 0.12);
  color: #ff8fc0;
  border: 1px dashed rgba(255, 143, 192, 0.4);
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  display: inline-block;
}

.clickable-row { cursor: pointer; transition: background 0.2s; }
.clickable-row:hover { background: rgba(255, 143, 192, 0.06); }

.row-blink { background: rgba(255, 77, 77, 0.06); }

.blink-name {
  color: #ff4d4d;
  font-weight: bold;
  animation: blink-warning 1.1s ease-in-out infinite;
}
@keyframes blink-warning {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
}
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.7);
  display: flex; align-items: center; justify-content: center; z-index: 999;
}
.modal-box { width: 100%; max-width: 380px; padding: 30px; }
.modal-input {
  width: 100%; padding: 11px; background: rgba(0,0,0,0.3);
  border: 1px solid rgba(255,143,192,0.2); border-radius: 8px;
  color: #fff; font-size: 13px; outline: none; box-sizing: border-box;
}
.modal-input:focus { border-color: #ff8fc0; }
.pwd-hints { display: flex; flex-direction: column; gap: 4px; }
.hint-ok { font-size: 11px; color: #2ecc71; }
.hint-fail { font-size: 11px; color: rgba(255,255,255,0.35); }
</style>