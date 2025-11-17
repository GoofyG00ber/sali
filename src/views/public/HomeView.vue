<script setup lang="ts">
import HeroSection from '@/components/HeroSection.vue'
import TopPizzak from '@/components/TopPizzak.vue'
</script>

<template>
  <div class="homeview relative min-h-screen overflow-x-hidden">

    <section class="relative h-[50vh] md:h-screen pt-[80px]">
      <HeroSection />
    </section>

    <section class="relative min-h-[50vh] bg-red-600/70 z-20">
      <TopPizzak />
    </section>

    <img
      src="/static_images/top-view-delicious-pizza.png"
      alt="Delicious pizza"
      class="pointer-events-none absolute right-0 translate-x-1/4 top-[20vh] w-[60vw] z-5"
    />
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
