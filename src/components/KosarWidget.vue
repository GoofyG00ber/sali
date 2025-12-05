<template>
  <div class="kosar-wrapper" :class="{ 'in-menu': isInMenu }">
    <aside class="kosar">
      <h3>Kosár <span class="count">({{ cartStore.itemCount }})</span></h3>
      <div v-if="cartStore.isEmpty" class="empty">Üres a kosár</div>
      <div v-else class="items">
        <div
          v-for="item in cartStore.items"
          :key="`${item.food?.id ?? 'x'}-${item.selectedPrice?.label ?? 'default'}-${item.extras?.map(e => `${e.id}:${e.quantity}`).join('|') || ''}`"
          class="ci"
        >
          <div class="left">
            <div class="title">{{ item.food?.title }}</div>
            <div class="meta">
              {{ item.selectedPrice?.label ?? 'Alap' }} —
              {{ formatPrice(item.selectedPrice?.price ?? 0) }} Ft
            </div>
            <div v-if="item.extras && item.extras.length > 0" class="extras-summary">
              <div v-for="extra in item.extras" :key="extra.id" class="extra-line">
                <span class="extra-qty">{{ extra.quantity }}x</span>
                <span class="extra-name">{{ extra.title || 'Feltételek' }}</span>
                <span class="extra-price">{{ formatPrice(extra.price * extra.quantity) }} Ft</span>
              </div>
            </div>
          </div>
          <div class="right">
            <div class="qty">
              <button
                @click="cartStore.updateQuantity(item.food.id, item.selectedPrice?.label ?? '', item.quantity - 1, item.extras && item.extras.length > 0 ? item.extras : undefined)"
              >
                -
              </button>
              <span>{{ item.quantity }}</span>
              <button
                @click="cartStore.updateQuantity(item.food.id, item.selectedPrice?.label ?? '', item.quantity + 1, item.extras && item.extras.length > 0 ? item.extras : undefined)"
              >
                +
              </button>
            </div>
            <div class="lineprice">
              {{ getItemTotal(item) }} Ft
            </div>
          </div>
        </div>
      </div>

      <div class="bottom">
        <div class="total">
          <div>Végösszeg:</div>
          <div class="sum">{{ formatPrice(cartStore.totalPrice) }} Ft</div>
        </div>
        <div class="checkout-container">
          <router-link to="/order" class="checkout" @click="cartStore.closeCart()">Rendelés leadása</router-link>
          <button
            class="trash-btn"
            title="Kosár ürítése"
            @click="clearCart"
            aria-label="Kosár ürítése"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { useCartStore, type CartItem } from '@/stores/cart'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const cartStore = useCartStore()
const route = useRoute()

const props = defineProps<{
  isInSidebar?: boolean
}>()

const isInMenu = computed(() => !props.isInSidebar && route.path === '/menu')

function getItemTotal(item: CartItem): string {
  let total = (item.selectedPrice?.price ?? 0) * item.quantity
  if (item.extras && item.extras.length > 0) {
    const extrasPrice = item.extras.reduce((sum: number, extra) => sum + extra.price, 0)
    total += extrasPrice * item.quantity
  }
  return formatPrice(total)
}

function formatPrice(n: number) {
  return n.toLocaleString('hu-HU')
}

function clearCart() {
  if (confirm('Biztos, hogy szeretnéd üríteni a kosarat?')) {
    cartStore.clearCart()
  }
}
</script>

<style scoped>
.kosar-wrapper { display: block; position: relative; }
.kosar { width: 300px; background: #fff; padding: 16px; border-radius: 12px; display: flex; flex-direction: column; overflow: visible; position: relative; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); }
.kosar h3 { display: block; margin: 0 0 12px 0; padding: 0; font-family: "Work Sans", sans-serif; font-weight: 600; font-style: normal; color: #000; font-size: 1rem; }

/* In menu view - apply Pacifico style with overflow */
.kosar-wrapper.in-menu .kosar {
  margin-top: 20px;
}

.kosar-wrapper.in-menu .kosar h3 {
  font-family: 'Pacifico', cursive;
  font-weight: 400;
  font-style: normal;
  color: #682121;
  font-size: 2.25rem;
  position: absolute;
  top: -20px;
  left: 16px;
  line-height: 1.2;
  margin: 0;
  white-space: nowrap;
  overflow: visible;
}

.kosar-wrapper.in-menu .kosar h3 .count {
  font-family: "Work Sans", sans-serif;
  font-weight: 600;
  font-size: 1rem;
}

.kosar-wrapper.in-menu .kosar .items {
  margin-top: 0;
}

.kosar .items { overflow-y: auto; overflow-x: hidden; max-height: calc(100vh - 300px); padding-right: 8px; flex: 1; min-height: 0; }
.kosar .empty { color: #999; padding: 16px; text-align: center; flex: 1; display: flex; align-items: center; justify-content: center; }
.ci { display: flex; justify-content: space-between; gap: 8px; padding: 8px 0; border-bottom: 1px dashed #eee; min-width: 0; }
.ci .left { min-width: 0; flex: 1; }
.ci .left .title { font-weight: 600; word-break: break-word; }
.ci .meta { color: #888; font-size: 13px; margin-bottom: 4px; }
.extras-summary { display: flex; flex-direction: column; gap: 3px; margin-top: 4px; padding-top: 4px; border-top: 1px solid #f0f0f0; min-width: 0; }
.extra-line { display: flex; align-items: center; gap: 4px; font-size: 12px; color: #888; line-height: 1; min-width: 0; }
.extra-qty { font-weight: 600; color: #ff6106; min-width: 20px; flex-shrink: 0; }
.extra-name { flex: 1; min-width: 0; word-break: break-word; }
.extra-price { font-weight: 600; color: #666; font-size: 11px; flex-shrink: 0; white-space: nowrap; }
.ci .right { display: flex; flex-direction: column; gap: 6px; }
.qty { display: flex; align-items: center; gap: 6px; }
.qty button { width: 28px; height: 28px; border-radius: 6px; border: 1px solid #ddd; background: #fff; cursor: pointer; }
.lineprice { font-weight: 700; }
.bottom { display: block; padding-top: 12px; border-top: 1px dashed #eee; margin-top: auto; }
.total { display: flex; justify-content: space-between; margin-bottom: 12px; font-weight: 700; }
.checkout-container { display: flex; gap: 8px; align-items: stretch; }
.checkout { display: block; flex: 1; background: #FF6106; color: #fff; border: 1px solid #FF6106; padding: 12px 16px; border-radius: 8px; text-decoration: none; text-align: center; cursor: pointer; font-weight: 600; font-size: 16px; font-family: "Work Sans", sans-serif; transition: background-color 0.2s ease, border-color 0.2s ease; display: flex; align-items: center; justify-content: center; }
.checkout:hover { background: #E55A00; border-color: #E55A00; }
.trash-btn { background: #fff; border: 1px solid #ddd; color: #ff6106; aspect-ratio: 1; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s ease; flex-shrink: 0; padding: 0 12px; }
.trash-btn:hover { background: #ffebee; border-color: #ff6106; color: #e55a00; }

@media (max-width: 768px) {
  .kosar-wrapper { display: flex; flex-direction: column; height: 100%; }
  .kosar h3 { display: none; }
  .kosar { width: 100%; padding: 0; display: flex; flex-direction: column; overflow: hidden; flex: 1; border-radius: 0; }
  .kosar-wrapper.in-menu .kosar { margin-top: 0; }
  .kosar .items { flex: 1; overflow-y: auto; padding: 16px; padding-top: 16px; margin-top: 0; display: flex; flex-direction: column; gap: 8px; }
  .ci { display: flex; justify-content: space-between; gap: 8px; padding: 8px; border: 1px solid #eee; border-radius: 6px; }
  .ci .right { display: flex; flex-direction: column; gap: 6px; }
  .bottom { display: flex; flex-direction: column; gap: 12px; padding: 16px; border-top: 1px dashed #eee; }
}
</style>
