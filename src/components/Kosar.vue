<template>
  <aside class="kosar">
    <h3>Kosár</h3>
    <div v-if="cart.length===0" class="empty">Üres</div>
    <div v-else class="items">
      <div v-for="(ci, idx) in cart" :key="ci.item.id + '-' + ci.price.label + (ci.extras?.map(e => `${e.id}:${e.quantity}`).join('|') || '')" class="ci">
        <div class="left">
          <div class="title">{{ ci.item.title }}</div>
          <div class="meta">{{ ci.price.label }} — {{ formatPrice(ci.price.price) }} Ft</div>
          <div v-if="ci.extras && ci.extras.length > 0" class="extras-summary">
            <div v-for="extra in ci.extras" :key="extra.id" class="extra-line">
              <span class="extra-qty">{{ extra.quantity }}x</span>
              <span class="extra-name">{{ extra.title || 'Feltételek' }}</span>
              <span class="extra-price">{{ formatPrice(extra.price * extra.quantity) }} Ft</span>
            </div>
          </div>
        </div>
        <div class="right">
          <div class="qty">
            <button @click="$emit('decrement', idx)">-</button>
            <span>{{ ci.qty }}</span>
            <button @click="$emit('increment', idx)">+</button>
          </div>
          <div class="lineprice">{{ formatPrice(getItemTotal(ci)) }} Ft</div>
        </div>
      </div>

      <div class="total">
        <div>Végösszeg:</div>
        <div class="sum">{{ formatPrice(total) }} Ft</div>
      </div>
      <button class="checkout">Tovább</button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PropType } from 'vue'

interface Extra {
  id: number
  title?: string
  quantity: number
  price: number
}

interface CartItem {
  item: { id: number; title: string }
  price: { label: string; price: number }
  qty: number
  extras?: Extra[]
}

const props = defineProps({ cart: { type: Array as PropType<CartItem[]>, required: true } })
const emit = defineEmits(['increment','decrement','remove'])

function getItemTotal(item: CartItem): number {
  let total = item.price.price * item.qty
  if (item.extras) {
    const extrasPrice = item.extras.reduce((sum, extra) => sum + (extra.price * extra.quantity), 0)
    total += extrasPrice * item.qty
  }
  return total
}

const total = computed(() => props.cart.reduce((s: number, c: CartItem) => s + getItemTotal(c), 0))

function formatPrice(n:number){ return n.toLocaleString('hu-HU') }
</script>

<style scoped>
.kosar{ width:300px; background:#fff; padding:16px; border-radius:12px; box-sizing: border-box; overflow-x: hidden; }
.kosar h3{ margin:0 0 8px }
.empty{ color:#999 }
.ci{ display:flex; justify-content:space-between; gap:8px; padding:12px 0; border-bottom:1px dashed #eee; min-width: 0; }
.ci .left{ min-width: 0; flex: 1; }
.ci .left .title{ font-weight:600; margin-bottom:4px; word-break: break-word; }
.ci .meta{ color:#888; font-size:12px; margin-bottom:6px }
.extras-summary{ display:flex; flex-direction:column; gap:4px; margin-top:6px; padding-top:6px; border-top:1px solid #f0f0f0; min-width: 0; }
.extra-line{ display:flex; align-items:center; gap:6px; font-size:12px; color:#888; line-height:1; min-width: 0; }
.extra-qty{ font-weight:600; color:#ff6106; min-width:24px; flex-shrink: 0; }
.extra-name{ flex:1; min-width: 0; word-break: break-word; }
.extra-price{ font-weight:600; color:#666; flex-shrink: 0; white-space: nowrap; }
.qty{ display:flex; align-items:center; gap:6px }
.qty button{ width:28px; height:28px; border-radius:6px; border:1px solid #ddd; background:#fff; cursor:pointer }
.lineprice{ font-weight:700; white-space: nowrap; }
.total{ display:flex; justify-content:space-between; margin-top:12px; font-weight:700 }
.checkout{ width:100%; margin-top:12px; background:#c94f3f; color:#fff; border:none; padding:10px; border-radius:8px; cursor:pointer }
</style>
