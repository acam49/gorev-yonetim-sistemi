<template>
  <!-- SAKURA YAPRAKLARI: Sadece Karşılama (landing) sayfasında DEĞİLSE görünsün -->
  <div class="sakura-layer" aria-hidden="true" v-if="currentView !== 'landing'">
    <span
      v-for="p in petals"
      :key="p.id"
      class="petal"
      :style="{
        left: p.left + '%',
        width: p.size + 'px',
        height: p.size + 'px',
        animationDelay: p.delay + 's',
        animationDuration: p.duration + 's',
        '--drift': p.drift + 'px',
        '--spin': p.spin + 'deg'
      }"
    ></span>
  </div>

  <!-- 1. Karşılama Sayfası -->
  <LandingView
    v-if="!currentUser && currentView === 'landing'"
    @go-login="goTo('login')"
  />

  <!-- 2. Login Sayfası (DÜZELTİLEN KISIM BURASI: @go-home eklendi) -->
  <Login
    v-else-if="!currentUser && currentView === 'login'"
    @login-success="handleLoginSuccess"
    @go-home="goTo('landing')"
  />

  <!-- 3. Ana Panel (Giriş yapılmışsa) -->
  <Dashboard
    v-else-if="currentUser && currentView === 'dashboard'"
    :current-user="currentUser"
    @navigate="goTo"
    @logout="handleLogout"
  />

  <!-- 4. Görev Yönetimi (Giriş yapılmışsa) -->
  <TaskManager
    v-else-if="currentUser && currentView === 'tasks'"
    :current-user="currentUser"
    @go-home="goTo('dashboard')"
    @logout="handleLogout"
  />

  <!-- 5. Personel Yönetimi (Giriş yapılmışsa) -->
  <Personnel
    v-else-if="currentUser && currentView === 'personnel'"
    @go-home="goTo('dashboard')"
  />

  <!-- 6. Sistem Geçmişi (Giriş yapılmışsa ve sadece yetkililer için) -->
  <SystemLogs
    v-else-if="currentUser && currentView === 'logs'"
    :current-user="currentUser"
    @go-home="goTo('dashboard')"
  />

  <!-- 7. Görev Türleri Yönetimi (Sadece Müdür/Admin) -->
  <TaskTypes
    v-else-if="currentUser && currentView === 'task-types'"
    @go-home="goTo('dashboard')"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

// BÜTÜN SAYFALARIN İMPORT EDİLDİĞİ KISIM
import LandingView from './components/LandingView.vue';
import Login from './components/Login.vue';
import Dashboard from './components/Dashboard.vue';
import TaskManager from './components/TaskManager.vue';
import Personnel from './components/Personnel.vue'
import TaskTypes from './components/TaskTypes.vue';
import SystemLogs from './components/SystemLogs.vue';

const currentUser = ref(null);
const currentView = ref('landing'); // Sistemin ilk açılış noktası

const petals = ref(
  Array.from({ length: 22 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    size: 8 + Math.random() * 10,
    delay: Math.random() * 18,
    duration: 10 + Math.random() * 12,
    drift: Math.random() * 160 - 80,
    spin: Math.random() * 360
  }))
);

const handleLoginSuccess = (user) => {
  currentUser.value = user;
  localStorage.setItem('currentUser', JSON.stringify(user));
  currentView.value = 'dashboard';
};

const handleLogout = async () => {
  try {
    await axios.put(`http://localhost:3000/api/users/logout/${currentUser.value.id}`);
  } catch (error) {
    console.error('Çıkış hatası:', error);
  }
  currentUser.value = null;
  currentView.value = 'landing';
  localStorage.removeItem('currentUser');
  
  // JWT token'ı sil
  localStorage.removeItem('token');
};

const goTo = (view) => {
  currentView.value = view;
};

onMounted(() => {
  const savedUser = localStorage.getItem('currentUser');
  if (savedUser) {
    currentUser.value = JSON.parse(savedUser);
    currentView.value = 'dashboard'; // Hafızada kullanıcı varsa ana panele atla
  }
});
</script>

<style>
/* App.vue içindeki mevcut CSS kodlarında hiçbir değişiklik yapılmadı. */
html, body, #app { margin: 0; padding: 0; width: 100%; height: 100%; overflow-x: hidden; background-color: #0a0e17; }
* { box-sizing: border-box; font-family: 'Segoe UI', sans-serif; }

.app-background {
  min-height: 100vh; width: 100vw; background-color: #0a0e17;
  background-image: radial-gradient(circle at top right, rgba(255, 143, 192, 0.08), transparent 40%),
                    radial-gradient(circle at bottom left, rgba(255, 143, 192, 0.08), transparent 40%),
                    url('./assets/arkaplan.jpg'); 
  background-size: cover; background-position: center; background-attachment: fixed;
  padding: 40px; display: flex; justify-content: center;
}

.main-container { width: 100%; max-width: 1400px; display: flex; flex-direction: column; gap: 25px; }

.glass-panel {
  background: rgba(10, 20, 30, 0.7); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 143, 192, 0.2); border-radius: 16px; padding: 25px;
  box-shadow: 0 0 20px rgba(255, 143, 192, 0.1);
  animation: panel-rise 0.5s ease both;
}

/* SAKURA YAPRAĞI ANİMASYONU */
.sakura-layer {
  position: fixed; inset: 0; width: 100vw; height: 100vh;
  pointer-events: none; overflow: hidden; z-index: 999;
}
.petal {
  position: absolute;
  top: -8%;
  background: linear-gradient(135deg, #ffe1ef 0%, #ff9ecb 55%, #ff6fa8 100%);
  border-radius: 0% 70% 0% 70%;
  opacity: 0;
  box-shadow: 0 0 6px rgba(255, 143, 192, 0.5);
  animation-name: sakura-fall;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}
@keyframes sakura-fall {
  0%   { transform: translateY(-10vh) translateX(0) rotate(0deg); opacity: 0; }
  8%   { opacity: 0.85; }
  100% { transform: translateY(110vh) translateX(var(--drift)) rotate(var(--spin)); opacity: 0.15; }
}

/* GEÇİŞ (EKRAN DEĞİŞİMİ) ANİMASYONU */
.fade-enter-active, .fade-leave-active { transition: opacity 0.35s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@keyframes panel-rise {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}

.panel-title { color: #ff8fc0; font-size: 14px; font-weight: bold; margin-bottom: 20px; border-bottom: 1px solid rgba(255, 143, 192, 0.2); padding-bottom: 10px; }
.header-panel { display: flex; justify-content: space-between; align-items: center; }
.glow-text { color: #fff; text-shadow: 0 0 10px rgba(255, 255, 255, 0.3); margin: 0; }
.user-status-card { display: flex; align-items: center; gap: 15px; background: rgba(0, 0, 0, 0.3); padding: 10px 20px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); }
.status-indicator { width: 12px; height: 12px; background-color: #ff8fc0; border-radius: 50%; box-shadow: 0 0 10px #ff8fc0; animation: pulse-glow 2s ease-in-out infinite; }
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 6px #ff8fc0; opacity: 1; }
  50%      { box-shadow: 0 0 16px #ff8fc0; opacity: 0.6; }
}
.user-details { display: flex; flex-direction: column; color: #fff; font-size: 13px; }

/* FORM VE TARİH KUTULARI */
.task-form-grid { display: grid; grid-template-columns: 1fr 1fr 1.5fr auto; gap: 15px; align-items: end;}
.task-form-grid input { padding: 12px; background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 143, 192, 0.2); border-radius: 8px; color: #fff; font-size: 13px; outline: none; }
.task-form-grid input:focus { border-color: #ff8fc0; box-shadow: 0 0 10px rgba(255, 143, 192, 0.2); }
.date-inputs { display: flex; gap: 10px; }
.date-inputs label { font-size: 11px; color: rgba(255,255,255,0.6); display: block; margin-bottom: 4px; }
.btn-glow { padding: 12px 25px; background: rgba(255, 143, 192, 0.1); color: #ff8fc0; border: 1px solid #ff8fc0; border-radius: 8px; font-weight: bold; cursor: pointer; transition: all 0.3s; height: 43px;}
.btn-glow:hover { background: rgba(255, 143, 192, 0.2); box-shadow: 0 0 15px rgba(255, 143, 192, 0.4); }

/* TABLOLAR */
.data-table { width: 100%; border-collapse: collapse; font-size: 13px; text-align: left; }
.data-table th { color: rgba(255,255,255,0.5); padding: 15px 10px; border-bottom: 1px solid rgba(255, 143, 192, 0.2); }
.data-table td { padding: 15px 10px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
.empty-state { text-align:center; color: rgba(255,255,255,0.4); padding: 20px; }

/* DURUM MENÜSÜ */
.status-badge { 
  background: rgba(255, 143, 192, 0.1); color: #ff8fc0; border: 1px solid rgba(255, 143, 192, 0.3); 
  padding: 6px 12px; border-radius: 20px; font-size: 11px; cursor: pointer; transition: 0.3s; 
  display: inline-block; font-weight: bold;
}
.status-badge:hover { background: rgba(255, 143, 192, 0.2); box-shadow: 0 0 10px rgba(255, 143, 192, 0.3); }

.status-edit-box { display: flex; align-items: center; gap: 5px; }
.status-dropdown { background: rgba(0,0,0,0.8); color: #fff; border: 1px solid #ff8fc0; padding: 4px 8px; border-radius: 6px; outline: none; font-size: 11px;}

.status-actions button { 
  border-radius: 4px; 
  padding: 4px 10px; 
  cursor: pointer; 
  font-weight: bold;
  font-size: 11px;
  transition: all 0.3s;
}

.btn-ok { 
  background: rgba(46, 204, 113, 0.1); 
  color: #2ecc71; 
  border: 1px solid rgba(46, 204, 113, 0.4); 
}
.btn-ok:hover { background: rgba(46, 204, 113, 0.2); box-shadow: 0 0 10px rgba(46, 204, 113, 0.4); }

.btn-cancel { background: rgba(231, 76, 60, 0.1); color: #e74c3c; border: 1px solid rgba(231, 76, 60, 0.4); }
.btn-cancel:hover { background: rgba(231, 76, 60, 0.2); box-shadow: 0 0 10px rgba(231, 76, 60, 0.4); }

/* SİL BUTONU EFEKTLERİ */
.btn-delete { 
  background: rgba(255, 77, 77, 0.1); color: #ff4d4d; border: 1px solid rgba(255, 77, 77, 0.4); 
  padding: 4px 10px; border-radius: 6px; cursor: pointer; transition: 0.3s; 
  font-size: 11px; font-weight: bold;
}
.btn-delete:hover { background: rgba(255, 77, 77, 0.2); box-shadow: 0 0 10px rgba(255, 77, 77, 0.4); }
/* ARŞİV TABLOSU EFEKTLERİ */
.archived-row td { text-decoration: line-through; color: rgba(255, 255, 255, 0.3) !important; transition: 0.3s; }
.archived-row:hover td { opacity: 1; color: rgba(255, 255, 255, 0.5) !important; }
.status-badge-done { background: rgba(46, 204, 113, 0.1); color: #2ecc71; border: 1px solid #2ecc71; padding: 4px 10px; border-radius: 20px; font-size: 11px; text-decoration: none !important; display: inline-block; margin-right: 10px;}
.btn-undo { background: transparent; color: #e74c3c; border: 1px solid #e74c3c; padding: 3px 8px; border-radius: 4px; font-size: 10px; cursor: pointer;}
.btn-undo:hover { background: #e74c3c; color: white; }
</style>