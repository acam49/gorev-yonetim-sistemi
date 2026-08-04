<template>
  <div class="app-background">
    <!-- ARKA PLANI VE ORTALAMAYI SAĞLAYAN ANA KUTU EKLENDİ -->
    <div class="main-container">
      
      <!-- ÜST BİLGİ VE GERİ DÖN BUTONU -->
      <div class="header-panel glass-panel">
        <div>
          <h2 class="panel-title" style="margin: 0; border: none; padding: 0;">Personel Yönetimi</h2>
          <p style="color: rgba(255,255,255,0.5); font-size: 12px; margin: 5px 0 0 0;">
            Sisteme kayıtlı tüm personelleri buradan yönetebilirsiniz. Şifreler güvenlik gereği sistem tarafından otomatik atanır.
          </p>
        </div>
        <button @click="router.push('/dashboard')" class="btn-glow" style="padding: 8px 15px; font-size: 12px;">Ana Panele Dön</button>
      </div>

      <!-- PERSONEL EKLEME / GÜNCELLEME FORMU -->
      <div class="glass-panel">
        <h3 class="panel-title">{{ isEditing ? 'Personel Bilgilerini Güncelle' : 'Yeni Personel Kaydet' }}</h3>
        
        <form @submit.prevent="handleSubmit" class="personnel-form-grid">
          
          <div class="input-group">
            <input v-model="form.fullName" type="text" placeholder="İsim Soyisim" required>
          </div>
          
          <!-- YENİ EKLENEN ALAN: Kullanıcı Adı -->
          <div class="input-group">
            <input v-model="form.username" type="text" placeholder="Kullanıcı Adı (Benzersiz)" required @input="form.username = form.username.replace(/ /g, '')">
          </div>
          
          <div class="input-group">
            <!-- TC NO: maxlength ile 11'de durduruluyor -->
            <input v-model="form.tcNo" type="text" placeholder="TC Kimlik No" maxlength="11" required>
          </div>  

          <div class="input-group">
            <input v-model="form.email" type="email" placeholder="E-Posta Adresi" required>
          </div>

          <div class="input-group">
            <input v-model="form.role" type="text" placeholder="Mevki / Departman" required>
          </div>

          <!-- ŞİFRE ALANI GÜVENLİK GEREĞİ TAMAMEN KALDIRILDI -->

          <div class="form-actions">
            <button type="submit" class="btn-glow btn-ok">
              {{ isEditing ? 'Güncelle' : 'Kaydet ve Mail Gönder' }}
            </button>
            <button type="button" v-if="isEditing" @click="cancelEdit" class="btn-cancel" style="margin-left: 10px; padding: 10px 15px;">
              İptal
            </button>
          </div>
        </form>
        <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
      </div>

      <!-- KAYITLI PERSONELLER TABLOSU -->
      <div class="glass-panel">
        <table class="data-table">
          <thead>
            <tr>
              <th>İsim Soyisim</th>
              <th>Kullanıcı Adı</th>
              <th>TC Kimlik No</th>
              <th>E-Posta</th>
              <th>Mevki</th>
              <th style="text-align: right;">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="personnelList.length === 0">
              <td colspan="6" class="empty-state">Henüz sisteme kayıtlı personel bulunmuyor.</td>
            </tr>
            <tr v-for="person in personnelList" :key="person.id">
              <td style="color: #fff; font-weight: bold;">{{ person.fullName }}</td>
              <td style="color: #00f2ff;">@{{ person.username }}</td>
              <td style="color: rgba(255, 255, 255, 0.7);">{{ person.tcNo }}</td>
              <td style="color: rgba(255, 255, 255, 0.7);">{{ person.email }}</td>
              
              <td><span class="status-badge">{{ person.role }}</span></td>
              <td style="text-align: right; display: flex; gap: 10px; justify-content: flex-end;">
                <button @click="editPerson(person)" class="btn-action btn-edit">Düzenle</button>
                <button @click="deletePerson(person.id)" class="btn-action btn-delete">Sil</button>
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
import { useRouter } from 'vue-router';
import { userService } from '../services/userService';

const router = useRouter();

const personnelList = ref([]);
const isEditing = ref(false);
const currentEditId = ref(null);
const errorMessage = ref('');

const form = ref({
  fullName: '',
  username: '',
  tcNo: '',
  email: '',
  role: ''
});

const fetchPersonnel = async () => {
  try {
    personnelList.value = await userService.getUsers();
  } catch (error) {
    console.error('Personel listesi alınamadı:', error);
  }
};

const handleSubmit = async () => {
  errorMessage.value = '';

  if (form.value.tcNo.length !== 11 || !/^\d+$/.test(form.value.tcNo)) {
    errorMessage.value = "Kayıt işlemi başarısız. Lütfen bilgileri kontrol ediniz.";
    return;
  }

  try {
    if (isEditing.value) {
      await userService.updateUser(currentEditId.value, form.value);
    } else {
      await userService.registerUser(form.value);
      alert("Personel başarıyla kaydedildi! Geçici şifre mail adresine gönderildi.");
    }
    
    resetForm();
    fetchPersonnel();
  } catch (error) {
    if (error.response && error.response.status === 409) {
      errorMessage.value = error.response.data.message;
    } else {
      errorMessage.value = "Bir hata oluştu, sunucuya ulaşılamıyor.";
    }
    console.error(error);
  }
};

const editPerson = (person) => {
  isEditing.value = true;
  currentEditId.value = person.id;
  form.value = { 
    fullName: person.fullName, 
    username: person.username,
    tcNo: person.tcNo, 
    email: person.email, 
    role: person.role
  };
};

const cancelEdit = () => {
  resetForm();
};

const resetForm = () => {
  isEditing.value = false;
  currentEditId.value = null;
  errorMessage.value = '';
  form.value = { fullName: '', username: '', tcNo: '', email: '', role: '' };
};

const deletePerson = async (id) => {
  if (confirm('Bu personeli sistemden silmek istediğinize emin misiniz?')) {
    try {
      await userService.deleteUser(id);
      fetchPersonnel();
    } catch (error) {
      console.error('Silme işlemi başarısız:', error);
    }
  }
};

onMounted(() => {
  fetchPersonnel();
});
</script>

<style scoped>
.personnel-form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  align-items: end;
  margin-bottom: 10px;
}

.input-group {
  display: flex;
  flex-direction: column;
}

.personnel-form-grid input {
  padding: 12px;
  background: rgba(5, 5, 5, 0.3);
  border: 1px solid rgba(255, 143, 192, 0.2);
  border-radius: 8px;
  color: #fff;
  font-size: 13px;
  outline: none;
  transition: all 0.3s;
}

.personnel-form-grid input:focus {
  border-color: #ff8fc0;
  box-shadow: 0 0 10px rgba(255, 143, 192, 0.2);
}

.form-actions {
  display: flex;
}

.btn-ok {
  width: 100%;
  padding: 12px 20px;
}

.btn-action {
  border-radius: 6px;
  padding: 6px 15px;
  cursor: pointer;
  font-weight: bold;
  font-size: 11px;
  transition: all 0.3s;
}

.btn-edit {
  background: rgba(33, 42, 43, 0.1);
  color: #00f2ff;
  border: 1px solid rgba(0, 242, 255, 0.4);
}
.btn-edit:hover {
  background: rgba(0, 242, 255, 0.2);
  box-shadow: 0 0 10px rgba(0, 242, 255, 0.4);
}

.error-text {
  color: #ff4d4d;
  font-size: 12px;
  margin-top: 15px;
}
</style>