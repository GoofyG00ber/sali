<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useFoodsStore } from '@/stores/foods'
import TopPizzaCard from './TopPizzaCard.vue'

const foodsStore = useFoodsStore()
const { topPizzas } = storeToRefs(foodsStore)

onMounted(() => {
  foodsStore.fetchTopPizzas()
})
</script>

<template>
  <div class="toppizzak py-10 relative">
    <h1 class="pacifico-regular md:pl-10 text-center md:text-left mb-10 text-gray-50 text-4xl md:text-5xl">Legnépszerűbb pizzáink</h1>

    <div class="flex justify-center px-4 sm:px-6 lg:px-10">
      <div
        class="grid grid-cols-1 md:grid-cols-3
               gap-y-[30px] md:gap-y-[30px]
               md:gap-x-[60px]"
      >
        <TopPizzaCard
          v-for="pizza in topPizzas"
          :key="pizza.id"
          :pizza="pizza"
          class="mx-auto"
        />
      </div>
    </div>
  <img src="/static_images/toppizzak_dots.svg?url" class="absolute top-3/5 right-0 z-2 rotate-90 " />
    <div class="w-full text-center mt-10">
      <router-link
        to="/menu"
        class="text-amber-300 text-xl work-sans-semibold hover:underline"
      >
        Tovább az étlapra >
      </router-link>
    </div>

  </div>
</template>

<style scoped>
.toppizzak {
  width: 100%;
  min-height: 180px;
  background-color: #ff0000b7;
}
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

