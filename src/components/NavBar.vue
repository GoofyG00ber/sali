<template>
  <!-- Desktop NavBar (top) -->
  <nav class="nav hidden md:flex fixed top-0 right-0 left-0 z-50 h-[80px] shadow-md items-center">
    <div class="container worker-sans-regular text-white flex justify-between">
      <div class="flex items-center gap-6">
        <router-link to="/" class="logo">
          <img src="/static_images/logo.png" class="h-[60px]" />
        </router-link>

        <!-- Status Indicator next to logo -->
        <div class="flex items-center gap-2">
          <div :class="['status-dot', props.isOpen ? 'open' : 'closed']"></div>
          <span class="text-sm">{{ props.isOpen ? 'Rendelést fogadunk' : 'Jelenleg zárva vagyunk' }}</span>
        </div>
      </div>

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
            <span v-if="itemCount" :key="itemCount" class="cart-badge">{{ itemCount }}</span>
          </button>
        </li>
      </ul>

      <!-- Teleported dropdown to body so it can float top-right -->
      <teleport to="body">
        <div v-if="showCart" class="cart-dropdown fixed z-50" :style="dropdownStyle" ref="dropdownEl" role="dialog" aria-label="Kosár">
          <KosarWidget :isInSidebar="true" :cart="kosarCart" @increment="onIncrement" @decrement="onDecrement" />
        </div>
      </teleport>
    </div>
  </nav>

  <!-- Mobile NavBar (bottom with icons) -->
  <nav class="mobile-nav md:hidden fixed bottom-0 right-0 left-0 z-50 bg-white shadow-lg">
    <ul class="mobile-links flex justify-around items-stretch h-20">
      <li class="flex-1">
        <div class="mobile-link status-link" :class="{ active: false }">
          <div class="flex flex-col items-center justify-center gap-1">
            <div :class="['status-dot', 'mobile', props.isOpen ? 'open' : 'closed']"></div>
            <span class="text-xs">{{ props.isOpen ? 'NYITVA' : 'ZÁRVA' }}</span>
          </div>
        </div>
      </li>
      <li class="flex-1">
        <router-link to="/" class="mobile-link" :class="{ active: route.path === '/' }" aria-label="Főoldal">
          <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          </svg>
        </router-link>
      </li>
      <li class="flex-1">
        <router-link to="/menu" class="mobile-link" :class="{ active: route.path === '/menu' }" aria-label="Rendelés">
          <!-- Pizza slice icon -->
          <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transform: rotate(45deg)">
            <path d="M12 2L2 22h20L12 2z"></path>
            <circle cx="9" cy="15" r="1.5" fill="currentColor"></circle>
            <circle cx="15" cy="15" r="1.5" fill="currentColor"></circle>
            <circle cx="12" cy="10" r="1.5" fill="currentColor"></circle>
          </svg>
        </router-link>
      </li>
      <li class="flex-1">
        <button class="mobile-link cart-btn" :class="{ active: showMobileCart }" @click.stop="toggleMobileCart" aria-label="Kosár">
          <div style="position: relative; display: flex; align-items: center; justify-content: center;">
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <span v-if="itemCount" :key="itemCount" class="mobile-cart-badge">{{ itemCount }}</span>
          </div>
        </button>
      </li>
      <li class="flex-1">
        <router-link to="/contact" class="mobile-link" :class="{ active: route.path === '/contact' }" aria-label="Kapcsolat">
          <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2"></rect>
            <path d="M22 4l-10 7L2 4"></path>
          </svg>
        </router-link>
      </li>
      <li class="flex-1">
        <router-link to="/about" class="mobile-link" :class="{ active: route.path === '/about' }" aria-label="Rólunk">
          <!-- Info/About icon -->
          <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 16v-4"></path>
            <path d="M12 8h.01"></path>
          </svg>
        </router-link>
      </li>
    </ul>

    <!-- Teleported dropdown for mobile cart -->
    <teleport to="body">
      <div v-if="showMobileCart" class="mobile-cart-dropdown fixed z-50" ref="mobileDropdownEl" role="dialog" aria-label="Kosár">
        <div class="flex justify-between items-center p-4 border-b flex-shrink-0">
          <h2 class="text-lg font-semibold">Kosár ({{ itemCount }})</h2>
          <button @click="toggleMobileCart" class="text-gray-500 hover:text-gray-700 text-2xl leading-none" aria-label="Bezárás">×</button>
        </div>
        <div class="flex-1 overflow-y-auto min-h-0">
          <KosarWidget :cart="kosarCart" @increment="onIncrement" @decrement="onDecrement" />
        </div>
      </div>
    </teleport>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import KosarWidget from './KosarWidget.vue'

const props = defineProps<{
  isOpen: boolean
}>()

const route = useRoute()
const cartStore = useCartStore()
const showCart = ref(false)
const showMobileCart = ref(false)
const cartLi = ref<HTMLElement | null>(null)
const dropdownEl = ref<HTMLElement | null>(null)
const mobileDropdownEl = ref<HTMLElement | null>(null)

// Sync local state with store state
watchEffect(() => {
  if (cartStore.isCartOpen) {
    if (window.innerWidth < 768) {
      showMobileCart.value = true
      showCart.value = false
    } else {
      showCart.value = true
      showMobileCart.value = false
    }
  } else {
    showCart.value = false
    showMobileCart.value = false
  }
})

const itemCount = computed(() => cartStore.itemCount)

const kosarCart = computed(() => cartStore.items.map(i => ({ item: i.food, price: { label: i.selectedPrice.label, price: i.selectedPrice.price }, qty: i.quantity })))

function toggleCart(){
  cartStore.toggleCart()
}
function toggleMobileCart(){
  cartStore.toggleCart()
}

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
  left = Math.max(8, Math.min(left, window.innerWidth - DROPDOWN_WIDTH - 28))
  const leftRounded = Math.round(left)
  // compute arrow offset relative to dropdown left (pixels)
  const arrowOffset = Math.round(liCenter - leftRounded)
  dropdownStyle.value = { top: `${top}px`, left: `${leftRounded}px`, ['--arrow-left']: `${arrowOffset}px` }
}

function onDocClick(e: MouseEvent){
  const target = e.target as Node | null
  // Handle desktop cart
  if(showCart.value) {
    if(cartLi.value && cartLi.value.contains(target)) return
    if(dropdownEl.value && dropdownEl.value.contains(target)) return
    cartStore.closeCart()
  }
  // Handle mobile cart
  if(showMobileCart.value) {
    if(e.target === document.querySelector('.mobile-link.cart-btn')) return
    if(mobileDropdownEl.value && mobileDropdownEl.value.contains(target)) return
    cartStore.closeCart()
  }
}

function onWindowResize(){
  updateDropdownPosition()
  // Close cart on resize
  cartStore.closeCart()
}

onMounted(()=>{
  window.addEventListener('resize', onWindowResize)
  document.addEventListener('click', onDocClick)
})
onBeforeUnmount(()=>{
  window.removeEventListener('resize', onWindowResize)
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

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
  animation: pulse 2s infinite;
}

.status-dot.open {
  background: #4ade80;
  box-shadow: 0 0 0 2px #fff, 0 0 12px rgba(74, 222, 128, 0.9);
}

.status-dot.closed {
  background: #dc2626;
  box-shadow: 0 0 0 2px #fff, 0 0 12px rgba(220, 38, 38, 0.9);
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* Mobile navbar styles */
.mobile-nav {
  height: 80px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  overflow: visible;
}

.mobile-links {
  list-style: none;
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: visible;
}

.mobile-link {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: color 0.2s ease, background-color 0.2s ease, border-top 0.2s ease;
  position: relative;
  padding: 0;
  margin: 0;
  height: 100%;
  width: 100%;
  border-top: 3px solid transparent;
}

.mobile-link.status-link {
  cursor: default;
}

.status-dot.mobile {
  width: 6px;
  height: 6px;
}

.mobile-link.cart-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mobile-link:hover {
  color: #333;
}

.mobile-link.active,
.mobile-link.router-link-active {
  color: #FF6106;
  border-top: 3px solid #FF6106;
}

@keyframes badge-pop {
  0% {
    transform: scale(1);
    background: #FF6106;
    color: #fff;
  }
  25% {
    transform: scale(1.4);
    background: #fff;
    color: #FF6106;
  }
  75% {
    transform: scale(1.4);
    background: #fff;
    color: #FF6106;
  }
  100% {
    transform: scale(1);
    background: #FF6106;
    color: #fff;
  }
}

.mobile-cart-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #FF6106;
  color: #fff;
  font-weight: 700;
  border-radius: 999px;
  padding: 0 6px;
  font-size: 12px;
  min-width: 20px;
  text-align: center;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: badge-pop 0.6s ease-in-out;
}

.mobile-cart-dropdown {
  top: 100px;
  bottom: 100px;
  left: 12px;
  right: 12px;
  width: auto;
  height: auto;
  max-width: none;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  padding: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  max-height: calc(100vh - 200px);
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
.cart-badge{ position: absolute; top: -5px; right: -5px; background:#FF6106; color:#fff; font-weight:700; border-radius:999px; padding:0 6px; font-size:12px; min-width: 20px; text-align: center; animation: badge-pop 0.6s ease-in-out; }
.cart-dropdown{ width:300px; background:#fff; border:1px solid rgba(0,0,0,0.08); border-radius:12px; box-shadow:0 8px 20px rgba(0,0,0,0.08); padding:0; margin-right: 20px; }
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
