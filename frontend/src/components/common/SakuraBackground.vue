<template>
  <div class="sakura-layer" aria-hidden="true">
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
</template>

<script setup>
import { ref } from 'vue';

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
</script>

<style scoped>
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
</style>
