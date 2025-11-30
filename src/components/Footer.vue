<template>
  <footer class="footer">
    <DottedPanel :left="0" :top="500" :zIndex="5" :opacity="100" :width="400" :color="'#f4ac3e'" class="md:hidden"/>
    <DottedPanel :right="0" :top="700" :zIndex="5" :opacity="100" :width="200" :height="300" class="md:hidden"/>
    <DottedPanel :left="0" :top="300" :zIndex="5" :opacity="100" :width="400" :color="'#f4ac3e'" class="hidden md:block"/>
    <DottedPanel :right="0" :top="350" :zIndex="5" :opacity="100" :width="200" :height="300" class="hidden md:block"/>

    <div class="hero">
      <div class="hero-image" />
      <div class="hero-overlay" />
    </div>

    <CheckeredPanel :top="300" :left="0" :width="10000" :height="300" :square-size="30" :color="'#9C9C9C'" :z-index="4" :opacity="0.15" />

    <div class="container">
      <div class="cards">
        <!-- Left card: contact + mini map -->
        <div class="card contact">
          <div class="card-top">
            <h3 class="absolute text-gray-50 pacifico-regular text-4xl -mt-10">Elérhetőségeink</h3>
            <ul class="contact-list mt-10">
              <li><svg class="icon" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 7 7 13 7 13s7-6 7-13c0-3.87-3.13-7-7-7zM12 11.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/></svg> Kartal, Baross u. 92, 2173</li>
              <li><svg class="icon" viewBox="0 0 24 24"><path fill="currentColor" d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 01.95-.27c1.05.27 2.2.42 3.4.42a1 1 0 011 1V20a1 1 0 01-1 1C10.07 21 3 13.93 3 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.2.15 2.35.42 3.4a1 1 0 01-.28.95l-2.02 2.44z"/></svg> +36 20 8437 484</li>
              <li><svg class="icon" viewBox="0 0 24 24"><path fill="currentColor" d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg> baross92@gmail.com</li>
            </ul>
          </div>

          <div class="card-map">
            <MapView />
          </div>
        </div>

        <!-- Right card: opening hours -->
        <div class="card hours">
          <h3 class="absolute text-gray-50 pacifico-regular text-4xl -mt-10 ">Nyitvatartás</h3>
          <div class="hours-content">
            <div class="hours-grid mt-10 mb-19 px-10">
              <template v-if="settingsStore.openingHours.length > 0">
                <template v-for="day in settingsStore.openingHours" :key="day.id">
                  <div class="day">{{ day.name_of_day.toUpperCase() }}</div>
                  <div class="time">
                    {{ day.is_open ? `${day.open_time} - ${day.close_time}` : 'ZÁRVA' }}
                  </div>
                </template>
              </template>
              <template v-else>
                <!-- Fallback/Loading state (matches original design) -->
                <div class="day">HÉTFŐ</div><div class="time">10:00 - 21:00</div>
                <div class="day">KEDD</div><div class="time">10:00 - 21:00</div>
                <div class="day">SZERDA</div><div class="time">10:00 - 21:00</div>
                <div class="day">CSÜTÖRTÖK</div><div class="time">10:00 - 21:00</div>
                <div class="day">PÉNTEK</div><div class="time">10:00 - 22:00</div>
                <div class="day">SZOMBAT</div><div class="time">10:00 - 22:00</div>
                <div class="day">VASÁRNAP</div><div class="time">14:00 - 21:00</div>
              </template>
            </div>

            <div class="card-footer">
              <img src="/static_images/logo.png" alt="Sali Pizzéria" class="logo" />
              <a href="https://www.facebook.com/salatabar.kartal" target="_blank" rel="noopener noreferrer" class="facebook-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bottom-bar">
      <div class="container bottom-inner">
        <div class="spacer" />
        <div class="links">
          <a href="/privacy-policy">ADATVÉDELEM</a>
          <span class="sep">|</span>
          <span>Sali Pizzéria</span>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import MapView from '@/components/MapView.vue'
import DottedPanel from '@/components/DottedPanel.vue'
import CheckeredPanel from '@/components/CheckeredPanel.vue'
import { useSettingsStore } from '@/stores/settings'
import { onMounted } from 'vue'

const settingsStore = useSettingsStore()

onMounted(() => {
  settingsStore.fetchOpeningHours()
})
</script>

<style scoped>
:root{ --card-bg: #000; --card-fg: #fff }
.footer{ background:#393939; color:var(--card-fg); position:relative; overflow-x: hidden; }
.hero{ height:140px; position:relative }
.hero-image{ position:absolute; inset:0; background-image:url('/static_images/footer-img.png'); background-size:cover; background-position:center; filter:brightness(0.6); height: 300px;}
.container{ max-width:1100px; margin:0 auto; padding:28px 16px; }
.cards{ display:flex; gap:28px; align-items:stretch; justify-content:center; }
.card{ background:var(--card-bg); color:var(--card-fg); border-radius:18px; overflow:hidden; box-shadow:0 8px 20px rgba(0,0,0,0.5); z-index: 10; background-color: #000; margin-bottom: 24px; display:flex; flex-direction:column; flex:1; }
.card.contact{ display:flex; flex-direction:column; }
.card.hours{ padding:22px; display:flex; flex-direction:column; }
.card-top{ padding:22px; flex-shrink:0; }
.card-map{ background:#fff; padding:0; border-bottom-left-radius:18px; border-bottom-right-radius:18px; overflow:hidden; flex:1; display:flex; }
.card-map > *{ width:100%; flex:1; display:block }
.hours-content{ display:flex; flex-direction:column; flex:1; }
.contact-list{ list-style:none; padding:0; margin:0; color:#fff; margin-top:24px }
.contact-list li{ display:flex; align-items:center; gap:12px; padding:8px 0; color:#eee }
.icon{ width:20px; height:20px; opacity:0.95 }
.hours-grid{ display:grid; grid-template-columns:1fr 1fr; gap:8px 16px; align-items:center }
.day{ font-weight:700; color:#fff }
.time{ color:#ddd; text-align:right }

.card-footer{ display:flex; align-items:center; justify-content:flex-end; gap:16px; margin-top:auto; padding-top:16px; border-top:1px solid rgba(255,255,255,0.1) }
.logo{ height:48px; object-fit:contain }
.facebook-icon{ display:flex; align-items:center; justify-content:center; width:32px; height:32px; color:#fff; transition:opacity 0.3s }
.facebook-icon:hover{ opacity:0.7 }

.bottom-bar{ background:#111; margin-top:22px; padding-top: 20px;}
.bottom-inner{ display:flex; align-items:center; justify-content:space-between; padding:12px 16px; background:#111; border-top:1px solid rgba(255,255,255,0.06); padding-top: 22px; }
.links{ color:#ccc; font-size:13px; display:flex; gap:12px; align-items:center }
.links a{ color:#ccc; text-decoration:none }
.sep{ opacity:0.3 }

@media (max-width: 980px){
  .cards{ flex-direction:column; align-items:center }
  .card.contact, .card.hours{ width:92%; }
  .card-map > *{ height:180px }
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
