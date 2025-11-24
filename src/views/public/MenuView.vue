<template>
  <div class="menu-page">
    <div class="left">
      <CategoryList :categories="menu.categories" :selectedId="selectedCategoryId" @select="selectCategory" />
    </div>

    <main class="center">
      <!-- Pizza Builder Card (shown only in pizza category) -->
      <div v-if="isPizzaCategory" class="pizza-builder-card" @click="goToPizzaBuilder">
        <div class="builder-icon">🍕</div>
        <div class="builder-content">
          <h3 class="builder-title">Készítsd el saját pizzádat!</h3>
          <p class="builder-description">Válassz alapot, szószt, feltéteket és készítsd el a tökéletes pizzát.</p>
          <button class="builder-button">Induljon a varázs! ✨</button>
        </div>
      </div>

      <FoodCards :items="currentPageItems" @add="handleAddToCart" @openExtras="handleOpenExtras" />

      <div v-if="totalPages > 1" class="pagination mt-4">
        <button
          v-if="page > 1"
          class="pagination-nav"
          @click="page = Math.max(1, page - 1)"
          title="Previous page"
        >
          ‹
        </button>
        <button
          v-for="pageNum in totalPages"
          :key="pageNum"
          :class="{ active: page === pageNum }"
          @click="page = pageNum"
        >
          {{ pageNum }}
        </button>
        <button
          v-if="page < totalPages"
          class="pagination-nav"
          @click="page = Math.min(totalPages, page + 1)"
          title="Next page"
        >
          ›
        </button>
      </div>
    </main>

    <div class="right" ref="rightContainer">
      <KosarWidget />
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

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import CategoryList from '@/components/CategoryList.vue'
import FoodCards from '@/components/FoodCards.vue'
import KosarWidget from '@/components/KosarWidget.vue'
import PizzaExtrasModal from '@/components/PizzaExtrasModal.vue'
import { useCartStore } from '@/stores/cart'
import type { Food } from '@/stores/foods'

const router = useRouter()

type Price = { label: string; price: number }
type Item = { id:number; title:string; description?:string; prices?: Price[]; image?:string; category_id?: number }
type Category = { id:number; title:string; items: Item[] }
type UnknownRecord = Record<string, unknown>
type MaybePriceEntry = { label?: unknown; Label?: unknown; price?: unknown; Price?: unknown }

const menu = ref<{ categories: Category[] }>({ categories: [] })
const selectedCategoryId = ref<number | undefined>(undefined)
const page = ref(1)
const pageSize = ref(8)
const cartStore = useCartStore()
const rightContainer = ref<HTMLElement | null>(null)
const isExtrasModalOpen = ref(false)
const selectedItemForExtras = ref<Item | null>(null)
type Extra = { id: number; title: string; description?: string; prices?: Price[] }
const feltekExtras = ref<Extra[]>([])
const feltekCategoryId = ref<number | null>(null)

function handleScroll() {
  if (!rightContainer.value || window.innerWidth < 1000) return

  const centerContent = document.querySelector('.center')
  if (!centerContent) return

  const containerHeight = rightContainer.value.offsetHeight
  const gap = 20

  // Get the bottom of the center content (where menu items end) in viewport coordinates
  const centerRect = centerContent.getBoundingClientRect()
  const centerBottomAbsolute = centerRect.bottom + window.scrollY

  // Calculate the point where we should stop scrolling the Kosár
  // This is: center bottom - container height - gap
  const stopScrollAt = centerBottomAbsolute - containerHeight - gap

  // Current scroll position
  const scrollPosition = window.scrollY

  // If we've scrolled past the stop point, switch to absolute positioning
  if (scrollPosition + 120 > stopScrollAt) {
    rightContainer.value.style.position = 'absolute'
    rightContainer.value.style.top = (stopScrollAt - 120) + 'px'
  } else {
    // Otherwise keep it fixed at the normal position
    rightContainer.value.style.position = 'fixed'
    rightContainer.value.style.top = '120px'
  }
}

function handleResize() {
  handleScroll()

  // Reset inline styles on mobile so CSS media queries take over
  if (window.innerWidth < 1000 && rightContainer.value) {
    rightContainer.value.style.position = ''
    rightContainer.value.style.top = ''
  }
}

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
  // If prices is already an array of correct format, return it directly
  if (Array.isArray(food?.prices)) {
    const items = food.prices as unknown[]
    const priceArray = items
      .map((p: unknown) => {
        const entry = p as { label?: unknown; price?: unknown }
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
    // Filter out 'Feltétek' category
    const normalizedStr = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

    // Find and store the Feltétek category ID
    const feltekCat = cats.find((c) => normalizedStr(c.title).includes('feltet'))
    if (feltekCat) {
      feltekCategoryId.value = feltekCat.id
    }

    const filteredCats = cats.filter((c) => {
      const title = normalizedStr(c.title)
      return !title.includes('feltet')
    })
    const categories: Category[] = filteredCats.map((c: { id:number; title:string }) => ({ id: c.id, title: c.title, items: [] }))
    for (const raw of foods) {
      const f = raw as UnknownRecord & { id: number; title: string; description?: string; category_id?: number; image?: string; active?: number }

      // Filter out inactive items (0 or 2 are inactive)
      if (f.active === 0 || f.active === 2) continue

      const cat = categories.find((c) => c.id === f.category_id)
      const priceOptions = derivePrices(f)
      const item: Item = {
        id: f.id,
        title: f.title,
        description: f.description,
        prices: priceOptions,
        image: f.image || '/placeholder.png',
        category_id: f.category_id
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
    badges: [],
    categoryId: item.category_id
  }
  cartStore.addItem(food, price, 1)
}

async function handleOpenExtras(payload: { item: Item }) {
  const { item } = payload
  selectedItemForExtras.value = item

  // Load extras from feltétek category if not already loaded
  if (feltekExtras.value.length === 0 && feltekCategoryId.value !== null) {
    try {
      const response = await fetch('/api/foods')
      const foods: UnknownRecord[] = await response.json()
      const filteredFoods = foods.filter((f: UnknownRecord) => {
        const food = f as UnknownRecord & { active?: number }
        // Filter out inactive items (0 or 2 are inactive)
        if (food.active === 0 || food.active === 2) return false
        return f.category_id === feltekCategoryId.value
      })
      feltekExtras.value = filteredFoods.map((f: UnknownRecord) => ({
        id: f.id,
        title: f.title,
        description: f.description,
        prices: derivePrices(f)
      })) as Extra[]
      console.log('Loaded extras:', feltekExtras.value)
    } catch (e) {
      console.error('Failed to load extras:', e)
    }
  }

  isExtrasModalOpen.value = true
}

function handleAddWithExtras(data: { item: Item; selectedSize: Price; selectedExtras: Record<number, number> }) {
  const { item, selectedSize, selectedExtras } = data

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

  // Convert the item to Food type for cart store
  const food: Food = {
    id: item.id,
    title: item.title,
    description: item.description || '',
    prices: item.prices || [],
    image: item.image || '/placeholder.png',
    badges: [],
    categoryId: item.category_id
  }

  cartStore.addItem(food, selectedSize, 1, extras.length > 0 ? extras : [])
}

function goToPizzaBuilder() {
  router.push('/pizza-builder')
}

onMounted(()=> {
  loadMenu()
  window.addEventListener('scroll', handleScroll)
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.menu-page {
  display: grid;
  grid-template-columns: 220px 1fr 320px;
  gap: 20px;
  padding: 20px;
  margin-top: 40px;
  background: #f5f5f5;
  position: relative;
  min-height: calc(100vh - 80px);
}

.heading { margin: 0 0 12px; }
.left { padding-right: 8px; position: static; width: auto; z-index: 2; }
.center { padding-bottom: 16px; margin-top: 12px; z-index: 2; }
.right { padding-left: 8px; position: fixed; right: 20px; top: 120px; width: 320px; max-height: calc(100vh - 140px); overflow-y: auto; z-index: 10; }

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
  /* Two-column layout: categories + menu items; cart centered below them */
  .menu-page {
    grid-template-columns: 220px 1fr;
    gap: 20px;
    padding: 12px;
  }

  /* Left (categories) stays as a left column */
  .left {
    grid-column: 1;
    grid-row: 1;
    position: static;
    width: auto;
    background: transparent;
    border-bottom: none;
    z-index: 2;
    padding: 0 8px 0 0;
    margin: 0;
  }

  /* Center (menu items) takes the right column */
  .center {
    grid-column: 2;
    grid-row: 1;
    margin-top: 0;
    padding: 0 12px;
  }

  /* Right (cart) spans both columns and is centered below */
  .right {
    display: none !important; /* hide cart in this breakpoint, show in navbar dropdown instead */
  }

  .pizza-builder-card {
    flex-direction: column;
    text-align: center;
  }

  .builder-icon {
    font-size: 60px;
  }
}

/* Mobile layout: single column, left becomes fixed top bar, center content scrolls below, cart hidden */
@media (max-width:768px) {
  /* Ensure a true single-column mobile layout and override any earlier two-column rules */
  .menu-page {
    grid-template-columns: 1fr !important;
    gap: 0 !important;
    padding: 0 !important;
  }

  .left {
    order: 1;
    position: fixed !important;
    top: 0;
    left: 0;
    right: 0;
    width: 100% !important;
    background: white; /* mobile: fixed top bar should have white background */
    border-bottom: 1px solid #eee;
    z-index: 60;
    padding: 10px 12px;
    margin: 0;
  }

  .center {
    order: 2;
    /* Ensure content sits below the fixed top bar regardless of earlier rules */
    margin-top: 68px !important; /* adjust if top bar height changes */
    padding: 12px !important;
    grid-column: 1 / -1 !important;
  }

  .right {
    order: 3;
    display: none !important; /* hide cart on mobile */
  }
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 12px 0;
}

.pagination button {
  background: #fff;
  border: 1px solid #ddd;
  color: #666;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  min-width: 40px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.pagination button:hover:not(.active) {
  border-color: #ff6106;
  color: #ff6106;
}

.pagination button.active {
  background: #fff4e6;
  border-color: #ff6106;
  color: #ff6106;
}

.pagination-nav {
  font-size: 18px;
  padding: 6px 10px !important;
  min-width: 38px !important;
}

@media (max-width: 768px) {
  .pagination {
    gap: 6px;
  }

  .pagination button {
    padding: 6px 10px;
    font-size: 13px;
    min-width: 36px;
  }

  .pagination-nav {
    font-size: 16px;
    padding: 5px 8px !important;
    min-width: 34px !important;
  }
}
</style>
