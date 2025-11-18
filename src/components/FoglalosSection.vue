<template>
  <section class="foglalos-container">
  <div class="foglalos">
      <h2 class="text-2xl font-semibold mb-2">Rendezvények, céges események és egyedi megrendelések</h2>
      <p class="text-gray-700 mb-4">
        Szeretnél céges bulit, születésnapi rendezvényt vagy akár esküvőt tartani? Vagy szükséged van
        tálalásokra/egyedi menüre nagyobb alkalmakra — olyan ételekre, amelyek nincsenek a menünkön?
        Örömmel segítünk: összeállítunk tálakat, hidegtálakat, meleg ételeket vagy egyedi menüsorokat a
        vendégek számának és az igényeidnek megfelelően.
      </p>

      <ul class="list-disc pl-5 text-gray-700 space-y-2 mb-4">
        <li><strong>Partik és családi rendezvények</strong> — egyedi menücsomagok, tálalások, kiszállítás vagy átvétel.</li>
        <li><strong>Céges események</strong> — buffet, büféasztal, több fogásos menü, helyszíni kiszolgálás egyeztetéssel.</li>
        <li><strong>Ünnepi tálak és catering</strong> — hideg/meleg tálak, finger food, desszertek nagyobb mennyiségben.</li>
        <li><strong>Ételek nincsenek a webes menün</strong> — speciális kérésekre (pl. házias fogások, nagy tálak) egyedi árajánlatot adunk.</li>
      </ul>

      <p class="text-sm text-gray-600">
        Kérjük, amikor ajánlatot kérsz, add meg a következőket: dátum, vendégek száma, helyszín (kiszállítás vagy átvétel),
        hozzávetőleges költségkeret, valamint az esetleges ételallergiák vagy speciális kérések.
      </p>

      <!-- Copy contact CTA here as requested -->
      <div class="mt-4 space-y-3">
        <a href="#contact-form" class="inline-block bg-orange-500 text-white px-4 py-2 rounded-md">Ajánlatkérés űrlap</a>
        <div class="text-sm text-gray-700">
          <div>E-mail: <a :href="`mailto:${email}`" class="text-blue-600 underline">{{ emailDisplay }}</a></div>
          <div>Telefon: <a :href="`tel:${phone}`" class="text-blue-600 underline">{{ phoneDisplay }}</a></div>
        </div>
      </div>
    </div>
    <div class="foglalos contact-box">
      <!-- Right column: email sending form -->
      <SendMessage />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import SendMessage from '@/components/SendMessage.vue'

// These can be customized where the component is used or replaced with real contact details.
const props = defineProps({
  email: { type: String, default: 'orders@example.com' },
  phone: { type: String, default: '+36 30 123 4567' }
})

const emailDisplay = computed(() => props.email)
const phoneDisplay = computed(() => props.phone)
</script>

<style scoped>
.foglalos-container{
  display:flex;
  justify-content:center;
  align-items:stretch; /* ensure both columns stretch to same height */
  gap:24px;
  margin:3rem auto;
  width:90%;
  max-width:1100px;
}

.foglalos{ flex:1; background:#fff; padding:1.25rem; border-radius:12px; box-shadow:0 6px 18px rgba(0,0,0,0.06); display:flex; flex-direction:column }
.contact-box{ max-width:420px; display:flex; flex-direction:column }
.contact-box > * { width:100% }

.text-gray-700{ color:#374151 }
.text-gray-600{ color:#6b7280 }
.bg-orange-500{ background:#f97316 }
.rounded-md{ border-radius:8px }

@media (max-width: 820px){
  .foglalos-container{ flex-direction:column; gap:16px }
}
</style>
