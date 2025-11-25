<!-- src/components/TopPizzaCard.vue -->
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Food, FoodPrice } from '@/stores/foods'
import { useCartStore } from '@/stores/cart'

const props = defineProps<{
  pizza: Food
}>()

const cartStore = useCartStore()

const sortedPrices = computed(() => {
  return [...props.pizza.prices].sort((a, b) => a.price - b.price)
})

const selectedPrice = ref<FoodPrice | null>(null)

watch(() => props.pizza, () => {
  if (sortedPrices.value.length > 0) {
    // Default to middle size if 3, else first
    if (sortedPrices.value.length === 3) {
      selectedPrice.value = sortedPrices.value[1]!
    } else {
      selectedPrice.value = sortedPrices.value[0]!
    }
  }
}, { immediate: true })

const selectPrice = (price: FoodPrice) => {
  selectedPrice.value = price
}

const getSizeLabel = (label: string) => {
  return label.replace(/\s*cm/i, '')
}

const addToCart = () => {
  if (selectedPrice.value) {
    cartStore.addItem(props.pizza, selectedPrice.value)
  }
}

const toggleCart = (event: Event) => {
  event.stopPropagation()
  cartStore.toggleCart()
}
const emit = defineEmits<{
  openExtras: [{ item: Food }]
}>()

function openExtrasModal(item: Food) {
  emit('openExtras', { item })
}
</script>

<template>
  <article
    class="relative min max-w-xs rounded-[32px] bg-gray-50 shadow-[0_20px_40px_rgba(0,0,0,0.16)]"
  >

    <div class="absolute -left-4 top-4 z-20">
      <div class="relative">
        <div class="bg-amber-400 h-[20px] w-[60px]"></div>
        <span
          class="absolute inset-0 flex items-center justify-center
                pacifico-regular text-[32px] text-white leading-none"
        >
          Top
        </span>
      </div>
    </div>

    <div class="bg-[#7A231D] pt-8 flex justify-center relative z-5 rounded-t-xl">
      <div class="w-full h-40 overflow-hidden">
        <img :src="pizza.image || '/static_images/top-view-delicious-pizza.png'"
          class="w-full object-cover object-top" />
    </div>
    </div>

    <div class="pt-10 pb-6 px-6 work-sans-regular z-10 relative bg-gray-50 rounded-b-xl">
      <h3 class="text-xl font-semibold text-slate-900 mb-1">
        {{ pizza.title }}
      </h3>
      <p class="text-sm text-slate-500 leading-snug mb-4">
        {{ pizza.description }}
      </p>

      <div class="flex gap-3 mb-4">
        <button
          v-for="price in sortedPrices"
          :key="price.label"
          type="button"
          @click="selectPrice(price)"
          class="flex-1 rounded-lg border px-3 py-1 text-sm font-medium transition cursor-pointer"
          :class="
            selectedPrice === price
              ? 'border-orange-500 text-orange-600 bg-orange-50'
              : 'border-gray-300 text-gray-600 bg-white hover:border-orange-400 hover:text-orange-500'
          "
        >
          {{ getSizeLabel(price.label) }} cm
        </button>
      </div>

      <div class="flex items-center justify-between">
        <div class="text-lg work-sans-medium text-slate-900">
          {{ selectedPrice?.price }} Ft
        </div>
        <div class="flex gap-2">
          <button
            type="button"
            class="felt-button"
            title="További feltétek hozzáadása"
            @click="openExtrasModal(pizza)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
             Feltétek
          </button>
          <button
            type="button"
            class="cart-button"
            title="Kosárba helyezés"
            @click="addToCart"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
.pacifico-regular {
  font-family: "Pacifico", cursive;
  font-weight: 400;
  font-style: normal;
}

.work-sans-light {
  font-family: "Work Sans", sans-serif;
  font-optical-sizing: auto;
  font-weight: 300;
  font-style: normal;
}
.work-sans-regular {
  font-family: "Work Sans", sans-serif;
  font-optical-sizing: auto;
  font-weight: 400;
  font-style: normal;
}
.work-sans-medium {
  font-family: "Work Sans", sans-serif;
  font-optical-sizing: auto;
  font-weight: 500;
  font-style: normal;
}
.work-sans-semibold {
  font-family: "Work Sans", sans-serif;
  font-optical-sizing: auto;
  font-weight: 600;
  font-style: normal;
}
.work-sans-bold {
  font-family: "Work Sans", sans-serif;
  font-optical-sizing: auto;
  font-weight: 700;
  font-style: normal;
}

.felt-button {
  border: 2px solid #ff6106;
  background: #fff;
  color: #ff6106;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "Work Sans", sans-serif;
  cursor: pointer;
}

.felt-button:hover {
  background: #fff4e6;
}

.felt-button svg {
  width: 18px;
  height: 18px;
  margin-right: 4px;
}

.cart-button {
  background: #ff6106;
  color: #fff;
  border: 2px solid #ff6106;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-family: "Work Sans", sans-serif;
}

.cart-button:hover {
  background: #e55a00;
  border-color: #e55a00;
}

.cart-button svg {
  width: 20px;
  height: 20px;
}
</style>
