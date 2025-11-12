<script setup lang="ts">
import HeroSection from '@/components/HeroSection.vue'
import TopPizzak from '@/components/TopPizzak.vue'
</script>

<template>
  <div class="homeview overflow-x-hidden relative">
    <img src="/static_images/top-view-delicious-pizza.png"
       alt="Delicious pizza"
       class="w-2/3 h-auto z-10 absolute right-0 translate-x-1/4 top-15" />
  <HeroSection />
  <TopPizzak />
  </div>
</template>

<style>
/* HomeViewra vonatkozik csak */
.homeview {
  background-color: oklch(85.2% 0.199 91.936); /* Yellow-400 */
}
/* globális háttér */
body {
  background: #cccccc;
}
</style>
