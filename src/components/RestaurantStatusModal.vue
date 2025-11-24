<template>
  <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
    <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all scale-100">
      <div class="bg-red-600 p-6 text-white text-center">
        <div class="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 class="text-2xl font-bold">Étterem zárva</h2>
      </div>

      <div class="p-8 text-center">
        <p class="text-gray-700 text-lg mb-6">
          {{ message || 'Jelenleg nem fogadunk rendeléseket.' }}
        </p>

        <div v-if="schedule" class="bg-gray-50 rounded-lg p-4 mb-6 text-sm text-gray-600">
          <p class="font-semibold mb-1">Mai nyitvatartás:</p>
          <p>{{ schedule.from }} - {{ schedule.to }}</p>
        </div>

        <button
          @click="$emit('close')"
          class="w-full bg-gray-800 text-white font-bold py-3 px-6 rounded-xl hover:bg-gray-900 transition transform hover:scale-105"
        >
          Rendben
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isOpen: boolean
  message?: string
  schedule?: { from: string; to: string } | null
}>()

defineEmits<{
  (e: 'close'): void
}>()
</script>
