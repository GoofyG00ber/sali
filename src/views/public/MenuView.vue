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
type Item = { id:number; title:string; description?:string; prices: Price[]; image?:string }
type Category = { id:number; title:string; items: Item[] }

const menu = ref<{ categories: Category[] }>({ categories: [] })
const selectedCategoryId = ref<number | undefined>(undefined)
const cartStore = useCartStore()

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
  // Convert the item to Food type for cart store
  const food: Food = {
    id: item.id,
    title: item.title,
    description: item.description || '',
    prices: item.prices,
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
.left{ }
.center{ }
.right{ }

@media (max-width:1000px){ .menu-page{ grid-template-columns:1fr; } .right{ order:3 } }
</style>
