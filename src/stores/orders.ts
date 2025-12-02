import { defineStore } from 'pinia'
import { ref } from 'vue'

const API_BASE = '/api'

export interface OrderItem {
  itemId: number
  foodTitle: string
  priceLabel: string
  price: number
  quantity: number
  extras?: { title?: string; price: number; quantity: number }[]
}

export interface DeliveryInfo {
  name: string
  email: string
  phone: string
  address?: string
  city?: string
  zip?: string
  note?: string
}

export interface Order {
  id: string
  items: OrderItem[]
  deliveryType: 'pickup' | 'delivery'
  deliveryInfo: DeliveryInfo
  totalPrice: number
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
  paymentStatus: 'pending' | 'paid' | 'failed'
  paymentMethod?: 'barion' | 'cash'
  barionPaymentId?: string
  createdAt: string
  updatedAt: string
}

export const useOrdersStore = defineStore('orders', () => {
  const orders = ref<Order[]>([])
  const currentOrder = ref<Order | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Create new order
  const createOrder = async (orderData: {
    items: OrderItem[]
    deliveryType: 'pickup' | 'delivery'
    deliveryInfo: DeliveryInfo
    totalPrice: number
    paymentMethod: 'barion' | 'cash'
    status?: string
  }): Promise<Order | null> => {
    loading.value = true
    error.value = null
    try {
      const response = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })
      const responseText = await response.text()
      let parsed: unknown = null
      try { parsed = responseText ? JSON.parse(responseText) : null } catch { /* not JSON */ }
      if (!response.ok) {
        const p = parsed as Record<string, unknown> | null
        const serverMsg = (p && (p.error || p.details)) ? String(p.error ?? p.details) : response.statusText || 'Failed to create order'
        throw new Error(serverMsg)
      }
  const newOrderUnknown = (parsed as unknown) || (responseText ? JSON.parse(responseText) : null)
  const newOrder = newOrderUnknown as Order
  currentOrder.value = newOrder
  return newOrder
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
      console.error('Error creating order:', e)
      return null
    } finally {
      loading.value = false
    }
  }

  // Fetch all orders (admin)
  const fetchOrders = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await fetch(`${API_BASE}/orders`)
      if (!response.ok) throw new Error('Failed to fetch orders')
      orders.value = await response.json()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
      console.error('Error fetching orders:', e)
    } finally {
      loading.value = false
    }
  }

  // Get order by ID
  const getOrder = async (orderId: string): Promise<Order | null> => {
    loading.value = true
    error.value = null
    try {
      const response = await fetch(`${API_BASE}/orders/${orderId}`)
      if (!response.ok) throw new Error('Failed to fetch order')
      const order = await response.json()
      return order
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
      console.error('Error fetching order:', e)
      return null
    } finally {
      loading.value = false
    }
  }

  // Update order status
  const updateOrderStatus = async (
    orderId: string,
    status?: Order['status'],
    paymentStatus?: Order['paymentStatus']
  ) => {
    loading.value = true
    error.value = null
    try {
      const response = await fetch(`${API_BASE}/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, paymentStatus })
      })
      if (!response.ok) throw new Error('Failed to update order')
      const updatedOrder = await response.json()

      // Update in local array if exists
      const index = orders.value.findIndex(o => o.id === orderId)
      if (index > -1) {
        orders.value[index] = updatedOrder
      }

      return updatedOrder
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
      console.error('Error updating order:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    orders,
    currentOrder,
    loading,
    error,
    createOrder,
    fetchOrders,
    getOrder,
    updateOrderStatus
  }
})
