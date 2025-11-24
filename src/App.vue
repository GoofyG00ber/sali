<script setup lang="ts">
import { ref, onMounted } from 'vue'
import NavBar from './components/NavBar.vue'
import Footer from './components/Footer.vue'
import RestaurantStatusModal from './components/RestaurantStatusModal.vue'

const showStatusModal = ref(false)
const statusMessage = ref('')
const todaySchedule = ref(null)

onMounted(async () => {
  // Check if we already showed the modal in this session
  const hasSeenModal = sessionStorage.getItem('hasSeenStatusModal')

  try {
    const response = await fetch('/api/restaurant-status')
    const data = await response.json()

    if (!data.isOpen) {
      statusMessage.value = data.message
      todaySchedule.value = data.schedule
      // Show modal if not seen yet
      if (!hasSeenModal) {
        showStatusModal.value = true
        sessionStorage.setItem('hasSeenStatusModal', 'true')
      }
    }
  } catch (error) {
    console.error('Error checking restaurant status:', error)
  }
})
</script>

<template>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
<link href="https://fonts.googleapis.com/css2?family=Pacifico&family=Work+Sans:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">

  <div id="app" class="work-sans-regular">
    <NavBar />
    <main class="md:pt-[80px]">
      <router-view />
    </main>
    <Footer class="pb-[80px] md:pb-[0px]" />

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
</style>
