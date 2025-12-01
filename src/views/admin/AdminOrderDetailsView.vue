<template>
  <div class="admin-order-details min-h-screen bg-gray-100 p-8">
    <div class="max-w-4xl mx-auto">
      <!-- Header / Back Button -->
      <div class="mb-6 flex items-center justify-between">
        <button
          @click="goBack"
          class="flex items-center text-gray-600 hover:text-gray-900 transition"
        >
          <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
            <path d="M12 19l-7-7 7-7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
          </svg>
          Vissza a rendelésekhez
        </button>
        <div class="flex items-center gap-4">
          <button
            @click="printOrder"
            class="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition flex items-center"
            :disabled="printing"
          >
            <svg v-if="!printing" class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9V2h12v7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
              <path d="M6 14h12v8H6z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
            </svg>
            <span v-else class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
            {{ printing ? 'Nyomtatás...' : 'Nyomtatás' }}
          </button>
          <h1 class="text-2xl font-bold text-gray-800">Rendelés részletei</h1>
        </div>
      </div>

      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p class="mt-2 text-gray-600">Betöltés...</p>
      </div>

      <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {{ error }}
      </div>

      <div v-else-if="order" class="bg-white rounded-lg shadow-lg overflow-hidden">
        <!-- Order Header Status -->
        <div class="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <p class="text-sm text-gray-500">Rendelés azonosító</p>
            <h2 class="text-xl font-mono font-bold text-gray-900">#{{ order.id }}</h2>
            <p class="text-sm text-gray-500 mt-1">
              {{ new Date(order.createdAt).toLocaleString('hu-HU') }}
            </p>
          </div>

          <div class="flex flex-col items-end gap-2">
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-600">Státusz:</span>
              <select
                v-model="currentStatus"
                @change="updateStatus"
                class="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                :class="{
                  'bg-yellow-100 text-yellow-800': currentStatus === 'pending',
                  'bg-blue-100 text-blue-800': currentStatus === 'preparing',
                  'bg-green-100 text-green-800': currentStatus === 'ready' || currentStatus === 'delivered' || currentStatus === 'confirmed',
                  'bg-red-100 text-red-800': currentStatus === 'cancelled'
                }"
              >
                <option value="pending">Függőben</option>
                <option value="confirmed">Visszaigazolva</option>
                <option value="preparing">Készítés alatt</option>
                <option value="ready">Kész / Futárnál</option>
                <option value="delivered">Kiszállítva / Átvéve</option>
                <option value="cancelled">Törölve</option>
              </select>
            </div>
            <div class="flex items-center gap-2">
               <span class="text-sm text-gray-600">Fizetés:</span>
               <span :class="['px-2 py-1 text-xs rounded-full font-medium',
                  order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                  order.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800']">
                  {{
                    order.paymentStatus === 'paid' ? 'Fizetve' :
                    order.paymentStatus === 'failed' ? 'Sikertelen' : 'Függőben'
                  }}
               </span>
               <span class="text-xs text-gray-500">({{ order.paymentMethod === 'barion' ? 'Barion' : 'Utánvét' }})</span>
            </div>
          </div>
        </div>

        <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- Customer Details -->
          <div>
            <h3 class="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Vevő adatai</h3>
            <dl class="space-y-3 text-sm">
              <div class="grid grid-cols-3 gap-4">
                <dt class="font-medium text-gray-500">Név:</dt>
                <dd class="col-span-2 text-gray-900">{{ order.deliveryInfo.name }}</dd>
              </div>
              <div class="grid grid-cols-3 gap-4">
                <dt class="font-medium text-gray-500">Email:</dt>
                <dd class="col-span-2 text-gray-900">{{ order.deliveryInfo.email }}</dd>
              </div>
              <div class="grid grid-cols-3 gap-4">
                <dt class="font-medium text-gray-500">Telefon:</dt>
                <dd class="col-span-2 text-gray-900">{{ order.deliveryInfo.phone }}</dd>
              </div>
            </dl>

            <h3 class="text-lg font-semibold text-gray-800 mt-8 mb-4 border-b pb-2">Szállítási információk</h3>
            <dl class="space-y-3 text-sm">
              <div class="grid grid-cols-3 gap-4">
                <dt class="font-medium text-gray-500">Típus:</dt>
                <dd class="col-span-2">
                  <span :class="['px-2 py-1 text-xs rounded-full', order.deliveryType === 'delivery' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800']">
                    {{ order.deliveryType === 'delivery' ? 'Házhozszállítás' : 'Elvitel' }}
                  </span>
                </dd>
              </div>
              <template v-if="order.deliveryType === 'delivery'">
                <div class="grid grid-cols-3 gap-4">
                  <dt class="font-medium text-gray-500">Cím:</dt>
                  <dd class="col-span-2 text-gray-900">
                    {{ order.deliveryInfo.city }}, {{ order.deliveryInfo.zip }}<br>
                    {{ order.deliveryInfo.address }}
                  </dd>
                </div>
              </template>
              <div class="grid grid-cols-3 gap-4">
                <dt class="font-medium text-gray-500">Megjegyzés:</dt>
                <dd class="col-span-2 text-gray-900 italic">{{ order.deliveryInfo.note || '-' }}</dd>
              </div>
            </dl>
          </div>

          <!-- Order Items -->
          <div>
            <h3 class="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Rendelt tételek</h3>
            <div class="space-y-4">
              <div v-for="(item, index) in order.items" :key="index" class="flex justify-between items-start p-3 bg-gray-50 rounded-md">
                <div class="flex-1">
                  <div class="flex items-baseline justify-between">
                    <h4 class="font-medium text-gray-900">{{ item.foodTitle }}</h4>
                    <span class="text-sm font-medium text-gray-900">{{ item.price }} Ft</span>
                  </div>
                  <p class="text-sm text-gray-500">{{ item.priceLabel }}</p>

                  <!-- Extras -->
                  <div v-if="item.extras && item.extras.length > 0" class="mt-2 text-xs text-gray-600">
                    <p class="font-medium mb-1">Extrák:</p>
                    <ul class="list-disc list-inside pl-1">
                      <li v-for="(extra, eIndex) in item.extras" :key="eIndex">
                        {{ extra.title }} (+{{ extra.price }} Ft)
                      </li>
                    </ul>
                  </div>
                </div>
                <div class="ml-4 flex items-center">
                  <span class="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-bold">x{{ item.quantity }}</span>
                </div>
              </div>
            </div>

            <div class="mt-6 pt-4 border-t border-gray-200">
              <div class="flex justify-between items-center text-xl font-bold text-gray-900">
                <span>Összesen:</span>
                <span>{{ order.totalPrice }} Ft</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrdersStore, type Order } from '@/stores/orders'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const ordersStore = useOrdersStore()
const authStore = useAuthStore()

const order = ref<Order | null>(null)
const loading = ref(true)
const error = ref('')
const currentStatus = ref('')
const printing = ref(false)

const goBack = () => {
  router.push({ path: '/admin', query: { view: 'orders' } })
}

const fetchOrderDetails = async () => {
  loading.value = true
  error.value = ''
  const orderId = route.params.id as string

  try {
    // If we have orders in store, try to find it there first
    if (ordersStore.orders.length > 0) {
      const found = ordersStore.orders.find(o => o.id === orderId)
      if (found) {
        order.value = found
        currentStatus.value = found.status
        loading.value = false
        return
      }
    }

    // Otherwise fetch from API
    const res = await fetch(`http://localhost:3001/api/orders/${orderId}`)
    if (!res.ok) throw new Error('Rendelés nem található')

    const data = await res.json()
    order.value = data
    currentStatus.value = data.status
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Hiba történt a rendelés betöltésekor'
  } finally {
    loading.value = false
  }
}

const updateStatus = async () => {
  if (!order.value) return

  try {
    await ordersStore.updateOrderStatus(order.value.id, currentStatus.value as Order['status'])
    // Refresh local order data
    order.value.status = currentStatus.value as Order['status']
  } catch (e) {
    console.error('Failed to update status', e)
    alert('Hiba történt a státusz frissítésekor')
  }
}

const printOrder = async () => {
  if (!order.value) return

  printing.value = true
  try {
    const res = await fetch(`http://localhost:3001/api/orders/${order.value.id}/print`, {
      method: 'POST'
    })

    if (!res.ok) throw new Error('Nyomtatási hiba')

    // Optional: show success toast
  } catch (e) {
    console.error('Failed to print order', e)
    alert('Hiba történt a nyomtatás során')
  } finally {
    printing.value = false
  }
}

onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/admin')
    return
  }
  fetchOrderDetails()
})
</script>
