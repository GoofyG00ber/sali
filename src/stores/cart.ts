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
        items.value = JSON.parse(saved)
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
