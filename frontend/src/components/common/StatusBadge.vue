<template>
  <span :class="badgeClass" :style="customStyle">
    {{ status }}
  </span>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  status: { type: String, default: 'Yapılacak' },
  isDone: { type: Boolean, default: false }
});

const badgeClass = computed(() => {
  if (props.isDone || props.status === 'Tamamlandı') {
    return 'status-badge-done';
  }
  return 'status-badge';
});

const customStyle = computed(() => {
  if (props.status === 'Hata') {
    return { color: '#ff4d4d', borderColor: 'rgba(255,77,77,0.4)', background: 'rgba(255,77,77,0.1)' };
  }
  return {};
});
</script>

<style scoped>
.status-badge {
  background: var(--color-pink-subtle, rgba(255, 143, 192, 0.1));
  color: var(--color-pink, #ff8fc0);
  border: 1px solid rgba(255, 143, 192, 0.3);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 11px;
  cursor: pointer;
  transition: 0.3s;
  display: inline-block;
  font-weight: bold;
}

.status-badge:hover {
  background: rgba(255, 143, 192, 0.2);
  box-shadow: 0 0 10px rgba(255, 143, 192, 0.3);
}

.status-badge-done {
  background: rgba(46, 204, 113, 0.1);
  color: #2ecc71;
  border: 1px solid #2ecc71;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  text-decoration: none !important;
  display: inline-block;
  margin-right: 10px;
}
</style>
