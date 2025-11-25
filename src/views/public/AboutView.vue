<script setup lang="ts">
import { ref } from 'vue'
import MapView from '@/components/MapView.vue'

const images = ref([
  'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=800&q=80',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
  'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80'
])

const selectedImageIndex = ref<number | null>(null)
</script>

<template>
  <main class="min-h-screen bg-white">
    <!-- Hero Banner -->
    <section class="bg-red-700 text-white py-16">
      <div class="container mx-auto px-4 max-w-5xl">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 class="text-5xl font-bold mb-2 pacifico-regular">Sali Pizzéria</h1>
            <p class="text-xl opacity-90">Kartal legjobb pizzái – hagyomány és ízvilág egy helyen</p>
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
            Szeretünk azt csinálni, amit csinálunk – pizzát sütni, embereket mosolyogtatni, és gasztronómiai élményt nyújtani.
          </p>
          <p class="text-gray-700 leading-relaxed mb-4">
            Hiszünk a minőségben, az autentikus receptekben és az olasz tradícióban. Minden pizza, amit kiszállítunk,
            szeretettel és odafigyeléssel készül. Az alapanyagok kiválasztásától kezdve a sütésig – apró részletekre ügyelünk.
          </p>
          <p class="text-gray-700 leading-relaxed">
            Ha betérsz hozzánk vagy rendelsz az otthonodhoz, azt szeretnénk, hogy az élmény maradandó legyen.
            Ez az, ami minket a versenytől megkülönböztet.
          </p>
        </div>
      </section>

      <!-- Image Gallery -->
      <section class="mb-16">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            v-for="(image, index) in images"
            :key="index"
            @click="selectedImageIndex = index"
            class="cursor-pointer rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
          >
            <img
              :src="image"
              :alt="`Pizzéria kép ${index + 1}`"
              class="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>

        <!-- Lightbox Modal -->
        <div
          v-if="selectedImageIndex !== null"
          class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          @click="selectedImageIndex = null"
        >
          <div class="relative max-w-4xl w-full" @click.stop>
            <img
              :src="images[selectedImageIndex]"
              :alt="`Pizzéria kép ${selectedImageIndex + 1}`"
              class="w-full h-auto rounded-lg"
            />
            <button
              @click="selectedImageIndex = null"
              class="absolute top-4 right-4 bg-white text-black rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-200 transition"
            >
              ✕
            </button>
          </div>
        </div>
      </section>

      <!-- What We Do -->
      <section class="mb-16">
        <h2 class="text-4xl font-bold mb-8 text-gray-900 pacifico-regular">Mit csinálunk</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h3 class="text-2xl font-bold text-red-700 mb-3">Autentikus Pizzák</h3>
            <p class="text-gray-700 leading-relaxed">
              Hagyományos olasz receptek, friss hozzávalók és a megfelelő sütési idő.
              Nem rontunk el semmit – mert tudunk, hogy tudjuk, hogyan kell készíteni egy igazi pizzát.
            </p>
          </div>
          <div>
            <h3 class="text-2xl font-bold text-red-700 mb-3">Rendezvénycatering</h3>
            <p class="text-gray-700 leading-relaxed">
              Esküvőkre, születésnapokra, céges rendezvényekre – mi gondoskodunk az ételekről.
              Rugalmas, szép, és minden alkalomra maradandó.
            </p>
          </div>
          <div>
            <h3 class="text-2xl font-bold text-red-700 mb-3">Szállítás & Elvitel</h3>
            <p class="text-gray-700 leading-relaxed">
              Gyors rendelés, friss kiszállítás. Online megrendelheted, és garantáltan forró pizzát kapsz az ajtódhoz.
            </p>
          </div>
          <div>
            <h3 class="text-2xl font-bold text-red-700 mb-3">Közösségi hely</h3>
            <p class="text-gray-700 leading-relaxed">
              Nem csak egy étterem, hanem egy hely, ahol jó ételről és barátokról szól az élet. Nézd meg szóban vagy személyesen.
            </p>
          </div>
        </div>
      </section>

      <!-- Reviews Section -->
      <section class="mb-16">
        <h2 class="text-4xl font-bold mb-8 text-gray-900 pacifico-regular">Vélemények</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition">
            <div class="flex items-center mb-3">
              <div class="flex text-yellow-400">
                <span>★★★★★</span>
              </div>
            </div>
            <p class="text-gray-700 mb-4 italic">"Végre találtunk egy igazi pizzériát! Az alap tökéletesen sült, az összetevők frissek. Szombat este rendeltünk, 20 perc alatt megérkezett. Köszönjük!"</p>
            <p class="font-semibold text-gray-900">- Gábor</p>
          </div>

          <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition">
            <div class="flex items-center mb-3">
              <div class="flex text-yellow-400">
                <span>★★★★★</span>
              </div>
            </div>
            <p class="text-gray-700 mb-4 italic">"Kiváló catering szolgáltatás. 40 személyre rendeltem pizzákat az esküvői recepcióra. Mindenki lenyűgözve volt az ízekről és az alaknak is megfeleltek. Ajánlom!"</p>
            <p class="font-semibold text-gray-900">- Kinga</p>
          </div>

          <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition">
            <div class="flex items-center mb-3">
              <div class="flex text-yellow-400">
                <span>★★★★★</span>
              </div>
            </div>
            <p class="text-gray-700 mb-4 italic">"Már sok helyen ettem pizzát, de ez teljesen más ligában van. Az olasz receptúrát valóban értik. Ár-érték arány is tökéletes. Heti rendszeres vagyok!"</p>
            <p class="font-semibold text-gray-900">- Péter</p>
          </div>
        </div>
      </section>

      <!-- Contact & Hours -->
      <section class="mb-16">
        <h2 class="text-4xl font-bold mb-8 text-gray-900 pacifico-regular">Hol és hogyan elérj minket</h2>
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
                  <p class="text-gray-700">+36 2 843 7484</p>
                </div>
              </div>
              <div class="flex gap-4">
                <svg class="w-6 h-6 text-red-700 flex-shrink-0 mt-1" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
                <div>
                  <p class="font-semibold text-gray-900">Email</p>
                  <p class="text-gray-700">salipizzeria@gmail.com</p>
                </div>
              </div>
            </div>

            <div class="mt-8 pt-8 border-t border-gray-200">
              <h3 class="font-semibold text-gray-900 mb-4">Nyitvatartás</h3>
              <div class="space-y-2 text-gray-700">
                <div class="flex justify-between">
                  <span>Hétfő - Péntek:</span>
                  <span>10:00 - 21:00</span>
                </div>
                <div class="flex justify-between">
                  <span>Szombat:</span>
                  <span>10:00 - 22:00</span>
                </div>
                <div class="flex justify-between">
                  <span>Vasárnap:</span>
                  <span>14:00 - 21:00</span>
                </div>
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
            <p class="mb-8 text-lg opacity-90">Nézd meg az étlapunkat és rendelj most, vagy keress fel személyesen!</p>
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
