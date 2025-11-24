<template>
  <div class="order-page min-h-screen bg-gray-50 py-8">
    <div class="container mx-auto px-4 max-w-4xl">
  <h1 class="text-4xl font-bold mb-8">Rendelés leadása</h1>

      <!-- Cart Summary -->
      <div class="bg-white rounded-lg shadow p-6 mb-6">
  <h2 class="text-2xl font-bold mb-4">Rendelés összefoglaló</h2>
          <div v-if="cartStore.isEmpty" class="text-center py-8">
          <p class="text-gray-500">A kosarad üres</p>
          <router-link to="/menu" class="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
            Menühöz
          </router-link>
        </div>
        <div v-else>
          <div v-for="item in cartStore.items" :key="`${item.food.id}-${item.selectedPrice.label}`" class="py-3 border-b">
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <h3 class="font-medium">{{ item.food.title }}</h3>
                <p class="text-sm text-gray-500">{{ item.selectedPrice.label }}</p>
                <div v-if="item.extras && item.extras.length > 0" class="mt-2 ml-2 text-sm space-y-1">
                  <div v-for="extra in item.extras" :key="extra.id" class="text-gray-600">
                    <span class="font-medium">{{ extra.quantity }}x {{ extra.title }}</span>
                    <span class="text-gray-500">({{ (extra.price * extra.quantity).toLocaleString('hu-HU') }} Ft)</span>
                  </div>
                </div>
              </div>
              <div class="text-sm text-gray-500 mx-4">x{{ item.quantity }}</div>
              <div class="font-medium">{{ (item.selectedPrice.price * item.quantity + (item.extras?.reduce((sum, e) => sum + (e.price * e.quantity), 0) || 0) * item.quantity).toLocaleString('hu-HU') }} Ft</div>
            </div>
          </div>
          <div class="flex justify-between items-center pt-4 text-xl font-bold">
            <span>Total:</span>
            <span>{{ cartStore.totalPrice }} Ft</span>
          </div>
        </div>
      </div>

      <!-- Order Form -->
      <div v-if="!cartStore.isEmpty" class="bg-white rounded-lg shadow p-6">
        <form @submit.prevent="handleSubmitOrder">
          <!-- Delivery Type -->
          <div class="mb-6">
            <label class="block text-lg font-medium mb-3">Szállítás típusa</label>
            <div class="grid grid-cols-2 gap-4">
              <button
                type="button"
                @click="deliveryType = 'pickup'"
                :class="['p-4 border-2 rounded-lg transition', deliveryType === 'pickup' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-gray-400']"
              >
                <div class="text-2xl mb-2">🏪</div>
                <div class="font-medium">Elvitel</div>
                <div class="text-sm text-gray-500">Ingyenes</div>
              </button>
              <button
                type="button"
                @click="deliveryType = 'delivery'"
                :class="['p-4 border-2 rounded-lg transition', deliveryType === 'delivery' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-gray-400']"
              >
                <div class="text-2xl mb-2">🚚</div>
                <div class="font-medium">Szállítás</div>
                <div class="text-sm text-gray-500">0–500 Ft között</div>
              </button>
            </div>
          </div>

          <!-- Customer Information -->
          <div class="space-y-4 mb-6">
            <h3 class="text-lg font-medium">Kapcsolattartó adatai</h3>

            <div>
              <label for="name" class="block text-sm font-medium text-gray-700 mb-2">Teljes név *</label>
              <input
                id="name"
                v-model="orderForm.name"
                type="text"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-2">E-mail *</label>
              <input
                id="email"
                v-model="orderForm.email"
                type="email"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">Telefonszám *</label>
              <input
                id="phone"
                v-model="orderForm.phone"
                type="tel"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <!-- Delivery Address (if delivery selected) -->
          <div v-if="deliveryType === 'delivery'" class="space-y-4 mb-6">
            <h3 class="text-lg font-medium">Szállítási cím</h3>

            <div>
              <label for="address" class="block text-sm font-medium text-gray-700 mb-2">Utca, házszám *</label>
              <input
                id="address"
                v-model="orderForm.address"
                type="text"
                :required="deliveryType === 'delivery'"
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="city" class="block text-sm font-medium text-gray-700 mb-2">Település *</label>
                <select
                  id="city"
                  v-model="orderForm.city"
                  @change="handleCityChange"
                  :required="deliveryType === 'delivery'"
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Válassz települést</option>
                  <option v-for="city in deliveryCities" :key="city.name" :value="city.name">
                    {{ city.name }} ({{ city.fee === 0 ? 'Free' : `${city.fee} Ft` }})
                  </option>
                </select>
              </div>
              <div>
                <label for="zip" class="block text-sm font-medium text-gray-700 mb-2">Irányítószám *</label>
                <input
                  id="zip"
                  v-model="orderForm.zip"
                  type="text"
                  :required="deliveryType === 'delivery'"
                  readonly
                  class="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 focus:ring-2 focus:ring-blue-500"
                  placeholder="Automatikusan kitöltve"
                />
              </div>
            </div>
          </div>

          <!-- Additional Notes -->
          <div class="mb-6">
            <label for="note" class="block text-sm font-medium text-gray-700 mb-2">Megjegyzés (opcionális)</label>
            <textarea
              id="note"
              v-model="orderForm.note"
              rows="3"
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="Különleges kérés, allergia, stb."
            ></textarea>
          </div>

          <!-- Payment Method -->
          <div class="mb-6">
            <label class="block text-lg font-medium mb-3">Fizetés módja</label>
            <div class="space-y-3">
              <label class="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition"
                :class="paymentMethod === 'barion' ? 'border-blue-600 bg-blue-50' : 'border-gray-300'">
                <input
                  type="radio"
                  v-model="paymentMethod"
                  value="barion"
                  class="mr-3"
                />
                <div class="flex-1">
                  <div class="font-medium">💳 Online fizetés (Barion)</div>
                  <div class="text-sm text-gray-500">Biztonságos bankkártyás fizetés</div>
                </div>
              </label>
              <label class="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition"
                :class="paymentMethod === 'cash' ? 'border-blue-600 bg-blue-50' : 'border-gray-300'">
                <input
                  type="radio"
                  v-model="paymentMethod"
                  value="cash"
                  class="mr-3"
                />
                <div class="flex-1">
                  <div class="font-medium">💵 Készpénz átvételkor ({{ deliveryType === 'delivery' ? 'szállítás' : 'elvitel' }})</div>
                  <div class="text-sm text-gray-500">Fizetés átvételkor</div>
                </div>
              </label>
            </div>
          </div>

          <!-- Total with Delivery -->
          <div class="bg-gray-50 rounded-lg p-4 mb-6">
            <div class="flex justify-between mb-2">
              <span>Részösszeg:</span>
              <span>{{ cartStore.totalPrice }} Ft</span>
            </div>
            <div class="flex justify-between mb-2">
              <span>Szállítási díj:</span>
              <span>{{ deliveryFee }} Ft</span>
            </div>
            <div class="flex justify-between text-xl font-bold pt-2 border-t">
              <span>Végösszeg:</span>
              <span>{{ finalTotal }} Ft</span>
            </div>
          </div>

          <!-- Submit -->
          <div v-if="errorMessage" class="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {{ errorMessage }}
          </div>

          <button
            type="submit"
            :disabled="submitting"
            class="w-full bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition text-lg font-medium"
          >
            {{ submitting ? 'Feldolgozás...' : paymentMethod === 'barion' ? 'Tovább a fizetéshez' : 'Rendelés leadása' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useOrdersStore } from '@/stores/orders'
import type { OrderItem } from '@/stores/orders'

const router = useRouter()
const cartStore = useCartStore()
const ordersStore = useOrdersStore()

const deliveryType = ref<'pickup' | 'delivery'>('pickup')
const paymentMethod = ref<'barion' | 'cash'>('cash')
const submitting = ref(false)
const errorMessage = ref('')

// City delivery configuration
const deliveryCities = [
  { name: 'Aszód', zip: '2170', fee: 300 },
  { name: 'Verseg', zip: '2174', fee: 400 },
  { name: 'Iklad', zip: '2181', fee: 500 },
  { name: 'Kartal', zip: '2173', fee: 0 }
]

const orderForm = ref({
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  zip: '',
  note: ''
})

// Watch for city changes to auto-fill ZIP and update delivery fee
const selectedCityData = computed(() => {
  return deliveryCities.find(c => c.name === orderForm.value.city)
})

const deliveryFee = computed(() => {
  if (deliveryType.value === 'pickup') return 0
  return selectedCityData.value?.fee ?? 0
})

const finalTotal = computed(() => {
  return cartStore.totalPrice + deliveryFee.value
})

// Auto-fill ZIP when city is selected
const handleCityChange = () => {
  if (selectedCityData.value) {
    orderForm.value.zip = selectedCityData.value.zip
  }
}

const handleSubmitOrder = async () => {
  errorMessage.value = ''
  submitting.value = true

  try {
    // Prepare order items
    const items: OrderItem[] = cartStore.items.map(item => ({
      itemId: item.food.id,
      foodTitle: item.food.title,
      priceLabel: item.selectedPrice.label,
      price: item.selectedPrice.price,
      quantity: item.quantity,
      extras: item.extras && item.extras.length > 0 ? item.extras.map(e => ({
        id: e.id,
        title: e.title,
        quantity: e.quantity,
        price: e.price
      })) : undefined
    }))

    const orderData = {
      items,
      deliveryType: deliveryType.value,
      deliveryInfo: {
        name: orderForm.value.name,
        email: orderForm.value.email,
        phone: orderForm.value.phone,
        address: orderForm.value.address,
        city: orderForm.value.city,
        zip: orderForm.value.zip,
        note: orderForm.value.note
      },
      totalPrice: finalTotal.value,
      paymentMethod: paymentMethod.value
    }

    // Handle payment
    if (paymentMethod.value === 'barion') {
      // For Barion: create order with pending status BEFORE payment
      // The backend callback will update it to 'confirmed' or 'cancelled'
      const order = await ordersStore.createOrder({
        ...orderData,
        paymentMethod: 'barion',
        status: 'pending'
      })

      if (!order) {
        errorMessage.value = 'A rendelés létrehozása sikertelen. Kérjük próbáld újra.'
        return
      }

      // Initiate Barion payment using order.id as PaymentRequestId
      await initiateBarionPayment(finalTotal.value, items, order.id)
    } else {
      // Cash payment - create order immediately
      const order = await ordersStore.createOrder(orderData)

      if (!order) {
        errorMessage.value = 'A rendelés létrehozása sikertelen. Kérjük próbáld újra.'
        return
      }

      cartStore.clearCart()
      router.push(`/order-success?orderId=${order.id}`)
    }
    } catch (error) {
    console.error('Error submitting order:', error)
    errorMessage.value = 'Hiba történt a rendelés feldolgozása közben.'
  } finally {
    submitting.value = false
  }
}

const initiateBarionPayment = async (amount: number, items: OrderItem[], orderId: string) => {
  try {
    // Use the actual order ID for Barion payment request
    const tempOrderId = orderId

    // Validate and prepare items
    const barionItems = items.map(item => {
      const name = (item.foodTitle || 'Food Item').substring(0, 250) // Max 250 chars
      const description = (item.priceLabel || item.foodTitle || 'Item').substring(0, 500) // Max 500 chars
      return {
        Name: name,
        Description: description,
        Quantity: item.quantity,
        Unit: 'piece',
        UnitPrice: Math.round(item.price), // Ensure integer for HUF
        ItemTotal: Math.round(item.price * item.quantity) // Ensure integer for HUF
      }
    })

    // Barion Sandbox integration
    const barionData = {
      POSKey: '4926b2ca-633f-420a-b1dc-c2d03e669fdf',
      PaymentType: 'Immediate',
      GuestCheckOut: true,
      FundingSources: ['All'],
      PaymentRequestId: tempOrderId,
      Locale: 'hu-HU',
      Currency: 'HUF',
      Transactions: [{
        POSTransactionId: `${tempOrderId}-1`,
        Payee: 'czanik.csanad@gmail.com',
        Total: Math.round(amount), // Ensure integer for HUF
        Items: barionItems
      }],
      RedirectUrl: `${window.location.origin}/order-success?orderId=${tempOrderId}`,
      CallbackUrl: 'https://webhook.site/unique-url-here'
    }

    console.log('Barion Payment Request:', barionData)

    // For sandbox testing
    const barionEndpoint = 'https://api.test.barion.com/v2/Payment/Start'

    const response = await fetch(barionEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(barionData)
    })

    const result = await response.json()
    console.log('Barion Response:', result)

    // Check for errors
    if (result.Errors && result.Errors.length > 0) {
      // Log full error details for debugging
      console.error('Barion Full Error Details:', JSON.stringify(result.Errors, null, 2))
      const errorMsg = result.Errors.map((err: { ErrorCode?: string; Title?: string; Description?: string }) =>
        `${err.ErrorCode || 'Ismeretlen'}: ${err.Title || err.Description || 'Ismeretlen hiba'}`
      ).join(', ')
      errorMessage.value = 'A fizetés inicializálása sikertelen: ' + errorMsg
      console.error('Barion Errors:', result.Errors)
      return
    }

    // Check if payment was successful
    if (!result.PaymentId || !result.GatewayUrl) {
      errorMessage.value = 'Nem érkezett fizetési átjáró URL. Kérjük, válassz készpénzes fizetést.'
      console.error('Missing PaymentId or GatewayUrl:', result)
      return
    }

  // Success - redirect to Barion
  console.log('Redirecting to Barion:', result.GatewayUrl)
  // Store PaymentId and order ID in sessionStorage
  sessionStorage.setItem('barionPaymentId', result.PaymentId)
  sessionStorage.setItem('barionOrderId', orderId)

  // Clear cart only after Barion payment has been successfully initialized
  cartStore.clearCart()
  window.location.href = result.GatewayUrl

  } catch (error) {
    console.error('Barion payment error:', error)
    errorMessage.value = 'A fizetés inicializálása sikertelen. Próbálj készpénzes fizetést vagy lépj kapcsolatba az ügyfélszolgálattal.'
  }
}
</script>

<style scoped>
/* Additional styles if needed */
</style>
