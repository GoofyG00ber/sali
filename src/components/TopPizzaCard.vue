<!-- src/components/TopPizzaCard.vue -->
<script setup lang="ts">
import { ref } from 'vue'



const sizes = [26, 32, 50]
const selectedSize = ref(32)

const selectSize = (size: number) => {
  selectedSize.value = size
}
</script>

<template>
  <article
    class="relative min max-w-xs rounded-[32px] bg-gray-50 shadow-[0_20px_40px_rgba(0,0,0,0.16)]"
  >

    <div class="absolute -left-4 top-4 z-20">
      <div class="relative">
        <div class="bg-amber-400 h-[20px] w-[60px]"></div>
        <span
          class="absolute inset-0 flex items-center justify-center
                pacifico-regular text-[32px] text-white leading-none"
        >
          Top
        </span>
      </div>
    </div>

    <div class="bg-[#7A231D] pt-8 flex justify-center relative z-5 rounded-t-xl">
      <div class="w-full h-40 overflow-hidden">
        <img src="/static_images/top-view-delicious-pizza.png"
          class="w-full object-cover object-top" />
    </div>
    </div>

    <div class="pt-10 pb-6 px-6 work-sans-regular z-10 relative bg-gray-50 rounded-b-xl">
      <h3 class="text-xl font-semibold text-slate-900 mb-1">
        Nagyon finom pizza
      </h3>
      <p class="text-sm text-slate-500 leading-snug mb-4">
        paradicsomszósz, mozzarella, sonka, olivabogyó, koktélparadicsom
      </p>

      <div class="flex gap-3 mb-4">
        <button
          v-for="size in sizes"
          :key="size"
          type="button"
          @click="selectSize(size)"
          class="flex-1 rounded-lg border px-3 py-1 text-sm font-medium transition"
          :class="
            selectedSize === size
              ? 'border-orange-500 text-orange-600 bg-orange-50'
              : 'border-gray-300 text-gray-600 bg-white hover:border-orange-400 hover:text-orange-500'
          "
        >
          {{ size }} cm
        </button>
      </div>

      <div class="flex items-center justify-between">
        <div class="text-lg work-sans-medium text-slate-900">
          3290,00 Ft
        </div>
        <button
          type="button"
          class="rounded-lg bg-orange-600 px-6 py-2 text-sm work-sans-semibold text-white shadow hover:bg-orange-700 transition"
        >
          kosárba
        </button>
      </div>
    </div>
  </article>
</template>

<style scoped>
.pacifico-regular {
  font-family: "Pacifico", cursive;
  font-weight: 400;
  font-style: normal;
}

.work-sans-light {
  font-family: "Work Sans", sans-serif;
  font-optical-sizing: auto;
  font-weight: 300;
  font-style: normal;
}
.work-sans-regular {
  font-family: "Work Sans", sans-serif;
  font-optical-sizing: auto;
  font-weight: 400;
  font-style: normal;
}
.work-sans-medium {
  font-family: "Work Sans", sans-serif;
  font-optical-sizing: auto;
  font-weight: 500;
  font-style: normal;
}
.work-sans-semibold {
  font-family: "Work Sans", sans-serif;
  font-optical-sizing: auto;
  font-weight: 600;
  font-style: normal;
}
.work-sans-bold {
  font-family: "Work Sans", sans-serif;
  font-optical-sizing: auto;
  font-weight: 700;
  font-style: normal;
}
</style>
