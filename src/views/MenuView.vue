<template>
  <div class="menu-page">
    <div class="left">
      <CategoryList :categories="menu.categories" :selectedId="selectedCategoryId" @select="selectCategory" />
    </div>

    <main class="center">
      <h2 class="heading">{{ currentCategory?.title || 'Menü' }}</h2>
      <FoodCards :items="currentCategory?.items || []" @add="handleAddToCart" />
    </main>

    <div class="right">
      <KosarWidget :cart="cart" @increment="incQty" @decrement="decQty" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import CategoryList from '../components/CategoryList.vue'
import FoodCards from '../components/FoodCards.vue'
import KosarWidget from '../components/KosarWidget.vue'

type Price = { label: string; price: number }
type Item = { id:number; title:string; description?:string; prices: Price[]; image?:string }
type Category = { id:number; title:string; items: Item[] }

const menu = ref<{ categories: Category[] }>({ categories: [] })
const selectedCategoryId = ref<number | undefined>(undefined)
const cart = ref<Array<{ item: Item; price: Price; qty:number }>>([])

function selectCategory(id:number){ selectedCategoryId.value = id }

const currentCategory = computed(() => menu.value.categories.find((c) => c.id === selectedCategoryId.value))

async function loadMenu(){
  try{
    const res = await fetch('/routes/menu.json')
    menu.value = await res.json()
    if(menu.value.categories && menu.value.categories.length>0){
      selectedCategoryId.value = menu.value.categories[0]?.id
    }
  }catch(e){ console.error('failed to load menu', e) }
}

function handleAddToCart(payload: { item: Item; price: Price }){
  const { item, price } = payload
  const idx = cart.value.findIndex((c) => c.item.id===item.id && c.price.label===price.label)
  if(idx>=0){ cart.value[idx].qty = (cart.value[idx].qty ?? 0) + 1 }
  else { cart.value.push({ item, price, qty: 1 }) }
}

function incQty(idx:number){ if(cart.value[idx]) cart.value[idx]!.qty = (cart.value[idx]!.qty ?? 0) + 1 }
function decQty(idx:number){ if(cart.value[idx]){ if(cart.value[idx]!.qty>1) cart.value[idx]!.qty--; else cart.value.splice(idx,1) } }

onMounted(()=> loadMenu())
</script>

<style scoped>
body{ background:#cccccc;}

.menu-page{ display:grid; grid-template-columns:240px 1fr 320px; gap:20px; padding:20px }
.heading{ margin:0 0 12px }
.left{ }
.center{ }
.right{ }

@media (max-width:1000px){ .menu-page{ grid-template-columns:1fr; } .right{ order:3 } }
</style>
