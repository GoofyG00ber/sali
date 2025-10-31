<template>
  <div class="order-success min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
    <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
      <div class="mb-6">
        <div class="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <span class="text-4xl">✓</span>
        </div>
      </div>

      <h1 class="text-3xl font-bold mb-4 text-gray-900">Order Successful!</h1>

      <p class="text-gray-600 mb-6">
        Thank you for your order. We've received your request and will process it shortly.
      </p>

      <div v-if="orderId" class="bg-gray-50 rounded-lg p-4 mb-6">
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const orderId = ref('')

onMounted(() => {
  orderId.value = route.query.orderId as string || ''
})
</script>
