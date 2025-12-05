<template>
  <teleport to="body">
    <div v-if="isOpen" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <button class="modal-close" @click="closeModal" title="Close">✕</button>

        <div class="modal-header">
          <h2 class="pizza-name">{{ item?.title }}</h2>
          <p class="pizza-description">{{ item?.description }}</p>
        </div>

        <!-- Size Selection -->
        <div class="section">
          <h3>Pizza Mérete</h3>
          <div class="size-buttons">
            <button
              v-for="price in item?.prices || []"
              :key="price.label"
              :class="{ selected: selectedSize.label === price.label }"
              @click="selectSize(price)"
              class="size-btn"
            >
              {{ price.label }}
              <span class="price">{{ formatPrice(price.price) }} Ft</span>
            </button>
          </div>
        </div>

        <!-- Extras/Feltétek Section -->
        <div class="section">
          <h3>Feltételek</h3>
          <div class="extras-list">
            <div v-if="extras.length === 0" class="no-extras">
              Nincs elérhető feltételek
            </div>
            <div v-for="extra in extras" :key="extra.id" :class="{ 'extra-item': true, 'extra-selected': selectedExtras[extra.id] || false }" @click="toggleExtra(extra.id)" role="button" tabindex="0">
              <div class="extra-info">
                <h4>{{ extra.title }}</h4>
                <p v-if="getPriceForSize(extra) > 0" class="extra-price">
                  {{ formatPrice(getPriceForSize(extra)) }} Ft
                </p>
                <p v-else class="extra-price-loading">
                  Ár betöltésben...
                </p>
              </div>
              <button @click.stop="toggleExtra(extra.id)" :class="{ 'toggle-on': selectedExtras[extra.id] }" class="toggle-btn-small">{{ selectedExtras[extra.id] ? '✓' : '' }}</button>
            </div>
          </div>
        </div>

        <!-- Summary -->
        <div class="section summary-section">
          <div class="summary-row">
            <span>Pizza ár:</span>
            <span class="amount">{{ formatPrice(selectedSize.price) }} Ft</span>
          </div>
          <div v-if="extrasTotal > 0" class="summary-row">
            <span>Feltételek:</span>
            <span class="amount">{{ formatPrice(extrasTotal) }} Ft</span>
          </div>
          <div class="summary-row total">
            <span>Összesen:</span>
            <span class="amount">{{ formatPrice(totalPrice) }} Ft</span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="modal-actions">
          <button class="btn-cancel" @click="closeModal">Mégse</button>
          <button class="btn-add" @click="addToCart">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            Kosárba
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { PropType } from 'vue'

interface Price {
  label: string
  price: number
}

interface Extra {
  id: number
  title: string
  description?: string
  prices?: Price[]
  image?: string
}

interface Item {
  id: number
  title: string
  description?: string
  prices?: Price[]
  image?: string
}

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  item: { type: Object as PropType<Item | null>, required: false },
  extras: { type: Array as PropType<Extra[]>, required: true }
})

const emit = defineEmits<{
  close: []
  addToCart: [data: { item: Item; selectedSize: Price; selectedExtras: Record<number, boolean> }]
}>()

const selectedSize = ref<Price>({ label: '', price: 0 })
const selectedExtras = ref<Record<number, boolean>>({})

// Initialize selected size from item
watch(
  () => props.item,
  (newItem) => {
    if (newItem?.prices && newItem.prices.length > 0) {
      // Try to find 32cm size, otherwise use first price
      const size32 = newItem.prices.find((p) => p.label.includes('32'))
      const price = size32 || newItem.prices[0]
      if (price) {
        selectedSize.value = { label: price.label, price: price.price }
      }
    }
    selectedExtras.value = {}
  },
  { deep: true }
)

function selectSize(price: Price) {
  selectedSize.value = price
}

function toggleExtra(extraId: number) {
  selectedExtras.value[extraId] = !selectedExtras.value[extraId]
}

function getPriceForSize(extra: Extra): number {
  if (!extra.prices || extra.prices.length === 0) {
    return 0
  }

  // Extract size number from selected size label (e.g., "26 cm" -> "26")
  const selectedSizeMatch = selectedSize.value.label.match(/(\d+)/)
  const selectedSizeNum = selectedSizeMatch ? selectedSizeMatch[1] : null

  // First try exact label match
  const exactMatch = extra.prices.find((p) => p.label === selectedSize.value.label)
  if (exactMatch) {
    return exactMatch.price
  }

  // If no exact match and we have a size number, try to find a price that contains that size
  if (selectedSizeNum) {
    const sizeMatch = extra.prices.find((p) => p.label.includes(selectedSizeNum))
    if (sizeMatch) {
      return sizeMatch.price
    }
  }

  // If still no match, return the first available price as fallback
  const firstPrice = extra.prices[0]
  if (firstPrice) {
    return firstPrice.price
  }

  return 0
}

const extrasTotal = computed(() => {
  let total = 0
  Object.entries(selectedExtras.value).forEach(([extraId, isSelected]) => {
    if (isSelected) {
      const extra = props.extras.find((e) => e.id === Number(extraId))
      if (extra) {
        total += getPriceForSize(extra)
      }
    }
  })
  return total
})

const totalPrice = computed(() => {
  return selectedSize.value.price + extrasTotal.value
})

function formatPrice(n: number): string {
  return n.toLocaleString('hu-HU')
}

function closeModal() {
  emit('close')
}

function addToCart() {
  if (!props.item) return
  emit('addToCart', {
    item: props.item,
    selectedSize: selectedSize.value,
    selectedExtras: selectedExtras.value
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
}

.modal-content {
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  border: none;
  background: #f0f0f0;
  border-radius: 50%;
  cursor: pointer;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 10;
}

.modal-close:hover {
  background: #e0e0e0;
  transform: rotate(90deg);
}

.modal-header {
  padding: 24px 24px 12px;
  border-bottom: 1px solid #eee;
}

.pizza-name {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
}

.pizza-description {
  margin: 0;
  color: #888;
  font-size: 14px;
  line-height: 1.4;
}

.section {
  padding: 20px 24px;
  border-bottom: 1px solid #eee;
}

.section h3 {
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.size-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 10px;
}

.size-btn {
  padding: 12px 16px;
  border: 2px solid #ddd;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.size-btn:hover {
  border-color: #ff6106;
  color: #ff6106;
}

.size-btn.selected {
  background: #fff4e6;
  border-color: #ff6106;
  color: #ff6106;
  font-weight: 600;
}

.price {
  font-size: 12px;
  color: inherit;
  font-weight: 600;
}

.extras-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

@media (max-width: 768px) {
  .extras-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .extras-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

.no-extras {
  color: #999;
  font-style: italic;
  padding: 16px;
  text-align: center;
  background: #f5f5f5;
  border-radius: 8px;
}

.extra-item {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  align-items: center;
  text-align: left;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.extra-item:hover {
  background: #f0f0f0;
  transform: translateY(-2px);
}

.extra-item.extra-selected {
  background: #fff3e0;
  border: 2px solid #ff6106;
}

.extra-item.extra-selected:hover {
  background: #ffe6cc;
}

.extra-info {
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.extra-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}

.extra-info h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
}

.extra-price {
  margin: 0;
  font-size: 12px;
  color: #888;
  font-weight: 600;
  text-align: left;
}

.extra-price-loading {
  margin: 0;
  font-size: 12px;
  color: #ccc;
  font-style: italic;
}

.extra-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: flex-end;
  width: 100%;
}

.toggle-btn-small {
  width: 24px;
  height: 24px;
  border: 2px solid #ddd;
  background: white;
  border-radius: 50%;
  cursor: pointer;
  font-size: 12px;
  color: #1a1a1a;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  flex-shrink: 0;
  padding: 0;
  grid-column: 2;
  grid-row: 1 / -1;
}

.toggle-btn-small:hover {
  border-color: #ff6106;
  background: #fff9f0;
}

.toggle-btn-small.toggle-on {
  background: #ff6106;
  border-color: #ff6106;
  color: white;
}

.toggle-btn {
  width: 36px;
  height: 36px;
  border: 2px solid #ddd;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 18px;
  color: #1a1a1a;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.toggle-btn:hover {
  border-color: #ff6106;
  background: #fff9f0;
}

.toggle-btn.toggle-on {
  background: #ff6106;
  border-color: #ff6106;
  color: white;
}

.summary-section {
  background: #f9f9f9;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.summary-row.total {
  border-top: 1px solid #ddd;
  padding-top: 8px;
  margin-top: 8px;
  font-weight: 700;
  font-size: 16px;
  color: #1a1a1a;
}

.amount {
  font-weight: 600;
  color: #ff6106;
}

.modal-actions {
  display: flex;
  gap: 12px;
  padding: 16px 24px 24px;
}

.btn-cancel,
.btn-add {
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-cancel {
  background: #f0f0f0;
  color: #666;
}

.btn-cancel:hover {
  background: #e0e0e0;
}

.btn-add {
  background: #ff6106;
  color: white;
}

.btn-add:hover {
  background: #e55a00;
}

.btn-add svg {
  width: 20px;
  height: 20px;
}

@media (max-width: 480px) {
  .modal-content {
    max-width: 100%;
    max-height: calc(100vh - 32px);
  }

  .modal-header {
    padding: 16px 16px 8px;
  }

  .pizza-name {
    font-size: 20px;
  }

  .section {
    padding: 16px;
  }

  .size-buttons {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  }

  .modal-actions {
    padding: 12px 16px 16px;
    gap: 8px;
  }
}
</style>
