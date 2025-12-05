import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Food } from './foods'

export interface Extra {
  id: number
  title?: string
  quantity: number
  price: number
}

export interface CartItem {
  food: Food
  selectedPrice: {
    label: string
    price: number
  }
  quantity: number
  extras?: Extra[]
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])
  const isCartOpen = ref(false)

  // Helper to generate consistent extras key
  const getExtrasKey = (extras?: Extra[] | null): string => {
    if (!extras || extras.length === 0) return 'NO_EXTRAS'
    return extras.map(e => `${e.id}:${e.quantity}`).join('|')
  }

  // Helper to check if two extras arrays are equivalent
  const extrasEqual = (a?: Extra[] | null, b?: Extra[] | null): boolean => {
    return getExtrasKey(a) === getExtrasKey(b)
  }

  // Load cart from sessionStorage on init
  const loadCart = () => {
    const saved = sessionStorage.getItem('cart')
    if (saved) {
      try {
        const parsed: unknown = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          // migrate legacy entries that might miss selectedPrice
          items.value = parsed
            .map((rawEntry: unknown) => {
              const raw = rawEntry as {
                food?: Partial<Food> & { id?: number }
                selectedPrice?: { label?: unknown; price?: unknown }
                quantity?: unknown
                extras?: unknown
              }
              const food = raw.food
              const selected = raw.selectedPrice
              if (!food || typeof food.id !== 'number') return null
              if (!selected || typeof selected.label !== 'string' || typeof selected.price !== 'number') {
                return null
              }
              const qty = typeof raw.quantity === 'number' && raw.quantity > 0 ? raw.quantity : 1
              let extras: Extra[] | undefined
              if (Array.isArray(raw.extras)) {
                const mappedExtras: Extra[] = []
                for (const e of raw.extras) {
                  const extra = e as { id?: unknown; title?: unknown; quantity?: unknown; price?: unknown }
                  if (typeof extra.id === 'number' && typeof extra.quantity === 'number' && typeof extra.price === 'number' && extra.quantity > 0) {
                    mappedExtras.push({
                      id: extra.id,
                      title: typeof extra.title === 'string' ? extra.title : undefined,
                      quantity: extra.quantity,
                      price: extra.price
                    })
                  }
                }
                if (mappedExtras.length > 0) extras = mappedExtras
              }
              const item: CartItem = {
                food: food as Food,
                selectedPrice: { label: selected.label, price: selected.price },
                quantity: qty
              }
              if (extras) item.extras = extras
              return item
            })
            .filter((x: CartItem | null): x is CartItem => x !== null)
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
  const addItem = (food: Food, selectedPrice: { label: string; price: number }, quantity = 1, extras: Extra[] = []) => {
    // Find existing item with same pizza, price, AND extras
    let existingIndex = -1
    for (let i = 0; i < items.value.length; i++) {
      const item = items.value[i]
      if (
        item &&
        item.food.id === food.id &&
        item.selectedPrice.label === selectedPrice.label &&
        extrasEqual(item.extras, extras)
      ) {
        existingIndex = i
        break
      }
    }

    if (existingIndex > -1 && items.value[existingIndex]) {
      const existingItem = items.value[existingIndex]
      if (existingItem) {
        existingItem.quantity += quantity
      }
    } else {
      items.value.push({
        food,
        selectedPrice,
        quantity,
        extras: extras.length > 0 ? extras : undefined
      })
    }

    saveCart()
  }

  // Remove item from cart
  const removeItem = (foodId: number, priceLabel: string, extras?: Extra[]) => {
    const extrasKey = getExtrasKey(extras)
    items.value = items.value.filter(
      item => !(
        item.food.id === foodId &&
        item.selectedPrice.label === priceLabel &&
        getExtrasKey(item.extras) === extrasKey
      )
    )
    saveCart()
  }

  // Update item quantity
  const updateQuantity = (foodId: number, priceLabel: string, quantity: number, extras?: Extra[]) => {
    // Find the exact item matching food id, price, AND extras
    let foundIndex = -1
    for (let i = 0; i < items.value.length; i++) {
      const item = items.value[i]
      if (!item) continue
      if (
        item.food.id === foodId &&
        item.selectedPrice.label === priceLabel &&
        extrasEqual(item.extras, extras)
      ) {
        foundIndex = i
        break
      }
    }

    if (foundIndex > -1) {
      const foundItem = items.value[foundIndex]
      if (foundItem) {
        if (quantity <= 0) {
          // Remove only this specific item
          items.value.splice(foundIndex, 1)
        } else {
          foundItem.quantity = quantity
        }
        saveCart()
      }
    }
  }

  // Clear cart
  const clearCart = () => {
    items.value = []
    sessionStorage.removeItem('cart')
  }

  const openCart = () => {
    isCartOpen.value = true
  }

  const closeCart = () => {
    isCartOpen.value = false
  }

  const toggleCart = () => {
    isCartOpen.value = !isCartOpen.value
  }

  // Computed properties
  const itemCount = computed(() => {
    return items.value.reduce((total, item) => total + item.quantity, 0)
  })

  const totalPrice = computed(() => {
    return items.value.reduce((total, item) => {
      let itemTotal = item.selectedPrice.price * item.quantity
      if (item.extras) {
        const extrasPrice = item.extras.reduce((sum, extra) => sum + (extra.price * extra.quantity), 0)
        itemTotal += extrasPrice * item.quantity
      }
      return total + itemTotal
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
    loadCart,
    isCartOpen,
    openCart,
    closeCart,
    toggleCart
  }
})
