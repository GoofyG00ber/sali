<script setup lang="ts">
// Placeholder about page — modern layout matching the site's theme.
</script>

<template>
  <main class="about-page min-h-screen bg-gray-50 py-12">
    <div class="container mx-auto px-4 max-w-5xl">
      <!-- Hero -->
      <section class="bg-gradient-to-r from-orange-500 to-orange-400 text-white rounded-xl p-8 mb-8 shadow-lg flex flex-col lg:flex-row items-center gap-6">
        <div class="flex-1">
          <h1 class="text-4xl font-bold mb-2">Rólunk</h1>
          <p class="opacity-90">Helyi, friss alapanyagokból készült ételek. Szeretünk új ízeket alkotni és ügyfeleink eseményeit különlegessé tenni.</p>
        </div>
        <div class="w-48 h-48 bg-white/10 rounded-lg flex items-center justify-center">
          <!-- hero image placeholder -->
          <img src="/static_images/logo.png" alt="logo" class="w-32 h-32 object-contain" />
        </div>
      </section>

      <!-- Values / Stats -->
      <section class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-xl p-6 shadow-sm text-center">
          <h3 class="text-3xl font-bold text-orange-500">10+</h3>
          <p class="text-sm text-gray-600">Év tapasztalat</p>
        </div>
        <div class="bg-white rounded-xl p-6 shadow-sm text-center">
          <h3 class="text-3xl font-bold text-orange-500">1000+</h3>
          <p class="text-sm text-gray-600">Elégedett vendég</p>
        </div>
        <div class="bg-white rounded-xl p-6 shadow-sm text-center">
          <h3 class="text-3xl font-bold text-orange-500">500+</h3>
          <p class="text-sm text-gray-600">Rendezvény & catering</p>
        </div>
      </section>

      <!-- What we do -->
      <section class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h2 class="text-2xl font-semibold mb-3">Mit kínálunk</h2>
          <ul class="list-disc pl-5 text-gray-700 space-y-2">
            <li>Egyedi pizzák és hagyományos fogások</li>
            <li>Catering - hideg és meleg tálak</li>
            <li>Rendezvény támogatás és helyszíni szolgáltatások</li>
            <li>Ételallergia-barát opciók és különleges igények kezelése</li>
          </ul>
        </div>

        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h2 class="text-2xl font-semibold mb-3">Csapatunk</h2>
          <p class="text-gray-700 mb-4">Szakácsaink és rendezvényszakértőink több éves tapasztalattal rendelkeznek. Itt egy rövid bemutató a csapatról (helykitöltő):</p>
          <div class="grid grid-cols-2 gap-4">
            <div class="p-4 bg-gray-50 rounded">
              <div class="font-semibold">Kovács Péter</div>
              <div class="text-sm text-gray-600">Vezető szakács</div>
            </div>
            <div class="p-4 bg-gray-50 rounded">
              <div class="font-semibold">Nagy Anna</div>
              <div class="text-sm text-gray-600">Rendezvényszervező</div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="bg-white rounded-xl p-6 shadow-sm text-center">
        <h3 class="text-2xl font-semibold mb-2">Szeretnéd, hogy mi szervezzük az eseményed?</h3>
        <p class="text-gray-700 mb-4">Kérj ajánlatot tőlünk — egyedi menük és catering szolgáltatásokkal segítünk.</p>
        <div class="flex justify-center gap-4">
          <router-link to="/contact" class="bg-orange-500 text-white px-4 py-2 rounded-md">Kapcsolatfelvétel</router-link>
          <router-link to="/menu" class="border border-orange-500 text-orange-500 px-4 py-2 rounded-md">Megnézem a menüt</router-link>
        </div>
      </section>
    </div>
  </main>
</template>
