<template>
  <div class="order-page min-h-screen bg-gray-50 py-8">
    <div class="container mx-auto px-4 max-w-4xl">
      <!-- Title with Barion Banner -->
      <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-2 mb-4 text-center md:text-left">
        <h1 class="text-3xl font-bold">Rendelés leadása</h1>
        <img
          src="/static_images/barion/svg/barion-smart-banner-light.svg"
          alt="Barion Smart Payment"
          class="h-10 md:h-12"
        />
      </div>

      <!-- Cart Summary and Delivery Type Side-by-Side -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <!-- Cart Summary -->
        <div class="bg-white rounded-lg shadow p-4">
    <h2 class="text-xl font-bold mb-3">Rendelés összefoglaló</h2>
            <div v-if="cartStore.isEmpty" class="text-center py-8">
            <p class="text-gray-500">A kosarad üres</p>
            <router-link to="/menu" class="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
              Menühöz
            </router-link>
          </div>
          <div v-else>
            <div v-for="item in cartStore.items" :key="`${item.food.id}-${item.selectedPrice.label}`" class="py-2 border-b text-sm">
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <h3 class="font-medium text-sm">{{ item.food.title }}</h3>
                  <p class="text-xs text-gray-500">{{ item.selectedPrice.label }}</p>
                  <div v-if="item.extras && item.extras.length > 0" class="mt-2 ml-2 text-sm space-y-1">
                    <div v-for="extra in item.extras" :key="extra.id" class="text-gray-600 flex justify-between items-center">
                      <span class="font-medium">{{ extra.quantity }}x {{ extra.title }}</span>
                      <span class="text-gray-500">{{ (extra.price * extra.quantity).toLocaleString('hu-HU') }} Ft</span>
                    </div>
                  </div>
                </div>
                <div class="text-sm text-gray-500 mx-4">x{{ item.quantity }}</div>
                <div class="font-medium">{{ (item.selectedPrice.price * item.quantity + (item.extras?.reduce((sum, e) => sum + (e.price * e.quantity), 0) || 0) * item.quantity).toLocaleString('hu-HU') }} Ft</div>
              </div>
            </div>
            <div class="flex justify-between items-center pt-2 text-lg font-bold">
              <span>Total:</span>
              <span>{{ cartStore.totalPrice }} Ft</span>
            </div>
          </div>
        </div>

        <!-- Delivery Type and Form -->
        <div v-if="!cartStore.isEmpty" class="bg-white rounded-lg shadow p-4">
          <form @submit.prevent="handleSubmitOrder">
            <!-- Form Grid - 2 Columns on Desktop, 1 on Mobile -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <!-- Column 1: Customer Info and Delivery Address -->
              <div class="space-y-3 flex flex-col">
                <h3 class="text-base font-medium">Kapcsolattartó adatai</h3>
                <div>
                  <label for="name" class="block text-xs font-medium text-gray-700 mb-1">Teljes név *</label>
                  <input
                    id="name"
                    v-model="orderForm.name"
                    type="text"
                    required
                    class="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label for="phone" class="block text-xs font-medium text-gray-700 mb-1">Telefonszám *</label>
                  <input
                    id="phone"
                    v-model="orderForm.phone"
                    type="tel"
                    required
                    class="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label for="email" class="block text-xs font-medium text-gray-700 mb-1">E-mail cím *</label>
                  <input
                    id="email"
                    v-model="orderForm.email"
                    type="email"
                    required
                    class="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <!-- Additional Notes -->
                <div class="flex flex-col flex-1">
                  <label for="note" class="block text-xs font-medium text-gray-700 mb-1">Megjegyzés (opcionális)</label>
                  <textarea
                    id="note"
                    v-model="orderForm.note"
                    class="flex-1 px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Különleges kérés, allergia, stb."
                  ></textarea>
                </div>
              </div>

              <!-- Column 2: Szállítás, Fizetés, Megjegyzés -->
              <div class="space-y-3">
                <!-- Szállítás típusa -->
                <div>
                  <label class="block text-base font-medium mb-2">Szállítás típusa</label>
                  <div class="space-y-2">
                    <label class="flex items-start p-2 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition text-sm"
                      :class="deliveryType === 'pickup' ? 'border-ff6106 bg-fff4e6' : 'border-gray-300'">
                      <input
                        type="radio"
                        @change="deliveryType = 'pickup'"
                        :checked="deliveryType === 'pickup'"
                        class="mr-2 mt-1"
                      />
                      <div class="flex-1">
                        <div class="font-medium text-sm">Elvitel</div>
                        <div class="text-xs text-gray-500">Ingyenes</div>
                      </div>
                    </label>
                    <label class="flex items-start p-2 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition text-sm"
                      :class="deliveryType === 'delivery' ? 'border-ff6106 bg-fff4e6' : 'border-gray-300'">
                      <input
                        type="radio"
                        @change="deliveryType = 'delivery'"
                        :checked="deliveryType === 'delivery'"
                        class="mr-2 mt-1"
                      />
                      <div class="flex-1">
                        <div class="font-medium text-sm">Szállítás</div>
                        <div class="text-xs text-gray-500">0–500 Ft között</div>
                      </div>
                    </label>
                  </div>
                </div>

                <!-- Delivery Address (if delivery selected) -->
                <div v-if="deliveryType === 'delivery'" class="space-y-3 pt-3 border-t">
                  <h3 class="text-base font-medium">Szállítási cím</h3>
                  <div>
                    <label for="address" class="block text-xs font-medium text-gray-700 mb-1">Utca, házszám *</label>
                    <input
                      id="address"
                      v-model="orderForm.address"
                      type="text"
                      required
                      class="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label for="city" class="block text-xs font-medium text-gray-700 mb-1">Település *</label>
                    <select
                      id="city"
                      v-model="orderForm.city"
                      @change="handleCityChange"
                      required
                      class="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Válassz települést</option>
                      <option v-for="city in deliveryCities" :key="city.name" :value="city.name">
                        {{ city.name }} ({{ city.fee === 0 ? 'Free' : `${city.fee} Ft` }})
                      </option>
                    </select>
                  </div>
                  <div>
                    <label for="zip" class="block text-xs font-medium text-gray-700 mb-1">Irányítószám *</label>
                    <input
                      id="zip"
                      v-model="orderForm.zip"
                      type="text"
                      readonly
                      class="w-full px-3 py-1 text-sm border border-gray-300 rounded-md bg-gray-50 focus:ring-2 focus:ring-blue-500"
                      placeholder="Automatikusan kitöltve"
                    />
                  </div>
                </div>

                <!-- Fizetés módja -->
                <div>
                  <label class="block text-base font-medium mb-2">Fizetés módja</label>
                  <div class="space-y-2">
                    <label class="flex items-start p-2 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition text-sm"
                      :class="paymentMethod === 'cash' ? 'border-ff6106 bg-fff4e6' : 'border-gray-300'">
                      <input
                        type="radio"
                        v-model="paymentMethod"
                        value="cash"
                        class="mr-2 mt-1"
                      />
                      <div class="flex-1">
                        <div class="font-medium text-sm">Fizetés átvételnél</div>
                        <div class="text-xs text-gray-500">Készpénz, bankkártya, szép kártya</div>
                      </div>
                    </label>
                    <label class="flex items-start p-2 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition text-sm"
                      :class="paymentMethod === 'barion' ? 'border-ff6106 bg-fff4e6' : 'border-gray-300'">
                      <input
                        type="radio"
                        v-model="paymentMethod"
                        value="barion"
                        class="mr-2 mt-1"
                      />
                      <div class="flex-1 flex flex-col">
                        <div class="font-medium text-sm">Online fizetés</div>
                        <div class="flex justify-start">
                          <img src="/static_images/barion/svg/barion-smart-banner-light.svg" alt="Barion" class="h-6 w-auto" />
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <hr class="my-3" />

            <!-- Totals and Submit -->
            <div class="space-y-3">
              <!-- Total with Delivery -->
              <div class="bg-gray-50 rounded-lg p-3 text-sm">
                <div class="flex justify-between mb-1">
                  <span>Részösszeg:</span>
                  <span>{{ cartStore.totalPrice }} Ft</span>
                </div>
                <div class="flex justify-between mb-1">
                  <span>Szállítási díj:</span>
                  <span>{{ deliveryFee }} Ft</span>
                </div>
                <div class="flex justify-between font-bold pt-1 border-t text-base">
                  <span>Végösszeg:</span>
                  <span>{{ finalTotal }} Ft</span>
                </div>
              </div>

              <!-- Policy Acceptance -->
              <label class="flex items-start cursor-pointer">
                <input
                  type="checkbox"
                  v-model="acceptedPolicies"
                  class="mt-0.5 mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span class="text-xs text-gray-700">
                  Elolvastam és elfogadom az <router-link to="/aszf" target="_blank" class="text-blue-600 hover:underline">Általános Szerződési Feltételeket</router-link> és az <router-link to="/adatvedelem" target="_blank" class="text-blue-600 hover:underline">Adatvédelmi Nyilatkozatot</router-link>.
                </span>
              </label>

              <!-- Error Message -->
              <div v-if="errorMessage" class="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
                {{ errorMessage }}
              </div>

              <!-- Submit -->
              <button
                type="submit"
                :disabled="submitting"
                class="w-full bg-ff6106 text-white py-2 px-4 rounded-md hover:bg-e55a00 disabled:bg-gray-400 disabled:cursor-not-allowed transition text-base font-medium"
              >
                {{ submitting ? 'Feldolgozás...' : paymentMethod === 'barion' ? 'Tovább a fizetéshez' : 'Rendelés leadása' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <DrinkOfferModal
      :isOpen="showDrinkModal"
      :drink="offeredDrink"
      @close="showDrinkModal = false"
      @add="handleAddDrink"
    />
  </div>
</template><script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useOrdersStore } from '@/stores/orders'
import type { OrderItem } from '@/stores/orders'
import DrinkOfferModal from '@/components/DrinkOfferModal.vue'
import { useFoodsStore, type Food } from '@/stores/foods'

const router = useRouter()
const cartStore = useCartStore()
const ordersStore = useOrdersStore()
const foodsStore = useFoodsStore()

const showDrinkModal = ref(false)
const offeredDrink = ref<Food | null>(null)

const deliveryType = ref<'pickup' | 'delivery'>('pickup')
const paymentMethod = ref<'barion' | 'cash'>('cash')
const submitting = ref(false)
const errorMessage = ref('')
const acceptedPolicies = ref(false)

// City delivery configuration
const deliveryCities = [
  { name: 'Aszód', zip: '2170', fee: 300 },
  { name: 'Verseg', zip: '2174', fee: 400 },
  { name: 'Iklad', zip: '2181', fee: 500 },
  { name: 'Kartal', zip: '2173', fee: 0 }
]

const orderForm = ref({
  name: '',
  phone: '',
  email: '',
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

onMounted(async () => {
  if (cartStore.isEmpty) return

  // Check if cart has any drink (category 12)
  const hasDrink = cartStore.items.some(item => {
    const cId = item.food.categoryId ?? item.food.category_id
    return Number(cId) === 12
  })

  if (!hasDrink) {
    // Fetch foods if needed
    if (foodsStore.foods.length === 0) {
      await foodsStore.fetchFoods()
    }

    // RE-CHECK hasDrink after fetching foods, in case we can match by ID (for items added before fix)
    const hasDrinkRecheck = cartStore.items.some(item => {
      const cId = item.food.categoryId ?? item.food.category_id
      if (cId !== undefined) return Number(cId) === 12

      // Fallback: find in foodsStore
      const foodInStore = foodsStore.foods.find(f => f.id === item.food.id)
      if (foodInStore) {
        const storeCId = foodInStore.categoryId ?? foodInStore.category_id
        return Number(storeCId) === 12
      }
      return false
    })

    if (hasDrinkRecheck) return

    // Find first active drink
    const drink = foodsStore.foods.find(f => {
      const catId = f.categoryId || f.category_id
      const isActive = f.active === 1 || f.active === true
      return catId === 12 && isActive
    })

    if (drink) {
      offeredDrink.value = drink
      showDrinkModal.value = true
    }
  }
})

function handleAddDrink(payload: { drink: Food; price: { label: string; price: number } }) {
  cartStore.addItem(payload.drink, payload.price, 1)
  showDrinkModal.value = false
}

const handleSubmitOrder = async () => {
  errorMessage.value = ''

  if (!acceptedPolicies.value) {
    errorMessage.value = 'A rendelés leadásához el kell fogadnod az ÁSZF-et és az Adatvédelmi Nyilatkozatot.'
    return
  }

  submitting.value = true

  try {
    // Check restaurant status before submitting
    const statusResponse = await fetch('/api/restaurant-status')
    const statusData = await statusResponse.json()

    if (!statusData.isOpen) {
      errorMessage.value = statusData.message || 'Az étterem jelenleg zárva tart.'
      submitting.value = false
      return
    }

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
        phone: orderForm.value.phone,
        email: orderForm.value.email,
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
.border-ff6106 {
  border-color: #ff6106;
}

.bg-fff4e6 {
  background-color: #fff4e6;
}

.bg-ff6106 {
  background-color: #ff6106;
}

.hover\:bg-e55a00:hover {
  background-color: #e55a00;
  cursor: pointer;
}

button {
  cursor: pointer;
}
</style>
