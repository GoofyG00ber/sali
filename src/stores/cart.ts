import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Food } from './foods'

export interface CartItem {
  food: Food
  selectedPrice: {
    label: string
    price: number
  }
  quantity: number
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])

  // Load cart from sessionStorage on init
  const loadCart = () => {
    const saved = sessionStorage.getItem('cart')
    if (saved) {
      try {
        const parsed: unknown = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          // migrate legacy entries that might miss selectedPrice
          items.value = parsed
            .map((rawEntry) => {
              const raw = rawEntry as {
                food?: Partial<Food> & { id?: number }
                selectedPrice?: { label?: unknown; price?: unknown }
                quantity?: unknown
              }
              const food = raw.food
              const selected = raw.selectedPrice
              if (!food || typeof food.id !== 'number') return null
              if (!selected || typeof selected.label !== 'string' || typeof selected.price !== 'number') {
                return null
              }
              const qty = typeof raw.quantity === 'number' && raw.quantity > 0 ? raw.quantity : 1
              return {
                food: food as Food,
                selectedPrice: { label: selected.label, price: selected.price },
                quantity: qty
              } satisfies CartItem
            })
            .filter((x): x is CartItem => x !== null)
        } else {
          items.value = []
        }
      } catch (e) {
        console.error('Failed to load cart:', e)
        items.value = []
      }
    }
  }

  // Save cart to sessionStorage
  const saveCart = () => {
    sessionStorage.setItem('cart', JSON.stringify(items.value))
  }

  // Add item to cart
  const addItem = (food: Food, selectedPrice: { label: string; price: number }, quantity = 1) => {
    const existingIndex = items.value.findIndex(
      item => item.food.id === food.id && item.selectedPrice.label === selectedPrice.label
    )

    if (existingIndex > -1 && items.value[existingIndex]) {
      items.value[existingIndex].quantity += quantity
    } else {
      items.value.push({
        food,
        selectedPrice,
        quantity
      })
    }

    saveCart()
  }

  // Remove item from cart
  const removeItem = (foodId: number, priceLabel: string) => {
    items.value = items.value.filter(
      item => !(item.food.id === foodId && item.selectedPrice.label === priceLabel)
    )
    saveCart()
  }

  // Update item quantity
  const updateQuantity = (foodId: number, priceLabel: string, quantity: number) => {
    const item = items.value.find(
      item => item.food.id === foodId && item.selectedPrice.label === priceLabel
    )

    if (item) {
      if (quantity <= 0) {
        removeItem(foodId, priceLabel)
      } else {
        item.quantity = quantity
        saveCart()
      }
    }
  }

  // Clear cart
  const clearCart = () => {
    items.value = []
    sessionStorage.removeItem('cart')
  }

  // Computed properties
  const itemCount = computed(() => {
    return items.value.reduce((total, item) => total + item.quantity, 0)
  })

  const totalPrice = computed(() => {
    return items.value.reduce((total, item) => {
      return total + item.selectedPrice.price * item.quantity
    }, 0)
  })

  const isEmpty = computed(() => items.value.length === 0)

  // Initialize cart from sessionStorage
  loadCart()

  return {
    items,
    itemCount,
    totalPrice,
    isEmpty,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    loadCart
  }
})
