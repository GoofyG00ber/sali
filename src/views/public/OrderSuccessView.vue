<template>
  <div class="order-success min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
    <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
      <!-- Loading state -->
      <div v-if="loading" class="mb-6">
        <div class="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
          <span class="text-4xl">⏳</span>
        </div>
        <h1 class="text-3xl font-bold mb-4 text-gray-900 mt-6">Rendelés betöltése...</h1>
        <p class="text-gray-600">Kérjük, várj, amíg ellenőrizzük a rendelésed állapotát.</p>
      </div>

      <!-- No order ID -->
      <div v-else-if="!orderId" class="mb-6">
        <div class="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
          <span class="text-4xl">❓</span>
        </div>
        <h1 class="text-3xl font-bold mb-4 text-gray-900 mt-6">Nincs rendelés találva</h1>
        <p class="text-gray-600 mb-6">
          Nem találtuk meg a rendelésed. Kérjük, ellenőrizd a megerősítő e-mailt.
        </p>
        <router-link
          to="/menu"
          class="block w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition"
        >
          Vissza a menühöz
        </router-link>
      </div>

      <!-- Payment cancelled/failed -->
      <div v-else-if="status === 'cancelled'" class="mb-6">
        <div class="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <span class="text-4xl">✗</span>
        </div>
        <h1 class="text-3xl font-bold mb-4 text-red-600 mt-6">Fizetés sikertelen</h1>
        <p class="text-gray-600 mb-2">
          Sajnálom, a fizetésed nem dolgozható fel.
        </p>
        <p class="text-sm text-gray-500 mb-6">
          Rendelés ID: <span class="font-mono">{{ orderId }}</span>
        </p>
        <div class="space-y-3">
          <router-link
            to="/order"
            class="block w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition"
          >
            Próbáld újra
          </router-link>
          <router-link
            to="/menu"
            class="block w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-md hover:bg-gray-300 transition"
          >
            Vissza a menühez
          </router-link>
        </div>
      </div>

      <!-- Payment pending (waiting for callback) -->
      <div v-else-if="status === 'pending'" class="mb-6">
        <div class="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
          <span class="text-4xl">⏳</span>
        </div>
        <h1 class="text-3xl font-bold mb-4 text-yellow-600 mt-6">Fizetés feldolgozása...</h1>
        <p class="text-gray-600 mb-2">
          A fizetésed feldolgozása folyamatban van. Ez eltarthat néhány másodpercig.
        </p>
        <p class="text-sm text-gray-500 mb-6">
          Rendelés ID: <span class="font-mono">{{ orderId }}</span>
        </p>
        <p class="text-sm text-gray-400 mb-6">
          Kérjük, frissítsd az oldalt néhány másodperc múlva, vagy ellenőrizd az e-mailt a megerősítésért.
        </p>
        <button
          @click="refreshStatus"
          class="block w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition"
        >
          Állapot frissítése
        </button>
      </div>

      <!-- Payment confirmed/successful -->
      <div v-else-if="status === 'confirmed'" class="mb-6">
        <div class="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <span class="text-4xl">✓</span>
        </div>
        <h1 class="text-3xl font-bold mb-4 text-gray-900 mt-6">Rendelés sikeres!</h1>
        <p class="text-gray-600 mb-2">
          Köszönjük a rendelésed. Kaptuk a fizetésed és hamarosan feldolgozzuk.
        </p>

        <div class="bg-gray-50 rounded-lg p-4 mb-6">
          <p class="text-sm text-gray-500 mb-1">Rendelés ID:</p>
          <p class="font-mono text-lg font-medium">{{ orderId }}</p>
        </div>

        <p class="text-sm text-gray-500 mb-6">
          Rövid időn belül megerősítő e-mailt fogsz kapni a rendelés adataival.
        </p>

        <div class="space-y-3">
          <router-link
            to="/menu"
            class="block w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition"
          >
            Folytatás a vásárlással
          </router-link>
          <router-link
            to="/"
            class="block w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-md hover:bg-gray-300 transition"
          >
            Vissza a kezdőlapra
          </router-link>
        </div>
      </div>

      <!-- Cash order success (default) -->
      <div v-else>
        <div class="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <span class="text-4xl">✓</span>
        </div>
        <h1 class="text-3xl font-bold mb-4 text-gray-900 mt-6">Rendelés sikeres!</h1>
        <p class="text-gray-600 mb-2">
          Köszönjük a rendelésed. Kaptuk a kérésd és hamarosan feldolgozzuk.
        </p>

        <div class="bg-gray-50 rounded-lg p-4 mb-6">
          <p class="text-sm text-gray-500 mb-1">Rendelés ID:</p>
          <p class="font-mono text-lg font-medium">{{ orderId }}</p>
        </div>

        <p class="text-sm text-gray-500 mb-6">
          Rövid időn belül megerősítő e-mailt fogsz kapni.
        </p>

        <div class="space-y-3">
          <router-link
            to="/menu"
            class="block w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition"
          >
            Folytatás a vásárlással
          </router-link>
          <router-link
            to="/"
            class="block w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-md hover:bg-gray-300 transition"
          >
            Vissza a kezdőlapra
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const orderId = ref<string | null>(null)
const paymentId = ref<string | null>(null)
const status = ref<'pending' | 'confirmed' | 'cancelled' | null>(null)
const loading = ref(true)
let pollingInterval: number | null = null
const orderTotal = ref<number | null>(null)
const currency = ref<string>('HUF')
const purchaseTracked = ref(false)

const checkBarionPaymentStatus = async () => {
  if (!paymentId.value) return

  try {
    console.log('Checking Barion payment status for:', paymentId.value)
    const res = await fetch('/api/barion/check-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId: paymentId.value })
    })

    if (!res.ok) {
      console.error('Failed to check Barion payment status')
      return
    }

    const barionResult = await res.json()
    console.log('Barion full response:', barionResult)
    console.log('Barion payment state:', barionResult.Status)
    console.log('Available fields:', Object.keys(barionResult))

    // Check for errors in response
    if (barionResult.Errors && barionResult.Errors.length > 0) {
      console.error('Barion API returned errors:', barionResult.Errors)
      return
    }

    // Try different possible field names for status
    const paymentStatus = barionResult.Status ||
                         barionResult.status ||
                         barionResult.PaymentStatus ||
                         barionResult.State ||
                         barionResult.state

    console.log('Extracted payment status:', paymentStatus)

    // Update order status based on Barion response
    if (paymentStatus === 'Succeeded') {
      // Update our database
      if (orderId.value) {
        await fetch(`/api/orders/${orderId.value}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'confirmed' })
        })
      }
      status.value = 'confirmed'
      // Stop polling once payment is successful
      if (pollingInterval) {
        clearInterval(pollingInterval)
        pollingInterval = null
      }
    } else if (['Canceled', 'Expired', 'Failed', 'Cancelled'].includes(paymentStatus)) {
      // Update our database
      if (orderId.value) {
        await fetch(`/api/orders/${orderId.value}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'cancelled' })
        })
      }
      status.value = 'cancelled'
      // Stop polling once payment is failed
      if (pollingInterval) {
        clearInterval(pollingInterval)
        pollingInterval = null
      }
    }
  } catch (e) {
    console.error('Failed to check Barion payment status:', e)
  }
}

const fetchOrderDetails = async () => {
  try {
    const res = await fetch(`/api/orders/${orderId.value}`)
    if (res.ok) {
      const data = await res.json()

const refreshStatus = async () => {
  await fetchOrderStatus()
}

onMounted(async () => {
  // Get orderId and paymentId from URL query parameters or sessionStorage
  orderId.value = route.query.orderId as string || sessionStorage.getItem('barionOrderId') || null
  paymentId.value = route.query.paymentId as string || sessionStorage.getItem('barionPaymentId') || null

  // Clear sessionStorage after reading
  if (sessionStorage.getItem('barionPaymentId')) {
    sessionStorage.removeItem('barionPaymentId')
    sessionStorage.removeItem('barionOrderId')
  }

  if (orderId.value) {
    await fetchOrderStatus()

    // If we have a paymentId and status is pending, start polling
    if (paymentId.value && status.value === 'pending') {
      console.log('Starting payment status polling...')
      // Poll every 3 seconds for up to 2 minutes
      let pollCount = 0
      pollingInterval = window.setInterval(async () => {
        pollCount++
        if (pollCount > 40) {
          // Stop after 2 minutes (40 * 3 seconds)
          if (pollingInterval) {
            clearInterval(pollingInterval)
            pollingInterval = null
          }
          return
        }
        await checkBarionPaymentStatus()
      }, 3000)
    }
  } else {
    loading.value = false
  }
})

onUnmounted(() => {
  // Clean up polling interval when component is destroyed
  if (pollingInterval) {
    clearInterval(pollingInterval)
    pollingInterval = null
  }
})
</script>
