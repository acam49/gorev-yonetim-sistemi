<template>
  <aside class="glass-panel sidebar">
    <h2 class="glow-text" style="font-size:18px; margin-bottom: 30px;">Görev Yönetim Sistemi</h2>

    <nav class="side-menu">
      <!-- Görevler Menüsü -->
      <div class="menu-item" @click="tasksMenuOpen = !tasksMenuOpen">
        <span>Görevler</span>
        <span class="menu-arrow" :class="{ open: tasksMenuOpen }">▾</span>
      </div>
      <div v-if="tasksMenuOpen" class="submenu">
        <div class="submenu-item" @click="router.push('/tasks')">Görev Yönetimi</div>
      </div>

      <!-- Yönetim Menüsü (SADECE MÜDÜR VE ADMİN GÖREBİLİR) -->
      <div class="menu-item" @click="adminMenuOpen = !adminMenuOpen" v-if="hasAdminAccess">
        <span>Yönetim</span>
        <span class="menu-arrow" :class="{ open: adminMenuOpen }">▾</span>
      </div>
      <div v-if="adminMenuOpen && hasAdminAccess" class="submenu">
        <div class="submenu-item" @click="router.push('/personnel')">Personel Yönetimi</div>
        <div class="submenu-item" @click="router.push('/task-types')">Görev Türleri</div>
        <div class="submenu-item" @click="router.push('/logs')">Sistem Geçmişi</div>
      </div>
    </nav>

    <button @click="$emit('open-password-modal')" class="btn-glow" style="width:100%; margin-top:10px; font-size:12px;">Şifremi Değiştir</button>
    <button @click="$emit('logout')" class="btn-delete" style="width:100%; margin-top: 10px;">Çıkış Yap</button>
  </aside>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

defineProps({
  hasAdminAccess: { type: Boolean, default: false }
});

defineEmits(['open-password-modal', 'logout']);

const router = useRouter();
const tasksMenuOpen = ref(false);
const adminMenuOpen = ref(false);
</script>

<style scoped>
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
  color: var(--color-pink, #ff8fc0);
  cursor: pointer;
  border-radius: var(--radius-sm, 8px);
  font-size: 13px;
  font-weight: bold;
}
.menu-item:hover { background: rgba(255, 143, 192, 0.1); }

.menu-arrow { transition: transform 0.2s; }
.menu-arrow.open { transform: rotate(180deg); }

.submenu { padding-left: 15px; margin-bottom: 10px; }
.submenu-item {
  padding: 10px;
  color: var(--color-text-muted, rgba(255,255,255,0.7));
  cursor: pointer;
  font-size: 12px;
  border-radius: 6px;
}
.submenu-item:hover { background: rgba(255, 143, 192, 0.08); color: var(--color-pink, #ff8fc0); }
</style>
