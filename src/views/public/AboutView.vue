<script setup lang="ts">
import { ref, computed } from 'vue'
import CheckeredPanel from '@/components/CheckeredPanel.vue'

const scrollY = ref(0)

const parallaxOffset = computed(() => {
  return scrollY.value * 0.5
})

const images = ref([
  '/static_images/aboutus_pizza.png',
  '/static_images/aboutus_building.png',
  '/static_images/aboutus_interior.png'
])

const handleScroll = () => {
  scrollY.value = window.scrollY
}

// Mounted lifecycle
import { onMounted, onUnmounted } from 'vue'
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <main class="min-h-screen bg-white">
    <!-- Hero Banner -->
    <section class="bg-red-700 text-white py-16 relative overflow-hidden">
      <CheckeredPanel
        :top="`-${parallaxOffset}px`"
        :left="0"
        :width="10000"
        :height="1000"
        :square-size="40"
        :color="'#ffffff'"
        :z-index="1"
        :opacity="0.2"
      />
      <div class="container mx-auto px-4 max-w-5xl relative z-10">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div class="text-center md:text-left">
            <h1 class="text-5xl font-bold mb-2 pacifico-regular">Sali Pizzéria</h1>
            <p class="text-xl opacity-90">Kartal legjobb pizzái</p>
          </div>
          <div class="flex justify-center md:justify-end order-first md:order-last">
            <img src="/static_images/logo.png" alt="Sali Logo" class="h-40 object-contain" />
          </div>
        </div>
      </div>
    </section>

    <div class="container mx-auto px-4 max-w-5xl py-12">
      <!-- Story Section -->
      <section class="mb-16">
        <h2 class="text-4xl font-bold mb-6 text-gray-900 pacifico-regular">Történetünk</h2>
        <div class="prose prose-lg max-w-none">
          <p class="text-gray-700 leading-relaxed mb-4">
            A Sali pizzéria Kartal szívében működik, ahol már évek óta a legfinomabb pizzákat készítjük.
            Szeretünk pizzát sütni, vendégeinket megmosolyogtatni, és élményt nyújtani.
          </p>
          <p class="text-gray-700 leading-relaxed mb-4">
            Hiszünk a minőségben. Minden pizza, amit kiszállítunk,
            szeretettel és odafigyeléssel készül. Az alapanyagok kiválasztásától kezdve a sütésig. Figyelünk az apró részletekre.
          </p>
        </div>
      </section>

      <!-- Image Gallery -->
      <section class="mb-16">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            v-for="(image, index) in images"
            :key="index"
            class="rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
          >
            <img
              :src="image"
              :alt="`Pizzéria kép ${index + 1}`"
              class="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>
      </section>

      <!-- What We Do -->
      <section class="mb-16">
        <h2 class="text-4xl font-bold mb-8 text-gray-900 pacifico-regular">Mivel szolgálunk</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h3 class="text-2xl font-bold text-red-700 mb-3">Finom pizzák</h3>
            <p class="text-gray-700 leading-relaxed">
              Kartal legfinomabb pizzái, friss hozzávalókkal dolgozunk és figyelünk a részletekre.
             </p>
          </div>
          <div>
            <h3 class="text-2xl font-bold text-red-700 mb-3">Rendezvénycatering</h3>
            <p class="text-gray-700 leading-relaxed">
              Esküvőkre, születésnapokra, céges rendezvényekre – mi gondoskodunk az ételekről.
            </p>
          </div>
          <div>
            <h3 class="text-2xl font-bold text-red-700 mb-3">Szállítás & Elvitel</h3>
            <p class="text-gray-700 leading-relaxed">
              Gyors rendelés, friss kiszállítás. Garantáltan forró pizzát kapsz az ajtódhoz.
            </p>
          </div>
          <div>
            <h3 class="text-2xl font-bold text-red-700 mb-3">Közösségi hely</h3>
            <p class="text-gray-700 leading-relaxed">
              Nem csak egy étterem, hanem egy hely, ahol jó ételről és barátokról szól az élet.
            </p>
          </div>
        </div>
      </section>

      <!-- Reviews Section -->
      <section class="mb-16">
        <h2 class="text-4xl font-bold mb-8 text-gray-900 pacifico-regular">Rólunk mondták</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition">
            <div class="flex items-center mb-3">
              <div class="flex text-yellow-400">
                <span>★★★★★</span>
              </div>
            </div>
            <p class="text-gray-700 mb-4 italic">"Szerintem a környék legjobb pizzériája. Olyan tésztája van, mintha valami "kalács" lenne."</p>
            <p class="font-semibold text-gray-900">- Miklós</p>
          </div>

          <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition flex flex-col">
            <div class="flex items-center mb-3">
              <div class="flex text-yellow-400">
                <span>★★★★★</span>
              </div>
            </div>
            <p class="text-gray-700 mb-4 italic flex-1">"Kedves, szimpatikus kiszolgálás. Tetszetős hely. Megfelelő minőségű, finom pizza. Olcsó."</p>
            <p class="font-semibold text-gray-900 mt-auto">- László</p>
          </div>

          <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition flex flex-col">
            <div class="flex items-center mb-3">
              <div class="flex text-yellow-400">
                <span>★★★★★</span>
              </div>
            </div>
            <p class="text-gray-700 mb-4 italic flex-1">"Meglepően finom tűzforró pizza, kedves és gyors kiszolgálás."</p>
            <p class="font-semibold text-gray-900 mt-auto">- Balázs</p>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="mb-16">
        <div class="bg-red-700 text-white p-12 text-center rounded-lg">
          <h2 class="text-3xl font-bold mb-4 pacifico-regular">Éhes vagy?</h2>
          <p class="mb-8 text-lg opacity-90">Nézd meg az étlapunkat és rendelj most, vagy keress minket személyesen!</p>
          <div class="flex flex-col sm:flex-row justify-center gap-4">
            <router-link to="/menu" class="bg-white text-red-700 px-8 py-3 rounded font-semibold hover:bg-gray-100 transition">
              Az étlapunk
            </router-link>
            <router-link to="/contact" class="border-2 border-white text-white px-8 py-3 rounded font-semibold hover:bg-white/10 transition">
              Írj nekünk
            </router-link>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>

<style scoped>
.pacifico-regular {
  font-family: "Pacifico", cursive;
  font-weight: 400;
  font-style: normal;
}
</style>
