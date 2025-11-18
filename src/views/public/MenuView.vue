<template>
  <div class="menu-page">
    <div class="left">
      <CategoryList :categories="menu.categories" :selectedId="selectedCategoryId" @select="selectCategory" />
    </div>

    <main class="center">
      <h2 class="heading">{{ currentCategory?.title || 'Menü' }}</h2>

      <!-- Pizza Builder Card (shown only in pizza category) -->
      <div v-if="isPizzaCategory" class="pizza-builder-card" @click="goToPizzaBuilder">
        <div class="builder-icon">🍕</div>
        <div class="builder-content">
          <h3 class="builder-title">Készítsd el saját pizzádat!</h3>
          <p class="builder-description">Válassz alapot, szószt, feltéteket és készítsd el a tökéletes pizzát.</p>
          <button class="builder-button">Induljon a varázs! ✨</button>
        </div>
      </div>

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
import { useRouter } from 'vue-router'
import CategoryList from '@/components/CategoryList.vue'
import FoodCards from '@/components/FoodCards.vue'
import KosarWidget from '@/components/KosarWidget.vue'
import { useCartStore } from '@/stores/cart'
import type { Food } from '@/stores/foods'

const router = useRouter()

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

// Normalize string (remove diacritics) and check common pizza name variants
function normalizeStr(s: string) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

const isPizzaCategory = computed(() => {
  const rawTitle = currentCategory.value?.title || ''
  const title = normalizeStr(rawTitle)
  // match 'pizza' and small variants like 'pizzak' (covers 'pizzák' when diacritics removed)
  return title.includes('pizza') || title.includes('pizzak')
})

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

function goToPizzaBuilder() {
  router.push('/pizza-builder')
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

/* Pizza Builder Card */
.pizza-builder-card {
  background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 8px 24px rgba(255, 107, 53, 0.3);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.pizza-builder-card::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  0%, 100% { transform: translate(-50%, -50%) rotate(0deg); }
  50% { transform: translate(-30%, -30%) rotate(180deg); }
}

.pizza-builder-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(255, 107, 53, 0.4);
}

.builder-icon {
  font-size: 80px;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.builder-content {
  flex: 1;
  color: white;
}

.builder-title {
  font-size: 28px;
  font-weight: bold;
  margin: 0 0 8px 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.builder-description {
  font-size: 16px;
  margin: 0 0 16px 0;
  opacity: 0.95;
}

.builder-button {
  background: white;
  color: #ff6b35;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.builder-button:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

@media (max-width:1000px){
  .menu-page{ grid-template-columns:1fr; }
  .right{ order:3 }

  .pizza-builder-card {
    flex-direction: column;
    text-align: center;
  }

  .builder-icon {
    font-size: 60px;
  }
}
</style>
