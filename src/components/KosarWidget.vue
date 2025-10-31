<template>
  <aside class="kosar">
    <h3>Kosár ({{ cartStore.itemCount }})</h3>
    <div v-if="cartStore.isEmpty" class="empty">Üres a kosár</div>
    <div v-else class="items">
      <div v-for="item in cartStore.items" :key="`${item.food.id}-${item.selectedPrice.label}`" class="ci">
        <div class="left">
          <div class="title">{{ item.food.title }}</div>
          <div class="meta">{{ item.selectedPrice.label }} — {{ formatPrice(item.selectedPrice.price) }} Ft</div>
        </div>
        <div class="right">
          <div class="qty">
            <button @click="cartStore.updateQuantity(item.food.id, item.selectedPrice.label, item.quantity - 1)">-</button>
            <span>{{ item.quantity }}</span>
            <button @click="cartStore.updateQuantity(item.food.id, item.selectedPrice.label, item.quantity + 1)">+</button>
          </div>
          <div class="lineprice">{{ formatPrice(item.selectedPrice.price * item.quantity) }} Ft</div>
        </div>
      </div>

      <div class="total">
        <div>Végösszeg:</div>
        <div class="sum">{{ formatPrice(cartStore.totalPrice) }} Ft</div>
      </div>
      <div class="mt-5">
        <router-link to="/order" class="checkout">Rendelés leadása</router-link>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useCartStore } from '@/stores/cart'

const cartStore = useCartStore()

function formatPrice(n: number) {
  return n.toLocaleString()
}
</script>

<style scoped>
.kosar{ width:300px; background:#fff; padding:16px; border-radius:12px }
.kosar h3{ margin:0 0 8px }
.empty{ color:#999 }
.ci{ display:flex; justify-content:space-between; gap:8px; padding:8px 0; border-bottom:1px dashed #eee }
.ci .left .title{ font-weight:600 }
.ci .meta{ color:#888; font-size:13px }
.qty{ display:flex; align-items:center; gap:6px }
.qty button{ width:28px; height:28px; border-radius:6px; border:1px solid #ddd; background:#fff }
.lineprice{ font-weight:700 }
.total{ display:flex; justify-content:space-between; margin-top:12px; font-weight:700 }
.checkout{ width:100%; margin-top:12px; background:#c94f3f; color:#fff; border:none; padding:10px; border-radius:8px }
</style>
