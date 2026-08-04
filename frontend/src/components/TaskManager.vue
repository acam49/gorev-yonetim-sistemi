<template>

  <div class="app-background">

    <div class="main-container">



      <!-- ÜST PANEL -->

      <header class="glass-panel header-panel">

        <div>

          <h1 class="glow-text">Görev Yönetim Sistemi</h1>

          <p style="color: rgba(255,255,255,0.5); font-size: 12px; margin-top: 5px;">Node.js & SQLite Altyapısı Aktif</p>

        </div>

        <div class="user-status-card">

          <div class="status-indicator"></div>

          <div class="user-details">
            <strong>Aktif Kullanıcı: {{ currentUser?.fullName || currentUser?.username }}</strong>
            <span style="display:block; font-size: 11px; color: rgba(255,255,255,0.5);">Yetki: {{ currentUser?.role || 'Personel' }}</span>
          </div>

          <button @click="router.push('/dashboard')" class="btn-glow" style="margin-left: 10px;">Ana Sayfa</button>
          <button @click="handleLogout" class="btn-delete" style="margin-left: 10px;">Çıkış Yap</button>

        </div>

      </header>



      <!-- ORTA PANEL: Görev Ekleme Formu (SADECE MÜDÜR VE ADMİN GÖREBİLİR) -->

      <div v-if="hasAdminAccess" class="glass-panel">

        <h3 class="panel-title">YENİ GÖREV ATA</h3>

        <form @submit.prevent="addTask" class="task-form-grid">

          <!-- Görev türü artık listeden seçiliyor -->
          <div>
            <label style="font-size:11px; color:rgba(255,255,255,0.6); display:block; margin-bottom:4px;">Görev Türü:</label>
            <select v-model="form.taskTypeId" @change="onTaskTypeChange" class="status-dropdown" style="width:100%;" required>
              <option disabled value="">Görev türü seçin</option>
              <option v-for="tt in taskTypes" :key="tt.id" :value="tt.id">{{ tt.name }}</option>
            </select>
          </div>

          <input v-model="form.description" type="text" placeholder="Görev Detayları (Opsiyonel)">

          <div>
            <label style="font-size: 11px; color: rgba(255,255,255,0.6); display:block; margin-bottom: 4px;">Kime Atanacak (Opsiyonel):</label>
            <select v-model="form.assignedToId" class="status-dropdown" style="width:100%;">
              <option value="">— Genel (Herkese Açık) —</option>
              <option v-for="u in users" :key="u.id" :value="u.id">{{ u.fullName || u.username }}</option>
            </select>
          </div>



          <div class="date-inputs">

            <div>

              <label>Planlanan Başlama:</label>

              <!-- 1. KALKAN: Bugünden önceki tarihler seçilemez -->

              <input v-model="form.plannedDate" type="date" :min="todayDate" required>

            </div>

            <div>

              <label>Hedeflenen Bitiş:</label>

              <!-- 1. KALKAN: Başlama tarihinden önceki tarihler seçilemez -->

              <input v-model="form.deadline" type="date" :min="form.plannedDate || todayDate" required>

            </div>

          </div>



          <button type="submit" class="btn-glow">Görevi Sisteme Kaydet</button>

        </form>

      </div>



      <!-- ALT PANEL: AKTİF GÖREVLER -->

      <div class="glass-panel">

        <h3 class="panel-title">AKTİF GÖREVLER LİSTESİ</h3>

        <table class="data-table">

          <thead>

            <tr>

              <th>ID</th>

              <th>Başlık</th>

              <th>Görevli</th>

              <th>Atanma Zamanı</th>

              <th>Başlama - Bitiş</th>

              <th>Durum</th>

              <th v-if="hasAdminAccess">İşlem</th>

            </tr>

          </thead>

          <tbody>

            <tr v-if="activeTasks.length === 0">

              <td :colspan="hasAdminAccess ? 7 : 6" class="empty-state">Aktif görev bulunmuyor.</td>

            </tr>

            <tr v-for="t in activeTasks" :key="t.id">

              <td style="color: rgba(255,255,255,0.5);">#{{ t.id }}</td>

              <td style="font-weight:bold; color: #fff;">

                {{ t.title }} <br>

                <small style="color: rgba(255,255,255,0.6); font-weight: normal;">{{ t.description }}</small>

              </td>

              

              <td style="color: #fff; font-weight: bold; font-size: 12px;">
                 {{ getAssignedName(t) }}
                 <button 
                   v-if="!t.assignedToId" 
                   @click="claimTask(t)" 
                   class="btn-glow" 
                   style="margin-left: 10px; padding: 4px 10px; font-size: 11px; height: auto;"
                   title="Bu görevi kendi üzerinize alın"
                 >
                   Kendine Al
                 </button>
              </td>



              <td style="color: #ff8fc0; font-size: 11px;">{{ new Date(t.startDate).toLocaleString('tr-TR') }}</td>

              <td style="font-size: 12px; color: #00f2ff;">

                B: {{ t.plannedDate ? new Date(t.plannedDate).toLocaleDateString('tr-TR') : '-' }} <br>

                B: {{ t.deadline ? new Date(t.deadline).toLocaleDateString('tr-TR') : '-' }}

              </td>



              <td>

                <div v-if="editingStatusId === t.id" class="status-edit-box">

                  <select v-model="tempStatus" class="status-dropdown">

                    <option value="Yapılacak">Yapılacak</option>

                    <option value="Devam Ediyor">Devam Ediyor</option>

                    <option value="Hata">Hata (Beklemede)</option>

                    <option value="Tamamlandı">Tamamlandı (Arşive Taşı)</option>

                  </select>

                  <div class="status-actions">

                    <button @click="confirmStatusUpdate(t.id)" class="btn-ok">Onayla</button>

                    <button @click="editingStatusId = null" class="btn-cancel">İptal</button>

                  </div>

                </div>

                <div v-else @click="startEditingStatus(t)" title="Durumu değiştirmek için tıkla" style="cursor:pointer;">
                  <StatusBadge :status="t.status || 'Yapılacak'" />
                </div>

              </td>



              <td v-if="hasAdminAccess">

                <button @click="deleteTask(t.id)" class="btn-delete">Sil</button>

              </td>

            </tr>

          </tbody>

        </table>

      </div>



      <!-- ARŞİV PANELİ -->

      <div class="glass-panel" style="border-color: rgba(46, 204, 113, 0.3);">

        <h3 class="panel-title" style="color: #2ecc71; border-bottom-color: rgba(46, 204, 113, 0.2);">ARŞİV (TAMAMLANAN GÖREVLER)</h3>

        <table class="data-table">

          <thead>

            <tr>

              <th>ID</th>

              <th>Başlık</th>

              <th>Görevli</th>

              <th>Başlama - Bitiş</th>

              <th>Durum</th>

              <th v-if="hasAdminAccess">İşlem</th>

            </tr>

          </thead>

          <tbody>

            <tr v-if="archivedTasks.length === 0">

              <td :colspan="hasAdminAccess ? 6 : 5" class="empty-state">Henüz tamamlanmış görev yok.</td>

            </tr>

            <tr v-for="t in archivedTasks" :key="t.id" class="archived-row">

              <td>#{{ t.id }}</td>

              <td>{{ t.title }}</td>

              

              <td style="color: #fff;"> {{ getAssignedName(t) }}</td>



              <td style="font-size: 12px; color: #00f2ff;">

                {{ t.plannedDate ? new Date(t.plannedDate).toLocaleDateString('tr-TR') : '-' }} /

                {{ t.deadline ? new Date(t.deadline).toLocaleDateString('tr-TR') : '-' }}

              </td>

              

              <td>

                <span class="status-badge-done">TAMAMLANDI</span>

                <button v-if="canRestoreTask(t)" @click="updateTaskStatus(t.id, 'Yapılacak')" class="btn-undo" style="margin-left: 10px;">Geri Al</button>

              </td>

              

              <td v-if="hasAdminAccess">

                <button @click="deleteTask(t.id)" class="btn-delete">Sil</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import StatusBadge from './common/StatusBadge.vue';
import { useAuthStore } from '../stores/auth';
import { taskService } from '../services/taskService';
import { taskTypeService } from '../services/taskTypeService';
import { userService } from '../services/userService';
import { getTodayString } from '../utils/formatters';
import { isManagerOrAdmin } from '../constants/roles';

const router = useRouter();
const authStore = useAuthStore();
const currentUser = computed(() => authStore.currentUser);

const handleLogout = async () => {
  await authStore.logout();
  router.push('/login');
};

const hasAdminAccess = computed(() => {
  return isManagerOrAdmin(currentUser.value?.role);
});

const canRestoreTask = (task) => {
  if (hasAdminAccess.value) return true;
  return task.assignedToId === currentUser.value?.id;
};

const todayDate = getTodayString(); 

const form = ref({
  title: '',
  description: '',
  plannedDate: '',
  deadline: '',
  assignedToId: '',
  taskTypeId: ''
});

const onTaskTypeChange = () => {
  const selectedType = taskTypes.value.find(tt => tt.id === form.value.taskTypeId);
  if (selectedType) {
    form.value.title = selectedType.name;
  }
};

const taskTypes = ref([]);
const users = ref([]);
const tasks = ref([]);
const editingStatusId = ref(null);
const tempStatus = ref('');

const getUserName = (userId) => {
  if (!userId) return 'Henüz Atanmadı';
  if (String(userId) === String(currentUser.value?.id)) {
    return currentUser.value?.fullName || currentUser.value?.username;
  }
  const user = users.value.find(u => String(u.id) === String(userId));
  return user ? (user.fullName || user.username) : 'Henüz Atanmadı';
};

const getAssignedName = (task) => {
  if (!task) return '— Genel —';
  if (!task.assignedToId) return '— Genel (Herkese Açık) —';
  if (task.assignedTo) return task.assignedTo.fullName || task.assignedTo.username;
  return getUserName(task.assignedToId);
};

const fetchTaskTypes = async () => {
  try {
    taskTypes.value = await taskTypeService.getTypes();
  } catch (e) { console.error('Görev türleri alınamadı:', e); }
};

const fetchUsers = async () => {
  try {
    users.value = await userService.getUsers();
  } catch (error) {
    console.error('Kullanıcılar alınamadı (Yetkiniz olmayabilir):', error);
  }
};

const activeTasks = computed(() => tasks.value.filter(t => t.status !== 'Tamamlandı'));
const archivedTasks = computed(() => tasks.value.filter(t => t.status === 'Tamamlandı'));

const fetchTasks = async () => {
  try {
    tasks.value = await taskService.getTasks();
  } catch (error) {
    console.error("Hata:", error);
  }
};

const addTask = async () => {
  if (new Date(form.value.deadline) < new Date(form.value.plannedDate)) {
    alert("Mantık Hatası: Görevin bitiş tarihi, başlama tarihinden önce olamaz!");
    return;
  }

  try {
    const payload = {
      title: form.value.title,
      description: form.value.description,
      plannedDate: form.value.plannedDate,
      deadline: form.value.deadline,
      assignedToId: form.value.assignedToId ? parseInt(form.value.assignedToId) : null,
      taskTypeId: form.value.taskTypeId ? parseInt(form.value.taskTypeId) : null
    };

    await taskService.createTask(payload);
    form.value = { title: '', description: '', plannedDate: '', deadline: '', assignedToId: '', taskTypeId: '' };
    fetchTasks();
  } catch (error) {
    console.error("Hata:", error);
    alert(error.response?.data?.message || 'Görev oluşturulurken hata oluştu.');
  }
};

const claimTask = async (task) => {
  try {
    await taskService.claimTask(task.id, currentUser.value?.id);
    fetchTasks();
  } catch (error) {
    console.error('Görev üstlenilemedi:', error);
    alert(error.response?.data?.message || 'Görev üstlenilirken hata oluştu.');
  }
};

const startEditingStatus = (task) => {
  editingStatusId.value = task.id;
  tempStatus.value = task.status || 'Yapılacak';
};

const confirmStatusUpdate = async (id) => {
  await updateTaskStatus(id, tempStatus.value);
  editingStatusId.value = null;
};

const updateTaskStatus = async (id, newStatus) => {
  try {
    await taskService.updateTask(id, { status: newStatus });
    fetchTasks();
  } catch (error) {
    console.error("Güncelleme hatası:", error);
    alert(error.response?.data?.message || 'Görev güncellenirken hata oluştu.');
  }
};

const deleteTask = async (id) => {
  if (confirm("Bu görevi tamamen silmek istediğinize emin misiniz?")) {
    try {
      await taskService.deleteTask(id);
      fetchTasks();
    } catch (error) {
      console.error("Silme hatası:", error);
      alert(error.response?.data?.message || 'Görev silinirken hata oluştu.');
    }
  }
};

onMounted(() => {
  fetchTasks();
  fetchUsers();
  fetchTaskTypes();
});
</script>



<style scoped>

/* GENEL SAYFA TASARIMI */

.app-background { 

  min-height: 100vh; 

  padding: 20px; 

  box-sizing: border-box; 

}

.main-container { 

  max-width: 1200px; 

  margin: 0 auto; 

  display: flex; 

  flex-direction: column; 

  gap: 20px; 

}



/* ÜST BİLGİ PANELİ VE ÇEVRİMİÇİ NOKTASI */

.header-panel { 

  display: flex; 

  justify-content: space-between; 

  align-items: center; 

  padding: 20px; 

}

.user-status-card { 

  display: flex; 

  align-items: center; 

  gap: 10px; 

}

.status-indicator { 

  width: 10px; 

  height: 10px; 

  background-color: #ff8fc0; 

  border-radius: 50%; 

  box-shadow: 0 0 8px #ff8fc0; 

}



/* GÖREV EKLEME FORMU */

.task-form-grid { 

  display: flex; 

  flex-wrap: wrap; 

  gap: 15px; 

  align-items: flex-end; 

}

.task-form-grid > * {

  flex: 1 1 calc(33.333% - 150px);

  min-width: 200px;

}

.date-inputs { 

  display: flex; 

  gap: 10px; 

  width: 100%;

}

.date-inputs > div {

  flex: 1;

}



/* TABLOLAR VE DURUM KUTULARI */

.data-table { 

  width: 100%; 

  border-collapse: collapse; 

  margin-top: 15px; 

  text-align: left; 

}

.data-table th, .data-table td { 

  padding: 12px; 

  border-bottom: 1px solid rgba(255, 143, 192, 0.2); 

}

.status-edit-box { 

  display: flex; 

  flex-direction: column; 

  gap: 5px; 

}

.status-actions { 

  display: flex; 

  gap: 5px; 

}

.empty-state { 

  text-align: center; 

  color: rgba(255,255,255,0.5); 

  padding: 20px; 

}

</style>