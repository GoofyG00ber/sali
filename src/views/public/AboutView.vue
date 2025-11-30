<script setup lang="ts">
import { ref, computed } from 'vue'
import MapView from '@/components/MapView.vue'
import CheckeredPanel from '@/components/CheckeredPanel.vue'
import { useSettingsStore } from '@/stores/settings'

const settingsStore = useSettingsStore()
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
  settingsStore.fetchOpeningHours()
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
        <div class="prose prose-lg max-w-none">
          <h2 class="text-4xl font-bold mb-6 text-gray-900 pacifico-regular">Történetünk</h2>
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

      <!-- Contact & Hours -->
      <section class="mb-16">
        <h2 class="text-4xl font-bold mb-8 text-gray-900 pacifico-regular">Hol és hogyan érj el minket</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 md:grid-rows-[auto_auto] gap-0 rounded-lg overflow-hidden shadow-md">
          <!-- Contact Details -->
          <div class="bg-gray-50 p-8 flex flex-col justify-between md:row-span-1">
            <div class="space-y-6">
              <div class="flex gap-4">
                <svg class="w-6 h-6 text-red-700 flex-shrink-0 mt-1" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 7 7 13 7 13s7-6 7-13c0-3.87-3.13-7-7-7zM12 11.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/>
                </svg>
                <div>
                  <p class="font-semibold text-gray-900">Cím</p>
                  <p class="text-gray-700">Kartal, Baross u. 92, 2173</p>
                </div>
              </div>
              <div class="flex gap-4">
                <svg class="w-6 h-6 text-red-700 flex-shrink-0 mt-1" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 01.95-.27c1.05.27 2.2.42 3.4.42a1 1 0 011 1V20a1 1 0 01-1 1C10.07 21 3 13.93 3 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.2.15 2.35.42 3.4a1 1 0 01-.28.95l-2.02 2.44z"/>
                </svg>
                <div>
                  <p class="font-semibold text-gray-900">Telefon</p>
                  <p class="text-gray-700">+36 20 8437 484</p>
                </div>
              </div>
              <div class="flex gap-4">
                <svg class="w-6 h-6 text-red-700 flex-shrink-0 mt-1" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
                <div>
                  <p class="font-semibold text-gray-900">Email</p>
                  <p class="text-gray-700">baross92@gmail.com</p>
                </div>
              </div>
            </div>

            <div class="mt-8 pt-8 border-t border-gray-200">
              <h3 class="font-semibold text-gray-900 mb-4">Nyitvatartás</h3>
              <div class="space-y-2 text-gray-700">
                <template v-if="settingsStore.openingHours.length > 0">
                  <div v-for="day in settingsStore.openingHours" :key="day.id" class="flex justify-between">
                    <span>{{ day.name_of_day }}:</span>
                    <span>{{ day.is_open ? `${day.open_time} - ${day.close_time}` : 'ZÁRVA' }}</span>
                  </div>
                </template>
                <template v-else>
                  <div class="flex justify-between">
                    <span>Betöltés...</span>
                  </div>
                </template>
              </div>
            </div>
          </div>

          <!-- Map -->
          <div class="overflow-hidden">
            <MapView class="w-full h-full" />
          </div>

          <!-- CTA -->
          <div class="col-span-1 md:col-span-2 h-auto bg-red-700 text-white p-12 text-center">
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
