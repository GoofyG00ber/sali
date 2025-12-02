<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="w-full max-w-sm bg-white p-6 rounded-lg shadow">
      <h2 class="text-xl font-semibold mb-4">Belépés (teszt verzió)</h2>
      <form @submit.prevent="handleLogin">
        <label class="block text-sm text-gray-700">Admin jelszó:</label>
        <input v-model="password" type="password" class="w-full border p-2 rounded mt-1 mb-3" autocomplete="current-password" />
        <div v-if="error" class="text-sm text-red-600 mb-2">{{ error }}</div>
        <div class="flex gap-2">
          <button type="submit" class="flex-1 bg-blue-600 text-white py-2 rounded">Bejelentkezés</button>
        </div>
      </form>
      <p class="text-xs text-gray-500 mt-4">Teszt verziós weboldal, belépés csak tesztelési célokra.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const password = ref('')
const error = ref('')
const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const handleLogin = async () => {
  error.value = ''
  const ok = await auth.login(password.value)
  if (!ok) {
    error.value = 'Hibás jelszó'
    return
  }

  const redirect = (route.query.redirect as string) || '/'
  router.replace(redirect)
}

const logout = () => {
  auth.logout()
  password.value = ''
}
</script>

<style scoped>
.bg-gray-50 { background-color: #f9fafb }
</style>
