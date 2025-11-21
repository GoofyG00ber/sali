<script setup lang="ts">
import HeroSection from '@/components/HeroSection.vue'
import TopPizzak from '@/components/TopPizzak.vue'
</script>

<template>
  <div class="homeview relative min-h-screen overflow-x-hidden">

    <section class="relative h-auto md:h-screen">
      <HeroSection />
    </section>

    <section class="relative min-h-[50vh] z-20">
      <TopPizzak />
    </section>

    <img
      src="/static_images/top-view-delicious-pizza.png"
      alt="Delicious pizza"
      class="pointer-events-none absolute right-1/2 translate-x-1/2 -top-60 md:right-0 md:translate-x-1/4 md:top-[20vh] w-[150vw] md:w-[60vw] z-5"
    />
  </div>
</template>



<style>
/* HomeViewra vonatkozik csak */
.homeview {
  background-color: #F4AC3E; /* Yellow-400 */
}
/* globális háttér */
body {
  background: #f5f5f5;
}
</style>
