<template>
  <div v-if="show" class="modal-overlay" @click.self="close">
    <div class="glass-panel modal-box">
      <h3 class="glow-text" style="margin-bottom:20px;">Şifremi Değiştir</h3>

      <div style="display:flex; flex-direction:column; gap:12px;">
        <input v-model="pwForm.currentPassword" type="password" placeholder="Mevcut Şifreniz" class="modal-input">
        <input v-model="pwForm.newPassword" type="password" placeholder="Yeni Şifreniz" class="modal-input">

        <div v-if="pwForm.newPassword.length > 0" class="pwd-hints">
          <span :class="pwForm.newPassword.length >= 6 ? 'hint-ok' : 'hint-fail'">✓ En az 6 karakter</span>
          <span :class="/[A-Z]/.test(pwForm.newPassword) ? 'hint-ok' : 'hint-fail'">✓ En az 1 büyük harf</span>
          <span :class="/[0-9]/.test(pwForm.newPassword) ? 'hint-ok' : 'hint-fail'">✓ En az 1 rakam</span>
        </div>

        <input v-model="pwForm.confirmPassword" type="password" placeholder="Yeni Şifrenizi Tekrar Girin" class="modal-input">

        <p v-if="pwError" style="color:var(--color-error, #ff4d4d); font-size:12px; margin:0;">{{ pwError }}</p>
        <p v-if="pwSuccess" style="color:var(--color-success, #2ecc71); font-size:12px; margin:0;">{{ pwSuccess }}</p>

        <div style="display:flex; gap:10px; margin-top:5px;">
          <button @click="handleChangePassword" class="btn-glow" style="flex:1;">Kaydet</button>
          <button @click="close" class="btn-delete" style="flex:1;">İptal</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { authService } from '../../services/authService';
import { validatePassword } from '../../utils/validators';

const props = defineProps({
  show: { type: Boolean, default: false }
});

const emit = defineEmits(['close']);

const pwForm = ref({ currentPassword: '', newPassword: '', confirmPassword: '' });
const pwError = ref('');
const pwSuccess = ref('');

const close = () => {
  pwForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' };
  pwError.value = '';
  pwSuccess.value = '';
  emit('close');
};

const handleChangePassword = async () => {
  pwError.value = '';
  pwSuccess.value = '';

  const ruleError = validatePassword(pwForm.value.newPassword);
  if (ruleError) {
    pwError.value = ruleError;
    return;
  }
  if (pwForm.value.newPassword !== pwForm.value.confirmPassword) {
    pwError.value = 'Yeni şifreler birbiriyle uyuşmuyor.';
    return;
  }

  try {
    await authService.changePassword({
      currentPassword: pwForm.value.currentPassword,
      newPassword: pwForm.value.newPassword
    });
    pwSuccess.value = 'Şifreniz başarıyla güncellendi!';
    setTimeout(() => close(), 1800);
  } catch (error) {
    pwError.value = error.response?.data?.message || 'Bir hata oluştu.';
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.7);
  display: flex; align-items: center; justify-content: center; z-index: 999;
}
.modal-box { width: 100%; max-width: 380px; padding: 30px; }
.modal-input {
  width: 100%; padding: 11px; background: rgba(0,0,0,0.3);
  border: 1px solid var(--color-glass-border, rgba(255,143,192,0.2)); border-radius: var(--radius-sm, 8px);
  color: #fff; font-size: 13px; outline: none; box-sizing: border-box;
}
.modal-input:focus { border-color: var(--color-pink, #ff8fc0); }
.pwd-hints { display: flex; flex-direction: column; gap: 4px; }
.hint-ok { font-size: 11px; color: var(--color-success, #2ecc71); }
.hint-fail { font-size: 11px; color: var(--color-text-subtle, rgba(255,255,255,0.35)); }
</style>
