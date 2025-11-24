<template>
  <div class="cards">
    <div v-for="item in items" :key="item.id" class="card">
      <div class="card-content">
        <div class="card-left">
          <h3 class="name">{{ item.title }}</h3>
          <p class="desc">{{ item.description }}</p>

          <div v-if="item.prices && item.prices.length" class="prices">
            <button
              v-for="p in item.prices"
              :key="p.label"
              type="button"
              :class="{ selected: selectedPrices[item.id]?.label === p.label }"
              @click="selectPrice(item.id, p)"
            >
              {{ p.label }}
            </button>
          </div>
          <div v-else class="prices-empty">Ár hamarosan</div>

          <div class="bottom-row">
            <div class="price-display">
              <span v-if="selectedPrices[item.id]?.price" class="price-amount">
                {{ formatPrice(selectedPrices[item.id]!.price) }},00 Ft
              </span>
              <span v-else class="price-amount">-</span>
            </div>

            <div class="actions">
              <button v-if="item.category_id === 1" class="btn-outline" type="button" title="Add extras" @click="openExtrasModal(item)">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
              <button class="btn-primary" type="button" :disabled="!(item.prices && item.prices.length)" @click="addToCart(item)" title="Add to cart">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="card-right" v-if="item.image">
        <img :src="item.image" alt="" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { PropType } from 'vue'

type Price = { label: string; price: number }
type Item = { id: number; title: string; description?: string; prices?: Price[]; image?: string; category_id?: number }

const props = defineProps({ items: { type: Array as PropType<Item[]>, required: true } })
const emit = defineEmits<{
  (e: 'add', payload: { item: Item; price: Price }): void
  (e: 'openExtras', payload: { item: Item }): void
}>()

const selectedPrices = reactive<Record<number, Price>>({})

function ensureSelections(list: Item[]) {
  const seenIds = new Set<number>()
  list.forEach((item) => {
    seenIds.add(item.id)
    if (Array.isArray(item.prices) && item.prices.length) {
      const current = selectedPrices[item.id]
      const stillValid = current && item.prices.some((p) => p.label === current.label)
      if (!stillValid) {
        selectedPrices[item.id] = item.prices[0]!
      }
    } else if (selectedPrices[item.id]) {
      delete selectedPrices[item.id]
    }
  })

  Object.keys(selectedPrices).forEach((idKey) => {
    const numericId = Number(idKey)
    if (!seenIds.has(numericId)) {
      delete selectedPrices[numericId]
    }
  })
}

function getDefaultPrice(it: Item): Price | undefined {
  return Array.isArray(it.prices) && it.prices.length ? it.prices[0] : undefined
}

function selectPrice(itemId: number, price: Price){ selectedPrices[itemId] = price }

function formatPrice(n:number){ return n.toLocaleString('hu-HU') }

function openExtrasModal(item: Item) {
  emit('openExtras', { item })
}

function addToCart(item: Item){
  const price = selectedPrices[item.id] ?? getDefaultPrice(item)
  if (!price) return
  emit('add', { item, price })
}

ensureSelections(props.items)

watch(
  () => props.items,
  (newItems) => {
    ensureSelections(newItems)
  },
  { deep: true }
)
</script>

<style scoped>
.cards {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.card {
  display: grid;
  grid-template-columns: 1fr 200px;
  gap: 0;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.card-content {
  padding: 24px;
}

.card:has(.card-right) {
  grid-template-columns: 1fr 200px;
}

.card:not(:has(.card-right)) {
  grid-template-columns: 1fr;
}

.card:not(:has(.card-right)) .card-content {
  padding: 24px;
}

.card-left {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 100%;
}

.name {
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
}

.desc {
  margin: 0 0 16px;
  color: #888;
  font-size: 14px;
  line-height: 1.5;
}

.prices {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.prices button {
  background: #fff;
  border: 1px solid #d0d0d0;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  color: #666;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.prices button:hover {
  border-color: #ff6106;
  color: #ff6106;
}

.prices button.selected {
  background: #fff4e6;
  border-color: #ff6106;
  color: #ff6106;
  font-weight: 600;
}

.prices-empty {
  color: #aaa;
  font-size: 13px;
  font-style: italic;
  margin-bottom: 12px;
}

.price-display {
  margin-bottom: 0;
}

.price-amount {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
}

.bottom-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.actions {
  display: flex;
  gap: 8px;
}

.btn-outline {
  width: auto;
  background: #fff;
  border: 2px solid #ff6106;
  color: #ff6106;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-outline:hover {
  background: #fff4e6;
}

.btn-outline svg {
  width: 20px;
  height: 20px;
}

.btn-primary {
  width: auto;
  background: #ff6106;
  color: #fff;
  border: 2px solid #ff6106;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-primary:hover:not(:disabled) {
  background: #e55a00;
  border-color: #e55a00;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary svg {
  width: 20px;
  height: 20px;
}

.card-right {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.card-right img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  margin: 0;
  padding: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .card {
    grid-template-columns: 1fr;
    gap: 0;
    overflow: hidden;
  }

  .card-content {
    padding: 16px;
  }

  .bottom-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .actions {
    width: 100%;
  }

  .btn-outline,
  .btn-primary {
    flex: 1;
    width: 100%;
  }

  .card-right {
    height: 250px;
  }

  .card-right img {
    width: 100%;
    height: 100%;
  }

  .name {
    font-size: 18px;
  }

  .desc {
    font-size: 13px;
  }

  .prices button {
    font-size: 12px;
    padding: 6px 12px;
  }

  .price-amount {
    font-size: 16px;
  }

  .btn-outline,
  .btn-primary {
    font-size: 13px;
    padding: 9px 14px;
  }
}

@media (max-width: 480px) {
  .card {
    padding: 0;
    gap: 0;
  }

  .card-content {
    padding: 12px;
  }

  .card-right {
    height: 180px;
  }

  .name {
    font-size: 16px;
  }

  .desc {
    font-size: 12px;
    margin-bottom: 12px;
  }

  .prices {
    gap: 8px;
    margin-bottom: 10px;
  }

  .prices button {
    font-size: 11px;
    padding: 5px 10px;
  }

  .price-display {
    margin-bottom: 12px;
  }

  .price-amount {
    font-size: 14px;
  }

  .actions {
    gap: 8px;
  }

  .btn-outline,
  .btn-primary {
    font-size: 12px;
    padding: 8px 12px;
  }
}
</style>
