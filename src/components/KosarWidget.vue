<template>
  <div class="kosar-wrapper">
    <aside class="kosar">
      <h3>Kosár ({{ cartStore.itemCount }})</h3>
      <div v-if="cartStore.isEmpty" class="empty">Üres a kosár</div>
      <div v-else class="items">
        <div
          v-for="item in cartStore.items"
          :key="`${item.food?.id ?? 'x'}-${item.selectedPrice?.label ?? 'default'}`"
          class="ci"
        >
          <div class="left">
            <div class="title">{{ item.food?.title }}</div>
            <div class="meta">
              {{ item.selectedPrice?.label ?? 'Alap' }} —
              {{ formatPrice(item.selectedPrice?.price ?? 0) }} Ft
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
              {{ formatPrice((item.selectedPrice?.price ?? 0) * item.quantity) }} Ft
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
import { useCartStore } from '@/stores/cart'

const cartStore = useCartStore()

function formatPrice(n: number) {
  return n.toLocaleString()
}
</script>

<style scoped>
.kosar-wrapper { display: block; }
.kosar { width: 300px; background: #fff; padding: 16px; border-radius: 12px; display: block; overflow: visible; }
.kosar h3 { display: block; margin: 0 0 12px 0; padding: 0; font-size: 18px; font-weight: 600; }
.kosar .items { overflow: visible; }
.kosar .empty { color: #999; }
.ci { display: flex; justify-content: space-between; gap: 8px; padding: 8px 0; border-bottom: 1px dashed #eee; }
.ci .left .title { font-weight: 600; }
.ci .meta { color: #888; font-size: 13px; }
.qty { display: flex; align-items: center; gap: 6px; }
.qty button { width: 28px; height: 28px; border-radius: 6px; border: 1px solid #ddd; background: #fff; }
.lineprice { font-weight: 700; }
.bottom { display: block; padding-top: 12px; border-top: 1px dashed #eee; }
.total { display: flex; justify-content: space-between; margin-bottom: 12px; font-weight: 700; }
.checkout { display: block; width: 100%; background: #FF6106; color: #fff; border: 1px solid #FF6106; padding: 12px 16px; border-radius: 8px; text-decoration: none; text-align: center; cursor: pointer; font-weight: 600; font-size: 16px; font-family: "Work Sans", sans-serif; transition: background-color 0.2s ease, border-color 0.2s ease; }
.checkout:hover { background: #E55A00; border-color: #E55A00; }

@media (max-width: 768px) {
  .kosar-wrapper { display: flex; flex-direction: column; height: 100%; }
  .kosar h3 { display: none; }
  .kosar { width: 100%; padding: 0; display: flex; flex-direction: column; overflow: hidden; flex: 1; }
  .kosar .items { flex: 1; overflow-y: auto; padding: 16px; }
  .bottom { display: flex; flex-direction: column; gap: 12px; padding: 16px; border-top: 1px dashed #eee; }
}
</style>
