<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useFoodsStore } from '@/stores/foods'
import { useCartStore } from '@/stores/cart'
import TopPizzaCard from './TopPizzaCard.vue'
import PizzaExtrasModal from './PizzaExtrasModal.vue'
import type { Food } from '@/stores/foods'

const foodsStore = useFoodsStore()
const cartStore = useCartStore()
const { topPizzas } = storeToRefs(foodsStore)

type Extra = { id: number; title: string; description?: string; prices?: { label: string; price: number }[] }
type Price = { label: string; price: number }
type UnknownRecord = Record<string, unknown>
type Item = {
  id: number
  title: string
  description?: string
  prices?: Price[]
  image?: string
}

const isExtrasModalOpen = ref(false)
const selectedItemForExtras = ref<Food | null>(null)
const feltekExtras = ref<Extra[]>([])
const feltekCategoryId = ref<number | null>(null)

onMounted(async () => {
  foodsStore.fetchTopPizzas()

  // Load feltétek category ID
  try {
    const response = await fetch('/api/categories')
    const categories: UnknownRecord[] = await response.json()
    const normalizedStr = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

    const feltekCat = categories.find((c) => normalizedStr(c.title as string).includes('feltet'))
    if (feltekCat) {
      feltekCategoryId.value = feltekCat.id as number
    }
  } catch (e) {
    console.error('Failed to load categories:', e)
  }
})

const handleOpenExtras = async (payload: { item: Food }) => {
  selectedItemForExtras.value = payload.item

  // Load extras if not already loaded
  if (feltekExtras.value.length === 0 && feltekCategoryId.value !== null) {
    try {
      const response = await fetch('/api/foods')
      const foods: UnknownRecord[] = await response.json()
      const filteredFoods = foods.filter((f: UnknownRecord) => {
        const food = f as UnknownRecord & { active?: number }
        if (food.active === 0 || food.active === 2) return false
        return f.category_id === feltekCategoryId.value
      })

      feltekExtras.value = filteredFoods.map((f: UnknownRecord) => ({
        id: f.id as number,
        title: f.title as string,
        description: f.description as string,
        prices: derivePrices(f)
      })) as Extra[]
    } catch (e) {
      console.error('Failed to load extras:', e)
    }
  }

  isExtrasModalOpen.value = true
}

function handleAddWithExtras(data: { item: Item | null; selectedSize: Price; selectedExtras: Record<number, number> }) {
  const { item, selectedSize, selectedExtras } = data

  if (!item) return

  // Convert extras data to store format
  const extras: Array<{ id: number; title?: string; quantity: number; price: number }> = []
  Object.entries(selectedExtras).forEach(([extraId, qty]) => {
    if (qty > 0) {
      const extra = feltekExtras.value.find((e) => e.id === Number(extraId))
      if (extra && extra.prices) {
        // Extract size number from selected size label
        const selectedSizeMatch = selectedSize.label.match(/(\d+)/)
        const selectedSizeNum = selectedSizeMatch ? selectedSizeMatch[1] : null

        // Try exact match first
        let price = extra.prices.find((p: Price) => p.label === selectedSize.label)?.price

        // If no exact match and we have a size number, try to find a price that contains that size
        if (!price && selectedSizeNum) {
          price = extra.prices.find((p: Price) => p.label.includes(selectedSizeNum))?.price
        }

        // Fallback to first price if available
        if (!price && extra.prices.length > 0) {
          const firstPrice = extra.prices[0]
          if (firstPrice) {
            price = firstPrice.price
          }
        }

        extras.push({
          id: Number(extraId),
          title: extra.title,
          quantity: qty,
          price: price || 0
        })
      }
    }
  })

  // Add item to cart - convert Item to Food format
  const foodItem: Food = {
    id: item.id,
    title: item.title,
    description: item.description || '',
    prices: item.prices || [],
    image: item.image || '/placeholder.png',
    badges: [],
    categoryId: 1 // Default category for top pizzas
  }

  cartStore.addItem(foodItem, selectedSize, 1, extras.length > 0 ? extras : [])

  // Close modal
  isExtrasModalOpen.value = false
}


function derivePrices(food: UnknownRecord): { label: string; price: number }[] {
  type Price = { label: string; price: number }
  type MaybePriceEntry = { label?: unknown; Label?: unknown; price?: unknown; Price?: unknown }

  function normalizePrices(raw: unknown): Price[] {
    if (!raw) return []
    if (Array.isArray(raw)) {
      return raw
        .map((entry) => {
          const entryObj = entry as MaybePriceEntry
          const primaryLabel = typeof entryObj.label === 'string' ? entryObj.label.trim() : ''
          const fallbackLabel = typeof entryObj.Label === 'string' ? entryObj.Label.trim() : ''
          const label = primaryLabel || fallbackLabel
          const num = Number(entryObj.price ?? entryObj.Price)
          if (!label || !Number.isFinite(num)) return null
          return { label, price: num }
        })
        .filter((entry): entry is Price => Boolean(entry))
    }
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw)
        return normalizePrices(parsed)
      } catch {
        return []
      }
    }
    if (typeof raw === 'object') {
      const objectEntries = raw as UnknownRecord
      return Object.entries(objectEntries)
        .map(([labelKey, priceValue]) => {
          const cleaned = labelKey.replace(/[_]/g, ' ').trim()
          const num = Number(priceValue)
          if (!cleaned || !Number.isFinite(num)) return null
          return { label: cleaned, price: num }
        })
        .filter((entry): entry is Price => Boolean(entry))
    }
    return []
  }

  // If prices is already an array of correct format, return it directly
  if (Array.isArray(food?.prices)) {
    const items = food.prices as unknown[]
    const priceArray = items
      .map((p: unknown) => {
        const entry = p as MaybePriceEntry
        if (typeof entry.label === 'string' && typeof entry.price === 'number') {
          return { label: entry.label.trim(), price: entry.price }
        }
        return null
      })
      .filter((p): p is Price => p !== null)
    if (priceArray.length > 0) {
      return priceArray
    }
  }

  const fields = ['prices_json', 'price_options', 'priceOptions']
  for (const field of fields) {
    const normalized = normalizePrices(food?.[field])
    if (normalized.length) {
      return normalized
    }
  }

  const fallbackKeys = ['price', 'base_price', 'default_price']
  for (const key of fallbackKeys) {
    const val = food?.[key]
    if (val !== undefined && val !== null) {
      const num = Number(val)
      if (Number.isFinite(num)) {
        return [{ label: 'Alap', price: num }]
      }
    }
  }

  return []
}
</script>

<template>
  <div class="toppizzak py-10 relative">
    <h1 class="pacifico-regular md:pl-10 text-center md:text-left mb-10 text-gray-50 text-4xl md:text-5xl">Legnépszerűbb pizzáink</h1>

    <div class="flex justify-center px-4 sm:px-6 lg:px-10">
      <div
        class="grid grid-cols-1 md:grid-cols-3
               gap-y-[30px] md:gap-y-[30px]
               md:gap-x-[60px]"
      >
        <TopPizzaCard
          v-for="pizza in topPizzas"
          :key="pizza.id"
          :pizza="pizza"
          class="mx-auto"
          @openExtras="handleOpenExtras"
        />
      </div>
    </div>
    <img src="/static_images/toppizzak_dots.svg?url" class="absolute top-3/5 right-0 z-2 rotate-90 " />
    <div class="w-full text-center mt-10">
      <router-link
        to="/menu"
        class="text-amber-300 text-xl work-sans-semibold hover:underline"
      >
        Tovább az étlapra >
      </router-link>
    </div>

    <PizzaExtrasModal
      :isOpen="isExtrasModalOpen"
      :item="selectedItemForExtras"
      :extras="feltekExtras"
      @close="isExtrasModalOpen = false"
      @addToCart="handleAddWithExtras"
    />
  </div>
</template>

<style scoped>
.toppizzak {
  width: 100%;
  min-height: 180px;
  background-color: #ff0000b7;
}

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
</style>

