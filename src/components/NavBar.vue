<template>
  <nav class="nav fixed top-0 right-0 left-0 z-50 h-[80px] shadow-md flex items-center">
    <div class="container worker-sans-regular text-white flex justify-between">
      <router-link to="/" class="logo">
        <img src="/static_images/logo.png" class="h-[80px]" />
      </router-link>

      <ul class="links h-full flex items-center">
        <li><router-link to="/" class="flex items-center h-full px-3">Főoldal</router-link></li>
        <li><router-link to="/menu" class="flex items-center h-full px-3">Rendelés</router-link></li>
        <li><router-link to="/about" class="flex items-center h-full px-3">Rólunk</router-link></li>
        <li><router-link to="/contact" class="flex items-center h-full px-3">Kapcsolat</router-link></li>

        <!-- Cart inside links as an li -->
        <li class="relative cart-li" ref="cartLi">
          <button class="cart-btn flex items-center px-3 h-full relative" @click="toggleCart" aria-label="Kosár">
            <!-- cart icon -->
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <span v-if="itemCount" class="cart-badge">{{ itemCount }}</span>
          </button>
        </li>
      </ul>

      <!-- Teleported dropdown to body so it can float top-right -->
      <teleport to="body">
        <div v-if="showCart" class="cart-dropdown fixed z-50" :style="dropdownStyle" ref="dropdownEl" role="dialog" aria-label="Kosár">
          <KosarWidget :cart="kosarCart" @increment="onIncrement" @decrement="onDecrement" />
        </div>
      </teleport>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watchEffect } from 'vue'
import { useCartStore } from '@/stores/cart'
import KosarWidget from './KosarWidget.vue'

const cartStore = useCartStore()
const showCart = ref(false)
const cartLi = ref<HTMLElement | null>(null)
const dropdownEl = ref<HTMLElement | null>(null)

const itemCount = computed(() => cartStore.itemCount)

const kosarCart = computed(() => cartStore.items.map(i => ({ item: i.food, price: { label: i.selectedPrice.label, price: i.selectedPrice.price }, qty: i.quantity })))

function toggleCart(){ showCart.value = !showCart.value }

function onIncrement(idx:number){
  // prefer direct index, fallback by matching id+label
  const entry = cartStore.items[idx]
  if(entry){ cartStore.updateQuantity(entry.food.id, entry.selectedPrice.label, entry.quantity + 1); return }
  const mapped = kosarCart.value[idx]
  if(mapped){ const found = cartStore.items.find(i => i.food.id === mapped.item.id && i.selectedPrice.label === mapped.price.label); if(found) cartStore.updateQuantity(found.food.id, found.selectedPrice.label, found.quantity + 1) }
}
function onDecrement(idx:number){
  const entry = cartStore.items[idx]
  if(entry){ cartStore.updateQuantity(entry.food.id, entry.selectedPrice.label, entry.quantity - 1); return }
  const mapped = kosarCart.value[idx]
  if(mapped){ const found = cartStore.items.find(i => i.food.id === mapped.item.id && i.selectedPrice.label === mapped.price.label); if(found) cartStore.updateQuantity(found.food.id, found.selectedPrice.label, found.quantity - 1) }
}

// compute dropdown absolute position based on navbar li position
const DROPDOWN_WIDTH = 300 // must match widget width
const dropdownStyle = ref<Record<string,string>>({ top: '90px', left: '1rem' })

function updateDropdownPosition(){
  if(!cartLi.value) return
  const rect = cartLi.value.getBoundingClientRect()
  // position dropdown so its center lines up with the center of the li
  const top = rect.bottom + 8
  const liCenter = rect.left + rect.width / 2
  let left = liCenter - DROPDOWN_WIDTH / 2
  // clamp inside viewport
  left = Math.max(8, Math.min(left, window.innerWidth - DROPDOWN_WIDTH - 8))
  const leftRounded = Math.round(left)
  // compute arrow offset relative to dropdown left (pixels)
  const arrowOffset = Math.round(liCenter - leftRounded)
  dropdownStyle.value = { top: `${top}px`, left: `${leftRounded}px`, ['--arrow-left']: `${arrowOffset}px` }
}

function onDocClick(e: MouseEvent){
  const target = e.target as Node | null
  if(!showCart.value) return
  if(cartLi.value && cartLi.value.contains(target)) return
  if(dropdownEl.value && dropdownEl.value.contains(target)) return
  showCart.value = false
}

onMounted(()=>{
  window.addEventListener('resize', updateDropdownPosition)
  document.addEventListener('click', onDocClick)
})
onBeforeUnmount(()=>{
  window.removeEventListener('resize', updateDropdownPosition)
  document.removeEventListener('click', onDocClick)
})

// watch showCart to recalc position after it's shown
watchEffect(async ()=>{
  if(showCart.value){ await nextTick(); updateDropdownPosition() }
})
</script>

<style scoped>
.nav {
  background: var(--bg, #D63D11);
}
.container {
  height: 80px;
  max-width: 1024px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-items: center;
  justify-content: space-between;
}
.logo {
  font-weight: 700;
  font-size: 1.125rem;
  color: inherit;
  text-decoration: none;
}
.links {
  list-style: none;
  display: flex;
  gap: 0; /* remove gap so hover highlights touch */
  margin: 0;
  padding: 0;
}
.links a {
  color: inherit;
  text-decoration: none;
  display: flex;
  align-items: center;
  padding: 0 0.75rem; /* horizontal spacing */
  height: 80px; /* fill navbar height */
  transition: background-color 0.12s ease, color 0.12s ease;
}
.links a:hover {
  /* subtle filled hover that touches adjacent items */
  background: rgba(255,97,6,0.12);
  color: white;
}
.links a.router-link-active {
  background: #FF6106;
  color: white;
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

/* cart styles */
.cart-btn{ background: transparent; border: none; color: inherit; cursor: pointer; position: relative; }
.cart-badge{ position: absolute; top: -5px; right: -5px; background:#FF6106; color:#fff; font-weight:700; border-radius:999px; padding:0 6px; font-size:12px; min-width: 20px; text-align: center; }
.cart-dropdown{ width:300px; background:#fff; border:1px solid rgba(0,0,0,0.08); border-radius:12px; box-shadow:0 8px 20px rgba(0,0,0,0.08); padding:0 }
.cart-dropdown::before{ /* outer arrow / border */
  content: '';
  position: absolute;
  top: -9px;
  left: calc(var(--arrow-left, 150px) - 10px);
  border-width: 0 10px 10px 10px;
  border-style: solid;
  border-color: transparent transparent rgba(0,0,0,0.08) transparent;
  height:0; width:0;
}
.cart-dropdown::after{ /* inner arrow */
  content: '';
  position: absolute;
  top: -8px;
  left: calc(var(--arrow-left, 150px) - 9px);
  border-width: 0 9px 9px 9px;
  border-style: solid;
  border-color: transparent transparent #fff transparent;
  height:0; width:0;
}
.cart-li{ display:flex; align-items:center }
</style>
