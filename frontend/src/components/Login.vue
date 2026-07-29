<template>
  <div class="app-background">
    <div class="login-wrapper">
      <div class="glass-panel login-box">
        <h1 class="glow-text" style="text-align:center; margin-bottom: 5px;">Görev Yönetim Sistemi</h1>
        
        <!-- BAŞLIK DİNAMİKLEŞTİ: İlk girişse farklı, normalse farklı yazı -->
        <p class="login-subtitle">
          {{ isFirstLogin ? 'Güvenliğiniz için kalıcı şifrenizi belirleyin.' : 'Sisteme Giriş Yap' }}
        </p>

        <!-- 1. DURUM: NORMAL GİRİŞ FORMU -->
        <form v-if="!isFirstLogin" @submit.prevent="handleLogin" class="login-form">
          <!-- İsim Soyisim yerine artık Kullanıcı Adı ile giriş yapılıyor -->
          <input v-model="form.username" type="text" placeholder="Kullanıcı Adı" required>
          <input v-model="form.password" type="password" placeholder="Şifre" required>

          <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
          <!-- Başarılı şifre değiştirme sonrası çıkacak yeşil mesaj -->
          <p v-if="successMessage" style="color: #2ecc71; font-size: 12px; margin:0; text-align:center;">
            {{ successMessage }}
          </p>

          <button type="submit" class="btn-glow" style="width:100%;" :disabled="loading">
            {{ loading ? 'Lütfen bekleyin...' : 'Giriş Yap' }}
          </button>
          
          <button type="button" @click="$emit('go-home')" class="btn-back">
            ← Ana Sayfaya Dön
          </button>
        </form>

        <!-- 2. DURUM: İLK GİRİŞ ŞİFRE DEĞİŞTİRME FORMU (GÜVENLİK KALKANI) -->
        <form v-else @submit.prevent="handlePasswordChange" class="login-form">
          <input v-model="newPassword" type="password" placeholder="Yeni Kalıcı Şifreniz" required minlength="6">
          <!-- Anlık şifre kural göstergesi -->
          <div v-if="newPassword.length > 0" class="pwd-hints">
            <span :class="newPassword.length >= 6 ? 'hint-ok' : 'hint-fail'">✓ En az 6 karakter</span>
            <span :class="/[A-Z]/.test(newPassword) ? 'hint-ok' : 'hint-fail'">✓ En az 1 büyük harf</span>
            <span :class="/[0-9]/.test(newPassword) ? 'hint-ok' : 'hint-fail'">✓ En az 1 rakam</span>
          </div>
          <input v-model="confirmPassword" type="password" placeholder="Şifrenizi Tekrar Girin" required minlength="6">

          <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

          <button type="submit" class="btn-glow btn-ok" style="width:100%;" :disabled="loading">
            {{ loading ? 'Güncelleniyor...' : 'Şifremi Onayla ve Kaydet' }}
          </button>
        </form>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

const emit = defineEmits(['login-success', 'go-home']);

const loading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');
const form = ref({ username: '', password: '' });

// YENİ: Şifre Değiştirme Ekranı İçin Gerekli Değişkenler
const isFirstLogin = ref(false);
const tempUserId = ref(null);
const newPassword = ref('');
const confirmPassword = ref('');

const handleLogin = async () => {
  errorMessage.value = '';
  successMessage.value = '';

  // Kullanıcı adının başındaki/sonundaki boşlukları sil,
  // sadece boşluktan oluşuyorsa hiç gönderme
  form.value.username = form.value.username.trim();
  if (!form.value.username) {
    errorMessage.value = 'Kullanıcı adı boş bırakılamaz.';
    return;
  }

  loading.value = true;
  try {
    const response = await axios.post('http://localhost:3000/api/users/login', form.value);
    
    // YENİ GÜVENLİK KONTROLÜ: Eğer backend "şifre değişmeli" derse içeri alma, formu değiştir!
    if (response.data.requiresPasswordChange) {
      isFirstLogin.value = true;
      tempUserId.value = response.data.userId; // Şifre değiştirirken kim olduğunu bilmek için ID'yi sakla
      loading.value = false;
      return; 
    }

    // Normal girişse JWT Biletini kaydet ve içeri al
    localStorage.setItem('token', response.data.token);
    emit('login-success', response.data.user);
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Giriş yapılamadı, sunucuya ulaşılamıyor';
  } finally {
    loading.value = false;
  }
};

// YENİ: Kalıcı Şifre Belirleme Fonksiyonu
// Şifre kural kontrolü: en az 6 karakter, 1 büyük harf, 1 rakam
const validatePassword = (pwd) => {
  if (pwd.length < 6) return 'Şifre en az 6 karakter olmalıdır.';
  if (!/[A-Z]/.test(pwd)) return 'Şifre en az 1 büyük harf içermelidir.';
  if (!/[0-9]/.test(pwd)) return 'Şifre en az 1 rakam içermelidir.';
  return null;
};

const handlePasswordChange = async () => {
  errorMessage.value = '';

  // Kural kontrolü
  const ruleError = validatePassword(newPassword.value);
  if (ruleError) {
    errorMessage.value = ruleError;
    return;
  }

  // Şifre eşleşme kontrolü
  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = 'Girdiğiniz şifreler birbiriyle uyuşmuyor!';
    return;
  }

  loading.value = true;
  try {
    // Backend'de yazdığımız yeni rotaya istek atıyoruz
    const response = await axios.post('http://localhost:3000/api/users/change-first-password', {
      userId: tempUserId.value,
      newPassword: newPassword.value
    });

    // Şifre başarıyla değiştiyse:
    isFirstLogin.value = false; // Normal giriş formuna geri dön
    successMessage.value = response.data.message; // "Şimdi yeni şifrenizle girebilirsiniz" mesajını göster
    
    // Eski geçici şifreyi formdan sil ki adam yeni şifresini yazıp girebilsin
    form.value.password = ''; 
    newPassword.value = '';
    confirmPassword.value = '';
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Şifre güncellenirken bir hata oluştu.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* Mevcut CSS Kodların - Hiçbir Şeyi Bozmadık */
.login-wrapper { min-height: 100vh; width: 100%; display: flex; align-items: center; justify-content: center; }
.login-box { width: 100%; max-width: 380px; }
.login-subtitle { color: rgba(255,255,255,0.5); font-size: 12px; text-align: center; margin-bottom: 25px; }
.login-form { display: flex; flex-direction: column; gap: 15px; }
.login-form input { padding: 12px; background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 143, 192, 0.2); border-radius: 8px; color: #fff; font-size: 13px; outline: none; }
.login-form input:focus { border-color: #ff8fc0; box-shadow: 0 0 10px rgba(255, 143, 192, 0.2); }
.error-text { color: #ff4d4d; font-size: 12px; margin: 0; text-align: center; }
.btn-back { background: transparent; border: none; color: rgba(255, 143, 192, 0.7); font-size: 12px; cursor: pointer; padding: 5px; margin-top: 5px; transition: all 0.3s ease; text-align: center; }
.btn-back:hover { color: #ff8fc0; text-shadow: 0 0 10px rgba(255, 143, 192, 0.5); transform: translateX(-3px); }
.btn-ok { background: rgba(46, 204, 113, 0.1); color: #2ecc71; border: 1px solid rgba(46, 204, 113, 0.4); }
.pwd-hints { display: flex; flex-direction: column; gap: 4px; }
.hint-ok  { font-size: 11px; color: #2ecc71; }
.hint-fail { font-size: 11px; color: rgba(255,255,255,0.35); }
.btn-ok:hover { background: rgba(46, 204, 113, 0.2); box-shadow: 0 0 10px rgba(46, 204, 113, 0.4); }
</style>