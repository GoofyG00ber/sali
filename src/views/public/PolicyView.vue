<template>
  <div class="policy-page min-h-screen bg-gray-50 py-12">
    <div class="container mx-auto px-4 max-w-4xl">
      <div v-if="policiesStore.loading" class="text-center py-12">
        <p class="text-gray-600 text-lg">Betöltés...</p>
      </div>

      <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {{ error }}
      </div>

      <div v-else class="bg-white rounded-lg shadow-lg p-8">
        <h1 class="text-3xl font-bold mb-6 text-gray-900">{{ title }}</h1>
        <div class="prose max-w-none" v-html="content"></div>

        <div class="mt-8 pt-6 border-t border-gray-200 text-sm text-gray-500">
          Utolsó frissítés: {{ lastUpdated }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { usePoliciesStore } from '@/stores/policies'

const route = useRoute()
const policiesStore = usePoliciesStore()

const type = computed(() => route.meta.type as 'aszf' | 'privacy')

const title = computed(() => {
  return type.value === 'aszf' ? 'Általános Szerződési Feltételek' : 'Adatvédelmi Nyilatkozat'
})

const content = computed(() => {
  if (type.value === 'aszf') {
    return policiesStore.aszf?.content || 'Nincs tartalom.'
  } else {
    return policiesStore.privacy?.content || 'Nincs tartalom.'
  }
})

const lastUpdated = computed(() => {
  const dateStr = type.value === 'aszf' ? policiesStore.aszf?.lastUpdated : policiesStore.privacy?.lastUpdated
  return dateStr ? new Date(dateStr).toLocaleString('hu-HU') : '-'
})

const error = computed(() => policiesStore.error)

const loadPolicy = async () => {
  if (type.value === 'aszf') {
    await policiesStore.fetchAszf()
  } else {
    await policiesStore.fetchPrivacy()
  }
}

onMounted(() => {
  loadPolicy()
})

watch(() => route.path, () => {
  loadPolicy()
})
</script>

<style>
/* Basic prose styling for HTML content */
.prose h1 { font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem; margin-top: 1.5rem; }
.prose h2 { font-size: 1.25rem; font-weight: 700; margin-bottom: 0.75rem; margin-top: 1.25rem; }
.prose h3 { font-size: 1.125rem; font-weight: 700; margin-bottom: 0.5rem; margin-top: 1rem; }
.prose p { margin-bottom: 1rem; line-height: 1.625; }
.prose ul { list-style-type: disc; padding-left: 1.25rem; margin-bottom: 1rem; }
.prose ol { list-style-type: decimal; padding-left: 1.25rem; margin-bottom: 1rem; }
.prose a { color: #2563eb; text-decoration: none; }
.prose a:hover { text-decoration: underline; }
</style>
