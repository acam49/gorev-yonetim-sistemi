<template>
  <div class="app-background">
    <div class="main-container">

      <!-- ÜST PANEL -->
      <header class="glass-panel header-panel">
        <div>
          <h1 class="glow-text">Sistem Geçmişi (Loglar)</h1>
          <p style="color: rgba(255,255,255,0.5); font-size: 12px; margin-top: 5px;">Tüm sistem hareketleri kronolojik olarak listelenmektedir.</p>
        </div>
        <div class="user-status-card">
          <button @click="$emit('go-home')" class="btn-glow">Ana Sayfa</button>
        </div>
      </header>

      <!-- LOG TABLOSU -->
      <div class="glass-panel">
        <h3 class="panel-title">HAREKET DÖKÜMÜ</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>Tarih / Saat</th>
              <th>Kullanıcı (Yetki)</th>
              <th>Yapılan İşlem</th>
              <th>Sistem Detayı</th>
              <th style="text-align: right;">İşlem</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="logs.length === 0">
              <td colspan="5" class="empty-state">Henüz sistemde hiçbir hareket kaydedilmedi.</td>
            </tr>
            <tr v-for="log in logs" :key="log.id">
              <td style="color: #ff8fc0; font-size: 12px; font-weight: bold;">
                {{ new Date(log.createdAt).toLocaleString('tr-TR') }}
              </td>
              <td style="color: #fff;">
                {{ log.actorName || (log.user ? (log.user.fullName || log.user.username) : 'Bilinmeyen Kullanıcı') }} <br>
                <small style="color: rgba(255,255,255,0.5);">{{ log.actorRole || (log.user ? log.user.role : '-') }}</small>
              </td>
              <td style="color: #e1b12c; font-weight: bold;">{{ log.action }}</td>
              <td style="color: rgba(255,255,255,0.7); font-size: 12px;">{{ log.details || '-' }}</td>
              <td style="text-align: right;">
                <button @click="deleteLog(log.id)" class="btn-delete">Sil</button>
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
import { logService } from '../services/logService';

defineEmits(['go-home']);

const logs = ref([]);

const fetchLogs = async () => {
  try {
    logs.value = await logService.getLogs();
  } catch (error) {
    console.error("Loglar alınamadı:", error);
  }
};

onMounted(() => {
  fetchLogs();
});

const deleteLog = async (id) => {
  if (confirm('Bu log kaydını kalıcı olarak silmek istediğinize emin misiniz?')) {
    try {
      await logService.deleteLog(id);
      fetchLogs();
    } catch (error) {
      console.error('Log silinemedi:', error);
    }
  }
};
</script>