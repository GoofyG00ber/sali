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
                @click="cartStore.updateQuantity(item.food.id, item.selectedPrice?.label ?? '', item.quantity - 1)"
              >
                -
              </button>
              <span>{{ item.quantity }}</span>
              <button
                @click="cartStore.updateQuantity(item.food.id, item.selectedPrice?.label ?? '', item.quantity + 1)"
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
        <div>
          <router-link to="/order" class="checkout">Rendelés leadása</router-link>
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
    const extrasPrice = item.extras.reduce((sum: number, extra) => sum + (extra.price * extra.quantity), 0)
    total += extrasPrice * item.quantity
  }
  return formatPrice(total)
}

function formatPrice(n: number) {
  return n.toLocaleString('hu-HU')
}
</script>

<style scoped>
.kosar-wrapper { display: block; position: relative; }
.kosar { width: 300px; background: #fff; padding: 16px; border-radius: 12px; display: block; overflow: visible; position: relative; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); }
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
}

.kosar-wrapper.in-menu .kosar h3 .count {
  font-family: "Work Sans", sans-serif;
  font-weight: 600;
  font-size: 1rem;
}

.kosar-wrapper.in-menu .kosar .items {
  margin-top: 0;
}

.kosar .items { overflow-y: auto; overflow-x: hidden; max-height: calc(100vh - 300px); }
.kosar .empty { color: #999; }
.ci { display: flex; justify-content: space-between; gap: 8px; padding: 8px 0; border-bottom: 1px dashed #eee; min-width: 0; }
.ci .left { min-width: 0; flex: 1; }
.ci .left .title { font-weight: 600; word-break: break-word; }
.ci .meta { color: #888; font-size: 13px; margin-bottom: 4px; }
.extras-summary { display: flex; flex-direction: column; gap: 3px; margin-top: 4px; padding-top: 4px; border-top: 1px solid #f0f0f0; min-width: 0; }
.extra-line { display: flex; align-items: center; gap: 4px; font-size: 12px; color: #888; line-height: 1; min-width: 0; }
.extra-qty { font-weight: 600; color: #ff6106; min-width: 20px; flex-shrink: 0; }
.extra-name { flex: 1; min-width: 0; word-break: break-word; }
.extra-price { font-weight: 600; color: #666; font-size: 11px; flex-shrink: 0; white-space: nowrap; }
.qty { display: flex; align-items: center; gap: 6px; }
.qty button { width: 28px; height: 28px; border-radius: 6px; border: 1px solid #ddd; background: #fff; }
.lineprice { font-weight: 700; }
.bottom { display: block; padding-top: 12px; border-top: 1px dashed #eee; }
.total { display: flex; justify-content: space-between; margin-bottom: 12px; font-weight: 700; }
.checkout { display: block; width: 100%; background: #FF6106; color: #fff; border: 1px solid #FF6106; padding: 12px 16px; border-radius: 8px; text-decoration: none; text-align: center; cursor: pointer; font-weight: 600; font-size: 16px; font-family: "Work Sans", sans-serif; transition: background-color 0.2s ease, border-color 0.2s ease; }
.checkout:hover { background: #E55A00; border-color: #E55A00; }

/* Hide kosar on medium screens and below (1000px to 769px) */
@media (max-width: 1000px) {
  .kosar-wrapper { display: none; }
}

@media (max-width: 768px) {
  .kosar-wrapper { display: flex; flex-direction: column; height: 100%; }
  .kosar h3 { display: none; }
  .kosar { width: 100%; padding: 0; display: flex; flex-direction: column; overflow: hidden; flex: 1; }
  .kosar .items { flex: 1; overflow-y: auto; padding: 16px; padding-top: 16px; margin-top: 0; }
  .bottom { display: flex; flex-direction: column; gap: 12px; padding: 16px; border-top: 1px dashed #eee; }
}
</style>
