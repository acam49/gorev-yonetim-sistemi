<template>
  <div class="app-background">
    <div class="main-container">

      <header class="glass-panel header-panel">
        <div>
          <h1 class="glow-text">Görev Türleri Yönetimi</h1>
          <p style="color:rgba(255,255,255,0.5); font-size:12px; margin-top:5px;">Görev atarken seçilecek türleri buradan tanımlayın.</p>
        </div>
        <button @click="$emit('go-home')" class="btn-glow">Ana Sayfa</button>
      </header>

      <!-- YENİ TÜR EKLEME -->
      <div class="glass-panel">
        <h3 class="panel-title">YENİ GÖREV TÜRÜ EKLE</h3>
        <div class="form-row">
          <input v-model="form.name" type="text" placeholder="Tür Adı (örn: Uçak Bakımı)" class="flex-input">
          <button @click="addType" class="btn-glow">Ekle</button>
        </div>
        <p v-if="errorMsg" style="color:#ff4d4d; font-size:12px; margin-top:8px;">{{ errorMsg }}</p>
      </div>

      <!-- TÜR LİSTESİ -->
      <div class="glass-panel">
        <h3 class="panel-title">TANIMLI GÖREV TÜRLERİ</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>Tür Adı</th>
              <th style="text-align:right;">İşlem</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="types.length === 0">
              <td colspan="2" class="empty-state">Henüz görev türü tanımlanmamış.</td>
            </tr>
            <tr v-for="t in types" :key="t.id">
              <td style="color:#fff; font-weight:bold;">{{ t.name }}</td>
              <td style="text-align:right;">
                <button @click="deleteType(t.id)" class="btn-delete">Sil</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

defineEmits(['go-home']);

const types = ref([]);
const form = ref({ name: '' });
const errorMsg = ref('');

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: { Authorization: `Bearer ${token}` }
  };
};

const fetchTypes = async () => {
  try {
    const res = await axios.get('http://localhost:3000/api/task-types', getAuthHeaders());
    types.value = res.data;
  } catch (e) { console.error(e); }
};

const addType = async () => {
  errorMsg.value = '';
  if (!form.value.name.trim()) { errorMsg.value = 'Tür adı boş olamaz.'; return; }
  try {
    await axios.post('http://localhost:3000/api/task-types', { name: form.value.name.trim() }, getAuthHeaders());
    form.value = { name: '' };
    fetchTypes();
  } catch (e) {
    errorMsg.value = e.response?.data?.message || 'Bir hata oluştu.';
  }
};

const deleteType = async (id) => {
  if (!confirm('Bu görev türünü silmek istediğinize emin misiniz?')) return;
  try {
    await axios.delete(`http://localhost:3000/api/task-types/${id}`, getAuthHeaders());
    fetchTypes();
  } catch (e) { console.error(e); }
};

onMounted(fetchTypes);
</script>

<style scoped>
.app-background { min-height:100vh; padding:20px; box-sizing:border-box; }
.main-container { max-width:900px; margin:0 auto; display:flex; flex-direction:column; gap:20px; }
.header-panel { display:flex; justify-content:space-between; align-items:center; padding:20px; }
.form-row { display:flex; gap:12px; align-items:center; flex-wrap:wrap; }
.flex-input { 
  flex:1; 
  min-width:180px; 
  padding: 12px; 
  background: rgba(0, 0, 0, 0.3); 
  border: 1px solid rgba(255, 143, 192, 0.2); 
  border-radius: 8px; 
  color: #fff; 
  font-size: 13px; 
  outline: none; 
}
.flex-input:focus { 
  border-color: #ff8fc0; 
  box-shadow: 0 0 10px rgba(255, 143, 192, 0.2); 
}
.data-table { width:100%; border-collapse:collapse; margin-top:15px; }
.data-table th, .data-table td { padding:12px; border-bottom:1px solid rgba(255,143,192,0.2); }
.empty-state { text-align:center; color:rgba(255,255,255,0.5); padding:20px; }
</style>