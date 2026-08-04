<template>
  <div class="landing-custom-bg">
    
    <!-- VİDEO ETİKETİ -->
    <video autoplay loop muted playsinline class="bg-video" :src="videoPath"></video>

    <div class="landing-wrapper">
        
      <!-- ÜST NAVİGASYON -->
      <nav class="glass-panel landing-nav">
        <div class="logo">
          <h2 class="glow-text" style="font-size: 20px; margin: 0; display: flex; align-items: center; gap: 10px;">
            <span class="status-indicator-pink"></span> Master Oogway
          </h2>
        </div>
        <div>
          <button @click="router.push('/login')" class="btn-glow-pink btn-small">Sisteme Giriş</button>
        </div>
      </nav>

      <!-- ANA VİTRİN -->
      <main class="hero-container">
        <div class="hero-text-area">
          <h1 class="hero-title">
            {{ typedText }}<span class="cursor" :class="{ blink: isTypingDone }">_</span>
          </h1>
          <p class="hero-text">
            Görev atamalarını, personel loglarını ve sistem arşivini şeffaf, güvenli ve hızlı bir altyapı ile kontrol edin. İş akışınızı dijitalleştirin.
          </p>
          <!-- BİZE ULAŞIN BUTONU -->
          <button @click="copyEmail" class="btn-glow-pink action-btn">
            {{ contactBtnText }}
          </button>
        </div>

        <!-- DİNAMİK İSTATİSTİK SAYAÇLARI -->
        <div class="stats-container">
          <div class="stat-item">
            <h3 class="stat-number">{{ stats.tasks }}+</h3>
            <p class="stat-label">Yönetilen Görev</p>
          </div>
          <div class="stat-item">
            <h3 class="stat-number">{{ stats.users }}</h3>
            <p class="stat-label">Aktif Personel</p>
          </div>
          <div class="stat-item">
            <h3 class="stat-number">%{{ stats.uptime }}</h3>
            <p class="stat-label">Sistem Kararlılığı</p>
          </div>
        </div>

        <!-- ŞEFFAF, YUVARLAK KÖŞELİ VE PEMBE PARLAYAN KARTLAR -->
        <div class="features-grid">
          <div class="pink-glass-card feature-card">
            <div class="feature-icon"></div>
            <h3 class="feature-title">Hızlı Atama</h3>
            <p class="feature-text">Personellere saniyeler içinde görev tanımlayın, süreçleri anında başlatın.</p>
          </div>
          
          <div class="pink-glass-card feature-card">
            <div class="feature-icon"></div>
            <h3 class="feature-title">Anlık Takip</h3>
            <p class="feature-text">Hangi görevin ne aşamada olduğunu canlı olarak izleyin ve raporlayın.</p>
          </div>
          
          <div class="pink-glass-card feature-card">
            <div class="feature-icon"></div>
            <h3 class="feature-title">Güvenli Altyapı</h3>
            <p class="feature-text">Kriptolanmış veritabanı mimarisiyle operasyon verileriniz her zaman güvende.</p>
          </div>
        </div>
      </main>

      <!-- CAM EFEKTLİ JAPONYA KONSEPTLİ FOOTER -->
      <footer class="glass-footer">
        <div class="footer-content">
          <div class="footer-section">
            <h4 class="footer-title">Master Oogway Global</h4>
            <p class="footer-text">Asya - Pasifik Merkez Ofisi</p>
            <p class="footer-text"> Shibuya, Shibuya City<br>Tokyo 150-0002, Japonya</p>
          </div>
          
          <div class="footer-section">
            <h4 class="footer-title">İletişim</h4>
            <p class="footer-text"><span class="neon-icon"></span> +81 5 2458 1548</p>
            <p class="footer-text"><span class="neon-icon"></span> kyoto@masteroogway.com</p>
          </div>

          <div class="footer-section">
            <h4 class="footer-title">Sosyal Ağlar</h4>
            <div class="social-links">
              <a href="#" class="social-icon">
                <span>LinkedIn</span>
                <span class="social-emoji"></span>
              </a>
              <a href="#" class="social-icon">
                <span>GitHub</span>
                <span class="social-emoji"></span>
              </a>
              <a href="#" class="social-icon">
                <span>Twitter</span>
                <span class="social-emoji"></span>
              </a>
            </div>
          </div>
        </div>

        <div class="footer-divider"></div>

        <div class="footer-bottom">
          <p>© 2026 Master Oogway. Tüm hakları saklıdır. Sakura konsepti ile kodlandı.</p>
        </div>
      </footer>
      
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import videoPath from '../assets/vitrin-video.mp4';

const router = useRouter();

// DAKTİLO (TYPEWRITER) EFEKTİ
const fullText = "Operasyonları Tek Ekrandan Yönetin";
const typedText = ref("");
const isTypingDone = ref(false);

const contactBtnText = ref("Sistemi kullanmak için bize ulaşın");

const copyEmail = async () => {
  try {
    await navigator.clipboard.writeText('abdullaheta1@gmail.com');
    contactBtnText.value = "E-posta Kopyalandı! ";
    setTimeout(() => {
      contactBtnText.value = "Sistemi kullanmak için bize ulaşın";
    }, 2500);
  } catch (err) {
    console.error('Kopyalama başarısız oldu:', err);
    contactBtnText.value = "Kopyalanamadı :(";
  }
};

const typeWriter = () => {
  let i = 0;
  const interval = setInterval(() => {
    if (i < fullText.length) {
      typedText.value += fullText.charAt(i);
      i++;
    } else {
      clearInterval(interval);
      isTypingDone.value = true;
    }
  }, 70); 
};

const stats = ref({ tasks: 0, users: 0, uptime: 0 });

const animateValue = (targetKey, endValue, duration) => {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    stats.value[targetKey] = Math.floor(progress * endValue);
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
};

onMounted(() => {
  typeWriter();
  setTimeout(() => animateValue('tasks', 1250, 2000), 500);
  setTimeout(() => animateValue('users', 42, 2000), 700);
  setTimeout(() => animateValue('uptime', 99, 2000), 900);
});
</script>

<style scoped>
.landing-custom-bg {
  min-height: 100vh;
  width: 100vw;
  background-color: transparent; 
  position: relative; 
  display: flex;
  justify-content: center;
  align-items: flex-start; 
  overflow-y: auto; 
}

.bg-video {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  object-fit: cover; 
  z-index: 0; 
  opacity: 0.5;
  pointer-events: none;
}

.landing-wrapper {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 50px;
  padding: 20px;
  padding-bottom: 60px;
}

.landing-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 30px;
  border-radius: 20px;
  margin-top: 20px;
  background: rgba(10, 20, 30, 0.7);
  border: 1px solid rgba(255, 143, 192, 0.2);
}

.status-indicator-pink {
  width: 12px; height: 12px; 
  background-color: #ff8fc0; 
  border-radius: 50%; 
  box-shadow: 0 0 12px #ff8fc0; 
}

.btn-glow-pink {
  padding: 10px 25px;
  background: rgba(255, 143, 192, 0.1);
  color: #ff8fc0;
  border: 1px solid #ff8fc0;
  border-radius: 12px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}
.btn-glow-pink:hover {
  background: rgba(255, 143, 192, 0.2);
  box-shadow: 0 0 20px rgba(255, 143, 192, 0.4);
  transform: translateY(-2px);
}

.hero-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 60px;
  animation: fade-in-up 1s ease-out forwards;
}

.hero-text-area {
  text-align: center;
  max-width: 800px;
}

.hero-title {
  color: #fdfdfd;
  font-size: 42px;
  margin-bottom: 25px;
  text-shadow: 0 0 20px rgba(255, 143, 192, 0.4);
  min-height: 50px; 
}

.cursor { color: #ff8fc0; font-weight: bold; }
.blink { animation: blink-animation 1s steps(2, start) infinite; }
@keyframes blink-animation { to { visibility: hidden; } }

.hero-text {
  color: rgba(255, 255, 255, 0.6);
  font-size: 17px;
  line-height: 1.7;
  margin-bottom: 40px;
  max-width: 650px;
  margin-left: auto;
  margin-right: auto;
}

.action-btn { font-size: 16px; padding: 16px 45px; border-radius: 16px; }

.stats-container {
  display: flex;
  justify-content: center;
  gap: 80px;
  background: linear-gradient(90deg, transparent, rgba(255, 143, 192, 0.05), transparent);
  padding: 30px;
  border-radius: 20px;
  width: 100%;
}

.stat-item { text-align: center; }
.stat-number {
  font-size: 36px;
  color: #fff;
  margin: 0 0 10px 0;
  text-shadow: 0 0 15px rgba(255,255,255,0.2);
}
.stat-label {
  color: #ff8fc0;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  width: 100%;
}

.pink-glass-card {
  background: rgba(10, 20, 30, 0.4); 
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 143, 192, 0.2); 
  border-radius: 30px; 
  box-shadow: 0 0 25px rgba(255, 143, 192, 0.05); 
  text-align: center;
  padding: 45px 30px;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.pink-glass-card:hover {
  transform: translateY(-12px);
  border-color: rgba(255, 143, 192, 0.6);
  box-shadow: 0 15px 35px rgba(255, 143, 192, 0.2);
  background: rgba(10, 20, 30, 0.6);
}

.feature-icon { font-size: 38px; margin-bottom: 20px; text-shadow: 0 0 15px rgba(255, 143, 192, 0.4); }
.feature-title { color: #fff; font-size: 20px; margin-bottom: 15px; }
.feature-text { color: rgba(255, 255, 255, 0.5); font-size: 14px; line-height: 1.6; }

.glass-footer {
  background: rgba(10, 20, 30, 0.4);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 143, 192, 0.2);
  border-radius: 25px;
  padding: 40px 40px 20px 40px;
  margin-top: 20px;
  animation: fade-in-up 1s ease-out forwards;
  animation-delay: 0.5s;
  opacity: 0;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 30px;
}

.footer-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 200px;
}

.footer-title {
  color: #ff8fc0;
  font-size: 16px;
  margin: 0 0 10px 0;
  text-shadow: 0 0 10px rgba(255, 143, 192, 0.3);
}

.footer-text {
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  margin: 0;
  line-height: 1.5;
}

.neon-icon {
  color: #ff8fc0;
  margin-right: 5px;
  text-shadow: 0 0 8px rgba(255, 143, 192, 0.5);
}

.social-links {
  display: flex;
  gap: 25px;
}

.social-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  font-size: 13px;
  transition: all 0.3s ease;
}

.social-emoji {
  font-size: 18px;
  transition: all 0.3s ease;
}

.social-icon:hover {
  color: #ff8fc0;
  text-shadow: 0 0 10px rgba(255, 143, 192, 0.8);
  transform: translateY(-4px);
}

.social-icon:hover .social-emoji {
  transform: scale(1.2);
}

.footer-divider {
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 143, 192, 0.6), transparent);
  margin: 25px 0 15px 0;
  box-shadow: 0 0 10px rgba(255, 143, 192, 0.4);
}

.footer-bottom {
  text-align: center;
}

.footer-bottom p {
  color: rgba(255, 255, 255, 0.3);
  font-size: 11px;
  margin: 0;
}

@keyframes fade-in-up {
  0% { opacity: 0; transform: translateY(30px); }
  100% { opacity: 1; transform: translateY(0); }
}

@media (max-width: 900px) {
  .features-grid { grid-template-columns: 1fr; }
  .stats-container { flex-direction: column; gap: 40px; }
  .footer-content { flex-direction: column; }
}
</style>