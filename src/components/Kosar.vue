<template>
  <aside class="kosar">
    <h3>Kosár</h3>
    <div v-if="cart.length===0" class="empty">Üres</div>
    <div v-else class="items">
      <div v-for="(ci, idx) in cart" :key="ci.item.id + '-' + ci.price.label" class="ci">
        <div class="left">
          <div class="title">{{ ci.item.title }}</div>
          <div class="meta">{{ ci.price.label }} — {{ formatPrice(ci.price.price) }} Ft</div>
        </div>
        <div class="right">
          <div class="qty">
            <button @click="$emit('decrement', idx)">-</button>
            <span>{{ ci.qty }}</span>
            <button @click="$emit('increment', idx)">+</button>
          </div>
          <div class="lineprice">{{ formatPrice(ci.price.price * ci.qty) }} Ft</div>
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
import { PropType } from 'vue'

const props = defineProps({ cart: { type: Array as PropType<any[]>, required: true } })
const emit = defineEmits(['increment','decrement','remove'])

const total = computed(() => props.cart.reduce((s:any, c:any) => s + c.price.price * c.qty, 0))

function formatPrice(n:number){ return n.toLocaleString() }
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
