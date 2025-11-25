<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute } from 'vue-router'
import NavBar from './components/NavBar.vue'
import Footer from './components/Footer.vue'
import RestaurantStatusModal from './components/RestaurantStatusModal.vue'

const route = useRoute()
const showStatusModal = ref(false)
const statusMessage = ref('')
const todaySchedule = ref(null)
const showScrollTop = ref(false)
const isRestaurantOpen = ref(true)
let statusCheckInterval: ReturnType<typeof setInterval> | null = null

const handleScroll = () => {
  showScrollTop.value = window.scrollY > 0
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const checkRestaurantStatus = async () => {
  try {
    const response = await fetch('/api/restaurant-status')
    const data = await response.json()
    isRestaurantOpen.value = data.isOpen

    if (!data.isOpen) {
      statusMessage.value = data.message
      todaySchedule.value = data.schedule
    }
  } catch (error) {
    console.error('Error checking restaurant status:', error)
  }
}

// Scroll to top when route changes
watch(() => route.path, () => {
  window.scrollTo({ top: 0, behavior: 'auto' })
})

onMounted(async () => {
  // Check if we already showed the modal in this session
  const hasSeenModal = sessionStorage.getItem('hasSeenStatusModal')

  // Initial status check
  await checkRestaurantStatus()

  if (!isRestaurantOpen.value && !hasSeenModal) {
    showStatusModal.value = true
    sessionStorage.setItem('hasSeenStatusModal', 'true')
  }

  // Check status every 10 seconds
  statusCheckInterval = setInterval(checkRestaurantStatus, 10000)

  window.addEventListener('scroll', handleScroll)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
  if (statusCheckInterval) {
    clearInterval(statusCheckInterval)
  }
})
</script>

<template>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
<link href="https://fonts.googleapis.com/css2?family=Pacifico&family=Work+Sans:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">

  <div id="app" class="work-sans-regular">
    <NavBar :is-open="isRestaurantOpen" />
    <main class="md:pt-[80px]">
      <router-view />
    </main>
    <Footer class="pb-[80px] md:pb-[0px]" />

    <!-- Scroll to Top Button -->
    <Transition name="scroll-top">
      <button
        v-if="showScrollTop"
        @click="scrollToTop"
        class="scroll-to-top"
        title="Vissza az elejére"
        aria-label="Vissza az elejére"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="18 15 12 9 6 15"></polyline>
        </svg>
      </button>
    </Transition>

    <RestaurantStatusModal
      :is-open="showStatusModal"
      :message="statusMessage"
      :schedule="todaySchedule"
      @close="showStatusModal = false"
    />
  </div>
</template>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
main {
  flex: 1 1 auto;
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

/* Transition classes for smooth appear/disappear */
.scroll-top-enter-active,
.scroll-top-leave-active {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.scroll-top-enter-from {
  opacity: 0;
  transform: translateY(60px);
}

.scroll-top-leave-to {
  opacity: 0;
  transform: translateY(60px);
}

.scroll-to-top {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 50px;
  height: 50px;
  background: #ff6106;
  color: #fff;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 40;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  opacity: 1;
}

.scroll-to-top:hover {
  background: #e55a00;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  transform: translateY(-4px);
}

.scroll-to-top:active {
  transform: translateY(0);
}

.scroll-to-top svg {
  width: 24px;
  height: 24px;
}

/* Mobile view - higher position to avoid navbar */
@media (max-width: 768px) {
  .scroll-to-top {
    bottom: 100px;
  }
}
</style>
