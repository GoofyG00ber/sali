<script setup lang="ts">
import HeroSection from '@/components/HeroSection.vue'
import TopPizzak from '@/components/TopPizzak.vue'
</script>

<template>
  <div class="homeview">
  <div>
    <p class="text-xl font-bold">home view</p>
  </div>
  <HeroSection />
  <TopPizzak />
  </div>
</template>

<style>
/* HomeViewra vonatkozik csak */
.homeview {
  background-color: #f5ac3f;
}
/* globális háttér */
body {
  background: #cccccc;
}
</style>
