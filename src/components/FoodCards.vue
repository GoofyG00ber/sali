<template>
  <div class="cards">
    <div v-for="item in items" :key="item.id" class="card">
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
            {{ p.label }} — {{ formatPrice(p.price) }} Ft
          </button>
        </div>
        <div v-else class="prices-empty">Ár hamarosan</div>

        <div class="actions">
          <button class="add" type="button" :disabled="!(item.prices && item.prices.length)" @click="addToCart(item)">
            kosárba
          </button>
        </div>
      </div>
      <div class="card-right">
        <img :src="item.image" alt="" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { PropType } from 'vue'

type Price = { label: string; price: number }
type Item = { id: number; title: string; description?: string; prices?: Price[]; image?: string }

const props = defineProps({ items: { type: Array as PropType<Item[]>, required: true } })
const emit = defineEmits<{ (e: 'add', payload: { item: Item; price: Price }): void }>()

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

function formatPrice(n:number){ return n.toLocaleString() }

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
.cards{ display:flex; flex-direction:column; gap:18px }
.card{ display:flex; align-items:center; justify-content:space-between; background:#fff; padding:18px; border-radius:12px; box-shadow:0 6px 0 rgba(0,0,0,0.02); }
.card-left{ flex:1; padding-right:12px }
.name{ margin:0 0 6px; font-size:16px }
.desc{ margin:0 0 10px; color:#777 }
.prices{ display:flex; gap:8px; flex-wrap:wrap }
.prices button{ background:#fff; border:1px solid #eee; padding:6px 8px; border-radius:6px; cursor:pointer; color:#666 }
.prices button.selected{ background:#fff4e6; border-color:#f0c09a; color:#c94f3f }
.prices-empty{ color:#aaa; font-size:14px; font-style:italic }
.actions{ margin-top:10px }
.add{ background:#ff8a3d; color:white; border:none; padding:8px 12px; border-radius:6px; cursor:pointer }
.add:disabled{ opacity:0.4; cursor:not-allowed }
.card-right img{ width:120px; height:120px; object-fit:cover; border-radius:12px; background:#f3f3f3 }

@media (max-width:900px){ .card{ flex-direction:column } .card-right img{ width:100%; height:160px } }
</style>
