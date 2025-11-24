<template>
  <teleport to="body">
    <div v-if="isOpen" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <button class="modal-close" @click="closeModal" title="Close">✕</button>

        <div class="modal-header">
          <h2 class="modal-title">Szeretnél egy üdítőt?</h2>
          <p class="modal-subtitle">Még nem választottál italt a rendelésedhez.</p>
        </div>

        <div class="drink-card" v-if="drink">
          <div class="drink-image-container" v-if="drink.image">
            <img :src="drink.image" :alt="drink.title" class="drink-image" />
          </div>
          <div class="drink-details">
            <h3 class="drink-name">{{ drink.title }}</h3>
            <p class="drink-desc">{{ drink.description }}</p>
            <div class="drink-price">{{ formatPrice(price) }} Ft</div>
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn-cancel" @click="closeModal">Nem, köszönöm</button>
          <button class="btn-add" @click="addToCart">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            Hozzáadás ({{ formatPrice(price) }} Ft)
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PropType } from 'vue'
import type { Food } from '@/stores/foods'

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  drink: { type: Object as PropType<Food | null>, required: false }
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'add', payload: { drink: Food; price: { label: string; price: number } }): void
}>()

const price = computed(() => {
  if (props.drink?.prices && props.drink.prices.length > 0) {
    return props.drink.prices[0]!.price
  }
  return 0
})

function formatPrice(n: number) {
  return n.toLocaleString('hu-HU')
}

function closeModal() {
  emit('close')
}

function addToCart() {
  if (!props.drink || !props.drink.prices || props.drink.prices.length === 0) return
  const price = props.drink.prices[0]
  if (!price) return

  emit('add', {
    drink: props.drink,
    price: price
  })
  closeModal()
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
  animation: fadeIn 0.2s ease-out;
}

.modal-content {
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 400px;
  position: relative;
  animation: slideUp 0.3s ease-out;
  overflow: hidden;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 10;
  color: #666;
}

.modal-close:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #000;
}

.modal-header {
  padding: 24px 24px 16px;
  text-align: center;
}

.modal-title {
  margin: 0 0 8px;
  font-size: 22px;
  font-weight: 700;
  color: #1a1a1a;
}

.modal-subtitle {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.drink-card {
  padding: 0 24px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.drink-image-container {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  background: #f5f5f5;
  border: 4px solid #fff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.drink-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.drink-details {
  text-align: center;
}

.drink-name {
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
}

.drink-desc {
  margin: 0 0 8px;
  font-size: 13px;
  color: #888;
  line-height: 1.4;
}

.drink-price {
  font-size: 18px;
  font-weight: 700;
  color: #ff6106;
}

.modal-actions {
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  background: #f9f9f9;
  border-top: 1px solid #eee;
}

.btn-cancel,
.btn-add {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel {
  background: transparent;
  color: #666;
  border: 1px solid #ddd;
}

.btn-cancel:hover {
  background: #f0f0f0;
  color: #333;
}

.btn-add {
  background: #ff6106;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(255, 97, 6, 0.2);
}

.btn-add:hover {
  background: #e55a00;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(255, 97, 6, 0.3);
}

@media (max-width: 480px) {
  .modal-actions {
    flex-direction: column-reverse;
  }
}
</style>
