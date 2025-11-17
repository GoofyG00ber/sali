<template>
  <div class="menu-page">
    <div class="left">
      <CategoryList :categories="menu.categories" :selectedId="selectedCategoryId" @select="selectCategory" />
    </div>

    <main class="center">
      <h2 class="heading">{{ currentCategory?.title || 'Menü' }}</h2>
      <FoodCards :items="currentPageItems" @add="handleAddToCart" />

      <div class="pagination mt-4">
        <button :disabled="page<=1" @click="page = Math.max(1, page-1)">← Előző</button>
        <span class="mx-2">Oldal {{ page }} / {{ totalPages }}</span>
        <button :disabled="page>=totalPages" @click="page = Math.min(totalPages, page+1)">Következő →</button>
      </div>
    </main>

    <div class="right">
      <KosarWidget />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import CategoryList from '@/components/CategoryList.vue'
import FoodCards from '@/components/FoodCards.vue'
import KosarWidget from '@/components/KosarWidget.vue'
import { useCartStore } from '@/stores/cart'
import type { Food } from '@/stores/foods'

type Price = { label: string; price: number }
type Item = { id:number; title:string; description?:string; prices?: Price[]; image?:string }
type Category = { id:number; title:string; items: Item[] }
type UnknownRecord = Record<string, unknown>
type MaybePriceEntry = { label?: unknown; Label?: unknown; price?: unknown; Price?: unknown }

const menu = ref<{ categories: Category[] }>({ categories: [] })
const selectedCategoryId = ref<number | undefined>(undefined)
const page = ref(1)
const pageSize = ref(8)
const cartStore = useCartStore()

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

function derivePrices(food: UnknownRecord): Price[] {
  const fields = ['prices', 'prices_json', 'price_options', 'priceOptions']
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

function selectCategory(id:number){
  if (selectedCategoryId.value === id) return
  selectedCategoryId.value = id
  page.value = 1
}

const currentCategory = computed(() => menu.value.categories.find((c) => c.id === selectedCategoryId.value))

const totalPages = computed(() => {
  const items = currentCategory.value?.items || []
  return Math.max(1, Math.ceil(items.length / pageSize.value))
})

const currentPageItems = computed(() => {
  const items = currentCategory.value?.items || []
  const start = (page.value - 1) * pageSize.value
  return items.slice(start, start + pageSize.value)
})

async function loadMenu(){
  try{
    // Fetch categories and foods from backend API
    const [catsRes, foodsRes] = await Promise.all([
      fetch('/api/categories'),
      fetch('/api/foods')
    ])
    const cats: Array<{ id:number; title:string }> = await catsRes.json()
    const foods: UnknownRecord[] = await foodsRes.json()

    // foods from API include category_id; group them by category
    const categories: Category[] = cats.map((c: { id:number; title:string }) => ({ id: c.id, title: c.title, items: [] }))
    for (const raw of foods) {
      const f = raw as UnknownRecord & { id: number; title: string; description?: string; category_id?: number; image?: string }
      const cat = categories.find((c) => c.id === f.category_id)
      const priceOptions = derivePrices(f)
      const item: Item = {
        id: f.id,
        title: f.title,
        description: f.description,
        prices: priceOptions,
        image: f.image || '/placeholder.png'
      }
      if (cat) cat.items.push(item)
    }

    menu.value.categories = categories
    if(menu.value.categories && menu.value.categories.length>0){
      selectedCategoryId.value = menu.value.categories[0]?.id
      page.value = 1
    }
  }catch(e){ console.error('failed to load menu', e) }
}

function handleAddToCart(payload: { item: Item; price: Price }){
  const { item, price } = payload
  // Convert the item to Food type for cart store
  const food: Food = {
    id: item.id,
    title: item.title,
    description: item.description || '',
    prices: item.prices || [],
    image: item.image || '/placeholder.png',
    badges: []
  }
  cartStore.addItem(food, price, 1)
}

onMounted(()=> loadMenu())
</script>

<style scoped>
body{ background:#cccccc;}

.menu-page{ display:grid; grid-template-columns:240px 1fr 320px; gap:20px; padding:20px }
.heading{ margin:0 0 12px }
.left{ padding-right:8px }
.center{ padding-bottom:16px }
.right{ padding-left:8px }

@media (max-width:1000px){ .menu-page{ grid-template-columns:1fr; } .right{ order:3 } }
</style>
