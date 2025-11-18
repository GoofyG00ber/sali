<template>
  <div class="pizza-builder min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-8">
    <div class="container mx-auto px-4 max-w-6xl">
      <!-- Header -->
      <div class="text-center mb-8">
  <h1 class="text-5xl font-bold text-gray-800 mb-2">🍕 Egyedi pizza készítő</h1>
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
                <div v-for="(topping, idx) in pizzaConfig.toppings.full" :key="`full-${topping}-${idx}`"
                  class="absolute w-12 h-12 rounded-full opacity-90 shadow-md"
                  :style="getToppingStyle(idx, pizzaConfig.toppings.full.length)"
                  :class="getToppingClass(topping)">
                  <span class="text-2xl">{{ getToppingEmoji(topping) }}</span>
                </div>
              </div>

              <!-- Half and Half Toppings -->
              <div v-else class="w-full h-full relative">
                <!-- Left Half -->
                <div class="absolute inset-0 overflow-hidden" style="clip-path: polygon(0 0, 50% 0, 50% 100%, 0 100%);">
                  <div v-for="(topping, idx) in pizzaConfig.toppings.left" :key="`left-${topping}-${idx}`"
                    class="absolute w-12 h-12 rounded-full opacity-90 shadow-md"
                    :style="getToppingStyle(idx, pizzaConfig.toppings.left.length, 'left')"
                    :class="getToppingClass(topping)">
                    <span class="text-2xl">{{ getToppingEmoji(topping) }}</span>
                  </div>
                </div>
                
                <!-- Right Half -->
                <div class="absolute inset-0 overflow-hidden" style="clip-path: polygon(50% 0, 100% 0, 100% 100%, 50% 100%);">
                  <div v-for="(topping, idx) in pizzaConfig.toppings.right" :key="`right-${topping}-${idx}`"
                    class="absolute w-12 h-12 rounded-full opacity-90 shadow-md"
                    :style="getToppingStyle(idx, pizzaConfig.toppings.right.length, 'right')"
                    :class="getToppingClass(topping)">
                    <span class="text-2xl">{{ getToppingEmoji(topping) }}</span>
                  </div>
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
            {{ isValid ? '🛒 Kosárba' : 'Válassz minden szükséges opciót' }}
          </button>
        </div>

        <!-- Configuration Options -->
        <div class="space-y-6">
          <!-- Pizza Size -->
            <div class="bg-white rounded-2xl shadow-lg p-6">
            <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
              📏 Méret
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
                <div class="text-2xl mb-1">{{ size.icon }}</div>
                <div class="font-medium">{{ size.label }}</div>
                <div class="text-sm text-gray-600">{{ size.price }} Ft</div>
              </button>
            </div>
          </div>

          <!-- Sauce Selection -->
          <div class="bg-white rounded-2xl shadow-lg p-6">
            <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
              🥫 Szósz
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
                <div class="text-3xl mb-1">{{ sauce.icon }}</div>
                <div class="font-medium">{{ sauce.label }}</div>
              </button>
            </div>
          </div>

          <!-- Cheese Selection -->
          <div class="bg-white rounded-2xl shadow-lg p-6">
            <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
              🧀 Sajt
            </h3>
            <div class="grid grid-cols-2 gap-3">
              <button
                v-for="cheese in cheeseOptions"
                :key="cheese.value"
                @click="pizzaConfig.cheese = cheese.value"
                :class="[
                  'p-4 border-2 rounded-lg transition-all',
                  pizzaConfig.cheese === cheese.value
                    ? 'border-orange-500 bg-orange-50 shadow-md'
                    : 'border-gray-300 hover:border-orange-300'
                ]"
              >
                <div class="text-3xl mb-1">{{ cheese.icon }}</div>
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
                  ➗ Fele-fele pizza
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
              🍄 Feltétek
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
                  <div class="text-2xl mb-1">{{ topping.icon }}</div>
                  <div class="text-xs font-medium">{{ topping.label }}</div>
                </button>
              </div>
            </div>

            <!-- Half and Half Toppings -->
            <div v-else class="space-y-6">
              <!-- Left Half -->
              <div>
                <h4 class="font-medium mb-3 flex items-center gap-2">
                  ⬅️ Bal oldal
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
                    <div class="text-2xl mb-1">{{ topping.icon }}</div>
                    <div class="text-xs font-medium">{{ topping.label }}</div>
                  </button>
                </div>
              </div>

              <!-- Right Half -->
              <div>
                <h4 class="font-medium mb-3 flex items-center gap-2">
                  ➡️ Jobb oldal
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
                    <div class="text-2xl mb-1">{{ topping.icon }}</div>
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
  { value: 'small' as const, label: 'Kicsi', icon: '🍕', price: 1500 },
  { value: 'medium' as const, label: 'Közepes', icon: '🍕', price: 2000 },
  { value: 'large' as const, label: 'Nagy', icon: '🍕', price: 2500 }
]

// Sauce options (magyarul)
const sauceOptions = [
  { value: 'tomato', label: 'Paradicsom', icon: '🍅' },
  { value: 'cream', label: 'Tejszínes', icon: '🥛' },
  { value: 'bbq', label: 'BBQ', icon: '🍖' },
  { value: 'pesto', label: 'Pesto', icon: '🌿' }
]

// Cheese options (magyarul)
const cheeseOptions = [
  { value: 'mozzarella', label: 'Mozzarella', icon: '🧀', price: 0 },
  { value: 'cheddar', label: 'Cheddar', icon: '🧀', price: 100 },
  { value: 'parmesan', label: 'Parmezán', icon: '🧀', price: 150 },
  { value: 'mixed', label: 'Vegyes sajt', icon: '🧀', price: 200 }
]

// Available toppings (magyarul)
const availableToppings = [
  { value: 'pepperoni', label: 'Pepperoni', icon: '🍕' },
  { value: 'ham', label: 'Sonka', icon: '🍖' },
  { value: 'bacon', label: 'Bacon', icon: '🥓' },
  { value: 'chicken', label: 'Csirke', icon: '🍗' },
  { value: 'sausage', label: 'Kolbász', icon: '🌭' },
  { value: 'mushrooms', label: 'Gomba', icon: '🍄' },
  { value: 'onions', label: 'Hagyma', icon: '🧅' },
  { value: 'peppers', label: 'Paprika', icon: '🌶️' },
  { value: 'olives', label: 'Olívabogyó', icon: '🫒' },
  { value: 'tomatoes', label: 'Paradicsom', icon: '🍅' },
  { value: 'pineapple', label: 'Ananász', icon: '🍍' },
  { value: 'corn', label: 'Kukorica', icon: '🌽' }
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

// Get topping emoji
const getToppingEmoji = (topping: string): string => {
  const t = availableToppings.find(t => t.value === topping)
  return t?.icon || '🍕'
}

// Get topping class for styling
const getToppingClass = (_topping: string): string => {
  return 'flex items-center justify-center'
}

// Get topping position style
const getToppingStyle = (index: number, total: number, half?: 'left' | 'right'): Record<string, string> => {
  const angle = (360 / Math.max(total, 1)) * index
  const radius = 80
  
  let centerX = 50
  const centerY = 50
  
  if (half === 'left') {
    centerX = 35
  } else if (half === 'right') {
    centerX = 65
  }
  
  const x = centerX + radius * Math.cos((angle * Math.PI) / 180) / 100 * 100
  const y = centerY + radius * Math.sin((angle * Math.PI) / 180) / 100 * 100
  
  return {
    left: `${x}%`,
    top: `${y}%`,
    transform: 'translate(-50%, -50%)'
  }
}

// Add to cart
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
