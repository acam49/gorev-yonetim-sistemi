import { createApp } from 'vue'
import App from './App.vue'
import axios from 'axios'
import './style.css'

// Vue'dan backend'e giden HER istekte çalışır ve bileti cebinden çıkarıp masaya koyar.
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Backend "Erişim reddedildi / oturum geçersiz" (401) derse,
// bozuk bir ekranda kalmak yerine kullanıcıyı otomatik olarak
// login ekranına geri gönderiyoruz.
//
// ÖNEMLİ: Bu SADECE zaten elimizde bir token varken (yani oturum
// açıkken) ve bu token backend tarafından geçersiz/süresi dolmuş
// sayıldığında çalışmalı. Login ekranındaki "kullanıcı adı/şifre
// hatalı" hatası da 401 döndürüyor ama bu bir oturum sorunu değil,
// normal bir giriş başarısızlığı — bu yüzden login isteğini
// ve elimizde hiç token yokken gelen 401'leri burada YOK SAYIYORUZ,
// Login.vue kendi catch bloğunda bu hatayı zaten ekranda gösteriyor.
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config && error.config.url && error.config.url.includes('/api/users/login');
    const hadToken = !!localStorage.getItem('token');

    if (error.response && error.response.status === 401 && hadToken && !isLoginRequest) {
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

createApp(App).mount('#app')