<template>
  <div class="order-success min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
    <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
      <!-- Loading state -->
      <div v-if="loading" class="mb-6">
        <div class="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
          <span class="text-4xl">⏳</span>
        </div>
        <h1 class="text-3xl font-bold mb-4 text-gray-900 mt-6">Loading Order...</h1>
        <p class="text-gray-600">Please wait while we check your order status.</p>
      </div>

      <!-- No order ID -->
      <div v-else-if="!orderId" class="mb-6">
        <div class="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
          <span class="text-4xl">❓</span>
        </div>
        <h1 class="text-3xl font-bold mb-4 text-gray-900 mt-6">No Order Found</h1>
        <p class="text-gray-600 mb-6">
          We couldn't find your order. Please check your order confirmation email.
        </p>
        <router-link
          to="/menu"
          class="block w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition"
        >
          Back to Menu
        </router-link>
      </div>

      <!-- Payment cancelled/failed -->
      <div v-else-if="status === 'cancelled'" class="mb-6">
        <div class="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <span class="text-4xl">✗</span>
        </div>
        <h1 class="text-3xl font-bold mb-4 text-red-600 mt-6">Payment Failed</h1>
        <p class="text-gray-600 mb-2">
          Unfortunately, your payment could not be processed.
        </p>
        <p class="text-sm text-gray-500 mb-6">
          Order ID: <span class="font-mono">{{ orderId }}</span>
        </p>
        <div class="space-y-3">
          <router-link
            to="/order"
            class="block w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition"
          >
            Try Again
          </router-link>
          <router-link
            to="/menu"
            class="block w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-md hover:bg-gray-300 transition"
          >
            Back to Menu
          </router-link>
        </div>
      </div>

      <!-- Payment pending (waiting for callback) -->
      <div v-else-if="status === 'pending'" class="mb-6">
        <div class="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
          <span class="text-4xl">⏳</span>
        </div>
        <h1 class="text-3xl font-bold mb-4 text-yellow-600 mt-6">Payment Processing...</h1>
        <p class="text-gray-600 mb-2">
          Your payment is being processed. This may take a few moments.
        </p>
        <p class="text-sm text-gray-500 mb-6">
          Order ID: <span class="font-mono">{{ orderId }}</span>
        </p>
        <p class="text-sm text-gray-400 mb-6">
          Please refresh this page in a few seconds, or check your email for confirmation.
        </p>
        <button
          @click="refreshStatus"
          class="block w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition"
        >
          Refresh Status
        </button>
      </div>

      <!-- Payment confirmed/successful -->
      <div v-else-if="status === 'confirmed'" class="mb-6">
        <div class="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <span class="text-4xl">✓</span>
        </div>
        <h1 class="text-3xl font-bold mb-4 text-gray-900 mt-6">Order Successful!</h1>
        <p class="text-gray-600 mb-2">
          Thank you for your order. We've received your payment and will process it shortly.
        </p>

        <div class="bg-gray-50 rounded-lg p-4 mb-6">
          <p class="text-sm text-gray-500 mb-1">Order ID:</p>
          <p class="font-mono text-lg font-medium">{{ orderId }}</p>
        </div>

        <p class="text-sm text-gray-500 mb-6">
          You will receive a confirmation email shortly with your order details.
        </p>

        <div class="space-y-3">
          <router-link
            to="/menu"
            class="block w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition"
          >
            Continue Shopping
          </router-link>
          <router-link
            to="/"
            class="block w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-md hover:bg-gray-300 transition"
          >
            Back to Home
          </router-link>
        </div>
      </div>

      <!-- Cash order success (default) -->
      <div v-else>
        <div class="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <span class="text-4xl">✓</span>
        </div>
        <h1 class="text-3xl font-bold mb-4 text-gray-900 mt-6">Order Successful!</h1>
        <p class="text-gray-600 mb-2">
          Thank you for your order. We've received your request and will process it shortly.
        </p>

        <div class="bg-gray-50 rounded-lg p-4 mb-6">
          <p class="text-sm text-gray-500 mb-1">Order ID:</p>
          <p class="font-mono text-lg font-medium">{{ orderId }}</p>
        </div>

        <p class="text-sm text-gray-500 mb-6">
          You will receive a confirmation shortly.
        </p>

        <div class="space-y-3">
          <router-link
            to="/menu"
            class="block w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition"
          >
            Continue Shopping
          </router-link>
          <router-link
            to="/"
            class="block w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-md hover:bg-gray-300 transition"
          >
            Back to Home
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

const checkBarionPaymentStatus = async () => {
  if (!paymentId.value) return

  try {
    console.log('Checking Barion payment status for:', paymentId.value)
    const res = await fetch('http://localhost:3001/api/barion/check-payment', {
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
        await fetch(`http://localhost:3001/api/orders/${orderId.value}/status`, {
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
        await fetch(`http://localhost:3001/api/orders/${orderId.value}/status`, {
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

const fetchOrderStatus = async () => {
  if (!orderId.value) {
    loading.value = false
    return
  }

  try {
    loading.value = true
    const res = await fetch(`http://localhost:3001/api/orders/${orderId.value}`)
    if (!res.ok) {
      console.error('Failed to fetch order')
      loading.value = false
      return
    }
    const data = await res.json()
    status.value = data.status || 'pending'

    // If we have a paymentId and order is still pending, check Barion status
    if (paymentId.value && status.value === 'pending') {
      await checkBarionPaymentStatus()
    }
  } catch (e) {
    console.error('Failed to fetch order:', e)
  } finally {
    loading.value = false
  }
}

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
