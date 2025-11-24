<template>
  <form id="contact-form" @submit.prevent="send" class="h-full max-w-xl mx-auto p-6 rounded-lg flex flex-col">
    <div>
      <h3 class="text-2xl font-semibold mb-4">Üzenet küldése</h3>

      <label class="block mb-2">
        <span class="text-sm text-gray-600">Név</span>
        <input v-model="name" required class="mt-1 block w-full px-2 py-1 rounded-md border-gray-200 shadow-sm focus:border-orange-400 focus:ring-orange-300" />
      </label>

      <label class="block mb-2">
        <span class="text-sm text-gray-600">Email</span>
        <input v-model="email" type="email" required class="mt-1 block w-full px-2 py-1 rounded-md border-gray-200 shadow-sm focus:border-orange-400 focus:ring-orange-300" />
      </label>

      <label class="block mb-3 h-48">
        <span class="text-sm text-gray-600">Üzenet</span>
        <textarea v-model="message" required class="mt-1 block w-full h-32 px-2 py-1 rounded-md border-gray-200 shadow-sm focus:border-orange-400 focus:ring-orange-300"></textarea>
      </label>
    </div>

    <div class="mt-auto flex items-center gap-3">
      <button :disabled="sending" class="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md shadow" type="submit">
        {{ sending ? 'Küldés...' : 'Küldés' }}
      </button>
      <p v-if="status" :class="status === 'ok' ? 'text-green-600' : 'text-red-600'">{{ messageText }}</p>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const name = ref('')
const email = ref('')
const message = ref('')
const sending = ref(false)
const status = ref<'ok'|'error'|null>(null)
const messageText = ref('')

async function send(){
  sending.value = true
  status.value = null
  try{
    const res = await fetch('/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.value, email: email.value, message: message.value })
    })
    const data = await res.json()
    if(res.ok){ status.value='ok'; messageText.value = data.message || 'Elküldve.'; name.value=''; email.value=''; message.value='' }
    else { status.value='error'; messageText.value = data?.error || 'Hiba történt.' }
  }catch(e: unknown){
    status.value = 'error'
    if(e && typeof e === 'object' && 'message' in e) messageText.value = (e as Error).message
    else messageText.value = String(e)
  }
  finally{ sending.value = false }
}
</script>

<style scoped>
/* Tailwind classes used in template; add small fallback styles for non-tailwind environments */
.bg-white{ background:#fff }
.shadow-md{ box-shadow:0 6px 18px rgba(0,0,0,0.06) }
.rounded-lg{ border-radius:12px }
.rounded-md{ border-radius:8px }
.text-2xl{ font-size:1.5rem }
.text-sm{ font-size:0.875rem }
.text-gray-600{ color:#6b7280 }
.bg-orange-500{ background:#f97316 }
.hover\:bg-orange-600:hover{ background:#ea580c }
.focus\:border-orange-400:focus{ border-color:#fb923c }
.focus\:ring-orange-300:focus{ box-shadow:0 0 0 3px rgba(251,146,60,0.15) }
</style>
