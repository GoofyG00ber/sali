<template>
  <div class="pizza-builder min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-8">
    <div class="container mx-auto px-4 max-w-6xl">
      <!-- Header -->
      <div class="text-center mb-8">
  <h1 class="text-5xl font-bold text-gray-800 mb-2">Egyedi pizza készítő</h1>
  <p class="text-lg text-gray-600">Készítsd el a tökéletes pizzádat!</p>
      </div>

      <div class="grid lg:grid-cols-2 gap-8">
        <!-- Pizza Preview -->
        <div class="bg-white rounded-2xl shadow-xl p-8 sticky top-8 h-fit">
          <h2 class="text-2xl font-bold mb-6 text-center">A pizzád</h2>

          <!-- Visual Pizza Preview -->
          <div class="relative mx-auto" style="width: 350px; height: 350px;">
            <!-- Pizza Base -->
            <div class="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 shadow-2xl border-8 border-yellow-600"></div>

            <!-- Sauce Layer -->
            <div v-if="pizzaConfig.sauce" class="absolute inset-4 rounded-full opacity-80"
              :class="{
                'bg-gradient-to-br from-red-600 to-red-700': pizzaConfig.sauce === 'tomato',
                'bg-gradient-to-br from-green-100 to-green-200': pizzaConfig.sauce === 'pesto',
                'bg-gradient-to-br from-white to-gray-100': pizzaConfig.sauce === 'cream',
                'bg-gradient-to-br from-yellow-600 to-orange-600': pizzaConfig.sauce === 'bbq'
              }">
            </div>

            <!-- Cheese Layer -->
            <div v-if="pizzaConfig.cheese" class="absolute inset-6 rounded-full opacity-70 bg-gradient-to-br from-yellow-300 to-yellow-400">
            </div>

            <!-- Toppings Visualization -->
            <div class="absolute inset-8 rounded-full overflow-hidden">
              <!-- Full Pizza Toppings -->
              <div v-if="!pizzaConfig.halfAndHalf" class="w-full h-full relative">
                <template v-for="topping in pizzaConfig.toppings.full" :key="topping">
                  <div v-for="(pos, idx) in getToppingPositions(topping, 'full')" :key="`full-${topping}-${idx}`"
                    class="absolute opacity-90 shadow-md"
                    :style="pos"
                    :class="[getToppingConfig(topping)?.previewClass, getToppingConfig(topping)?.size]">
                  </div>
                </template>
              </div>

              <!-- Half and Half Toppings -->
              <div v-else class="w-full h-full relative">
                <!-- Left Half -->
                <div class="absolute inset-0 overflow-hidden" style="clip-path: polygon(0 0, 50% 0, 50% 100%, 0 100%);">
                  <template v-for="topping in pizzaConfig.toppings.left" :key="topping">
                    <div v-for="(pos, idx) in getToppingPositions(topping, 'left')" :key="`left-${topping}-${idx}`"
                      class="absolute opacity-90 shadow-md"
                      :style="pos"
                      :class="[getToppingConfig(topping)?.previewClass, getToppingConfig(topping)?.size]">
                    </div>
                  </template>
                </div>

                <!-- Right Half -->
                <div class="absolute inset-0 overflow-hidden" style="clip-path: polygon(50% 0, 100% 0, 100% 100%, 50% 100%);">
                  <template v-for="topping in pizzaConfig.toppings.right" :key="topping">
                    <div v-for="(pos, idx) in getToppingPositions(topping, 'right')" :key="`right-${topping}-${idx}`"
                      class="absolute opacity-90 shadow-md"
                      :style="pos"
                      :class="[getToppingConfig(topping)?.previewClass, getToppingConfig(topping)?.size]">
                    </div>
                  </template>
                </div>

                <!-- Divider Line -->
                <div class="absolute left-1/2 top-0 bottom-0 w-1 bg-yellow-800 opacity-40"></div>
              </div>
            </div>
          </div>

          <!-- Price Summary -->
          <div class="mt-8 p-4 bg-gradient-to-r from-orange-100 to-red-100 rounded-lg">
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span>Alappizza:</span>
                <span class="font-medium">{{ basePrice }} Ft</span>
              </div>
              <div v-if="toppingsPrice > 0" class="flex justify-between">
                <span>Extra feltétek ({{ totalToppingsCount }}):</span>
                <span class="font-medium">{{ toppingsPrice }} Ft</span>
              </div>
              <div class="flex justify-between text-xl font-bold pt-2 border-t-2 border-orange-300">
                <span>Végösszeg:</span>
                <span>{{ totalPrice }} Ft</span>
              </div>
            </div>
          </div>

          <!-- Add to Cart Button -->
          <button
            @click="addToCart"
            :disabled="!isValid"
            class="w-full mt-6 bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg hover:from-orange-600 hover:to-red-600 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all transform hover:scale-105"
          >
            {{ isValid ? 'Kosárba' : 'Válassz minden szükséges opciót' }}
          </button>
        </div>

        <!-- Configuration Options -->
        <div class="space-y-6">
          <!-- Pizza Size -->
            <div class="bg-white rounded-2xl shadow-lg p-6">
            <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
              Méret
            </h3>
            <div class="grid grid-cols-3 gap-3">
              <button
                v-for="size in pizzaSizes"
                :key="size.value"
                @click="pizzaConfig.size = size.value"
                :class="[
                  'p-4 border-2 rounded-lg transition-all',
                  pizzaConfig.size === size.value
                    ? 'border-orange-500 bg-orange-50 shadow-md scale-105'
                    : 'border-gray-300 hover:border-orange-300 hover:bg-orange-50'
                ]"
              >
                <div class="font-medium">{{ size.label }}</div>
                <div class="text-sm text-gray-600">{{ size.price }} Ft</div>
              </button>
            </div>
          </div>

          <!-- Sauce Selection -->
          <div class="bg-white rounded-2xl shadow-lg p-6">
            <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
              Szósz
            </h3>
            <div class="grid grid-cols-2 gap-3">
              <button
                v-for="sauce in sauceOptions"
                :key="sauce.value"
                @click="pizzaConfig.sauce = sauce.value"
                :class="[
                  'p-4 border-2 rounded-lg transition-all',
                  pizzaConfig.sauce === sauce.value
                    ? 'border-orange-500 bg-orange-50 shadow-md'
                    : 'border-gray-300 hover:border-orange-300'
                ]"
              >
                <div class="font-medium">{{ sauce.label }}</div>
              </button>
            </div>
          </div>

          <!-- Cheese Selection -->
          <div class="bg-white rounded-2xl shadow-lg p-6">
            <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
              Sajt
            </h3>
            <div class="grid grid-cols-2 gap-3">
              <button
                v-for="cheese in cheeseOptions"
                :key="cheese.value"
                @click="pizzaConfig.cheese = pizzaConfig.cheese === cheese.value ? '' : cheese.value"
                :class="[
                  'p-4 border-2 rounded-lg transition-all',
                  pizzaConfig.cheese === cheese.value
                    ? 'border-orange-500 bg-orange-50 shadow-md'
                    : 'border-gray-300 hover:border-orange-300'
                ]"
              >
                <div class="font-medium">{{ cheese.label }}</div>
                <div class="text-sm text-gray-600">{{ cheese.price > 0 ? `+${cheese.price} Ft` : 'Alapárban' }}</div>
              </button>
            </div>
          </div>

          <!-- Half and Half Toggle -->
          <div class="bg-white rounded-2xl shadow-lg p-6">
            <label class="flex items-center justify-between cursor-pointer">
              <div>
                <h3 class="text-xl font-bold flex items-center gap-2">
                  Fele-fele pizza
                </h3>
                <p class="text-sm text-gray-600 mt-1">Különböző feltétek a két oldalon</p>
              </div>
              <div class="relative">
                <input
                  type="checkbox"
                  v-model="pizzaConfig.halfAndHalf"
                  class="sr-only"
                />
                <div
                  :class="[
                    'block w-14 h-8 rounded-full transition-colors',
                    pizzaConfig.halfAndHalf ? 'bg-orange-500' : 'bg-gray-300'
                  ]"
                >
                  <div
                    :class="[
                      'absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform',
                      pizzaConfig.halfAndHalf ? 'transform translate-x-6' : ''
                    ]"
                  ></div>
                </div>
              </div>
            </label>
          </div>

          <!-- Toppings Selection -->
            <div class="bg-white rounded-2xl shadow-lg p-6">
            <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
              Feltétek
              <span class="text-sm font-normal text-gray-600">(150 Ft / feltét)</span>
            </h3>

            <!-- Full Pizza Toppings -->
            <div v-if="!pizzaConfig.halfAndHalf" class="space-y-2">
              <p class="text-sm text-gray-600 mb-3">Kattints a feltét hozzáadásához/eltávolításához</p>
              <div class="grid grid-cols-3 gap-2">
                <button
                  v-for="topping in availableToppings"
                  :key="topping.value"
                  @click="toggleTopping('full', topping.value)"
                  :class="[
                    'p-3 border-2 rounded-lg transition-all text-center',
                    pizzaConfig.toppings.full.includes(topping.value)
                      ? 'border-orange-500 bg-orange-50 shadow-md'
                      : 'border-gray-300 hover:border-orange-300'
                  ]"
                >
                  <div class="w-6 h-6 rounded-full mx-auto mb-1" :class="topping.color"></div>
                  <div class="text-xs font-medium">{{ topping.label }}</div>
                </button>
              </div>
            </div>

            <!-- Half and Half Toppings -->
            <div v-else class="space-y-6">
              <!-- Left Half -->
              <div>
                <h4 class="font-medium mb-3 flex items-center gap-2">
                  Bal oldal
                  <span class="text-sm text-gray-600">({{ pizzaConfig.toppings.left.length }} feltét)</span>
                </h4>
                <div class="grid grid-cols-3 gap-2">
                  <button
                    v-for="topping in availableToppings"
                    :key="`left-${topping.value}`"
                    @click="toggleTopping('left', topping.value)"
                    :class="[
                      'p-3 border-2 rounded-lg transition-all text-center',
                      pizzaConfig.toppings.left.includes(topping.value)
                        ? 'border-orange-500 bg-orange-50 shadow-md'
                        : 'border-gray-300 hover:border-orange-300'
                    ]"
                  >
                    <div class="w-6 h-6 rounded-full mx-auto mb-1" :class="topping.color"></div>
                    <div class="text-xs font-medium">{{ topping.label }}</div>
                  </button>
                </div>
              </div>

              <!-- Right Half -->
              <div>
                <h4 class="font-medium mb-3 flex items-center gap-2">
                  Jobb oldal
                  <span class="text-sm text-gray-600">({{ pizzaConfig.toppings.right.length }} feltét)</span>
                </h4>
                <div class="grid grid-cols-3 gap-2">
                  <button
                    v-for="topping in availableToppings"
                    :key="`right-${topping.value}`"
                    @click="toggleTopping('right', topping.value)"
                    :class="[
                      'p-3 border-2 rounded-lg transition-all text-center',
                      pizzaConfig.toppings.right.includes(topping.value)
                        ? 'border-orange-500 bg-orange-50 shadow-md'
                        : 'border-gray-300 hover:border-orange-300'
                    ]"
                  >
                    <div class="w-6 h-6 rounded-full mx-auto mb-1" :class="topping.color"></div>
                    <div class="text-xs font-medium">{{ topping.label }}</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'

const router = useRouter()
const cartStore = useCartStore()

// Pizza configuration
const pizzaConfig = ref({
  size: 'medium' as 'small' | 'medium' | 'large',
  sauce: '' as string,
  cheese: '' as string,
  halfAndHalf: false,
  toppings: {
    full: [] as string[],
    left: [] as string[],
    right: [] as string[]
  }
})

// Pizza size options (magyarul)
const pizzaSizes = [
  { value: 'small' as const, label: 'Kicsi', price: 1500 },
  { value: 'medium' as const, label: 'Közepes', price: 2000 },
  { value: 'large' as const, label: 'Nagy', price: 2500 }
]

// Sauce options (magyarul)
const sauceOptions = [
  { value: 'tomato', label: 'Paradicsom' },
  { value: 'cream', label: 'Tejszínes' },
  { value: 'bbq', label: 'BBQ' },
  { value: 'pesto', label: 'Pesto' }
]

// Cheese options (magyarul)
const cheeseOptions = [
  { value: 'mozzarella', label: 'Mozzarella', price: 0 },
  { value: 'cheddar', label: 'Cheddar', price: 100 },
  { value: 'parmesan', label: 'Parmezán', price: 150 },
  { value: 'mixed', label: 'Vegyes sajt', price: 200 }
]

// Available toppings (magyarul)
const availableToppings = [
  { value: 'pepperoni', label: 'Pepperoni', color: 'bg-red-600', previewClass: 'bg-red-600 rounded-full', size: 'w-9 h-9', count: 8 },
  { value: 'ham', label: 'Sonka', color: 'bg-pink-300', previewClass: 'bg-pink-300 rounded-sm opacity-90', size: 'w-10 h-10', count: 5 },
  { value: 'bacon', label: 'Bacon', color: 'bg-red-800', previewClass: 'bg-red-800 rounded-sm', size: 'w-8 h-4', count: 8 },
  { value: 'chicken', label: 'Csirke', color: 'bg-orange-100', previewClass: 'bg-orange-100 rounded-full', size: 'w-7 h-7', count: 7 },
  { value: 'sausage', label: 'Kolbász', color: 'bg-red-900', previewClass: 'bg-red-900 rounded-full', size: 'w-6 h-6', count: 10 },
  { value: 'mushrooms', label: 'Gomba', color: 'bg-gray-400', previewClass: 'bg-gray-300 rounded-t-xl', size: 'w-7 h-5', count: 8 },
  { value: 'onions', label: 'Hagyma', color: 'bg-purple-200', previewClass: 'border-4 border-purple-300 rounded-full', size: 'w-9 h-9', count: 6 },
  { value: 'peppers', label: 'Paprika', color: 'bg-green-500', previewClass: 'bg-green-500 rounded-md', size: 'w-6 h-6', count: 9 },
  { value: 'olives', label: 'Olívabogyó', color: 'bg-gray-800', previewClass: 'border-4 border-gray-800 rounded-full', size: 'w-5 h-5', count: 12 },
  { value: 'tomatoes', label: 'Paradicsom', color: 'bg-red-500', previewClass: 'bg-red-500 rounded-full', size: 'w-8 h-8', count: 5 },
  { value: 'pineapple', label: 'Ananász', color: 'bg-yellow-400', previewClass: 'bg-yellow-400 rounded-tr-xl rounded-bl-xl', size: 'w-6 h-6', count: 9 },
  { value: 'corn', label: 'Kukorica', color: 'bg-yellow-300', previewClass: 'bg-yellow-300 rounded-full', size: 'w-3 h-3', count: 25 }
]

// Price calculations
const basePrice = computed(() => {
  const size = pizzaSizes.find(s => s.value === pizzaConfig.value.size)
  return size?.price || 2000
})

const cheesePrice = computed(() => {
  const cheese = cheeseOptions.find(c => c.value === pizzaConfig.value.cheese)
  return cheese?.price || 0
})

const totalToppingsCount = computed(() => {
  if (pizzaConfig.value.halfAndHalf) {
    return pizzaConfig.value.toppings.left.length + pizzaConfig.value.toppings.right.length
  }
  return pizzaConfig.value.toppings.full.length
})

const toppingsPrice = computed(() => {
  return totalToppingsCount.value * 150
})

const totalPrice = computed(() => {
  return basePrice.value + cheesePrice.value + toppingsPrice.value
})

const isValid = computed(() => {
  return pizzaConfig.value.sauce && pizzaConfig.value.cheese
})

// Toggle topping
const toggleTopping = (half: 'full' | 'left' | 'right', topping: string) => {
  const toppings = pizzaConfig.value.toppings[half]
  const index = toppings.indexOf(topping)

  if (index > -1) {
    toppings.splice(index, 1)
  } else {
    toppings.push(topping)
  }
}

// Helper to get topping config
const getToppingConfig = (value: string) => availableToppings.find(t => t.value === value)

// Get topping position style
const getToppingPositions = (toppingValue: string, region: 'full' | 'left' | 'right') => {
  const topping = getToppingConfig(toppingValue)
  if (!topping) return []

  const baseCount = topping.count || 8
  const count = region === 'full' ? baseCount : Math.ceil(baseCount * 0.6)

  const positions: any[] = []
  let seed = toppingValue.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)

  const random = () => {
    const x = Math.sin(seed++) * 10000
    return x - Math.floor(x)
  }

  const minDistance = 12 // % minimum distance

  let attempts = 0
  while (positions.length < count && attempts < 100) {
    attempts++

    const maxR = 42
    const r = maxR * Math.sqrt(random())

    let minAngle = 0
    let maxAngle = 360

    if (region === 'left') {
      minAngle = 95
      maxAngle = 265
    } else if (region === 'right') {
      minAngle = -85
      maxAngle = 85
    }

    const angleRange = maxAngle - minAngle
    const theta = (minAngle + random() * angleRange) * (Math.PI / 180)

    const x = 50 + r * Math.cos(theta)
    const y = 50 + r * Math.sin(theta)

    // Collision check
    let collision = false
    for (const pos of positions) {
      const dx = parseFloat(pos.left) - x
      const dy = parseFloat(pos.top) - y
      const dist = Math.sqrt(dx*dx + dy*dy)
      if (dist < minDistance) {
        collision = true
        break
      }
    }

    if (!collision) {
      const rotation = random() * 360
      positions.push({
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`
      })
    }
  }
  return positions
}// Add to cart
const addToCart = () => {
  if (!isValid.value) return

  const size = pizzaSizes.find(s => s.value === pizzaConfig.value.size)
  const sauce = sauceOptions.find(s => s.value === pizzaConfig.value.sauce)
  const cheese = cheeseOptions.find(c => c.value === pizzaConfig.value.cheese)

  let toppingsDescription = ''
  if (pizzaConfig.value.halfAndHalf) {
    const leftToppings = pizzaConfig.value.toppings.left
      .map(t => availableToppings.find(at => at.value === t)?.label)
      .join(', ')
    const rightToppings = pizzaConfig.value.toppings.right
      .map(t => availableToppings.find(at => at.value === t)?.label)
      .join(', ')
    toppingsDescription = `Bal: ${leftToppings || 'Nincs feltét'} | Jobb: ${rightToppings || 'Nincs feltét'}`
  } else {
    toppingsDescription = pizzaConfig.value.toppings.full
      .map(t => availableToppings.find(at => at.value === t)?.label)
      .join(', ') || 'Nincsenek feltétek'
  }

  const pizzaTitle = `Egyedi ${size?.label} pizza`
  const pizzaDescription = `${sauce?.label} szósz, ${cheese?.label}, ${toppingsDescription}`

  // Create a custom food item for the cart
  const customPizza = {
    id: Date.now(), // Temporary ID for custom pizza
    title: pizzaTitle,
    description: pizzaDescription,
    category: 'pizza',
    image: '/static_images/custom-pizza.jpg',
    prices: [{ label: 'Egyedi', price: totalPrice.value }]
  }

  cartStore.addItem(customPizza, { label: 'Egyedi', price: totalPrice.value }, 1)

  // Navigate to cart or menu
  router.push('/menu')
}
</script>

<style scoped>
/* Ensure smooth transitions */
* {
  transition: all 0.2s ease;
}
</style>
