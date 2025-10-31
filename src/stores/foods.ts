import { defineStore } from 'pinia'
import { ref } from 'vue'

const API_BASE = 'http://localhost:3001/api'

export interface FoodPrice {
  label: string
  price: number
}

export interface Food {
  id: number
  title: string
  description: string
  prices: FoodPrice[]
  badges?: string[]
  image: string
  active?: boolean
  categoryId?: number
  categoryTitle?: string
}

export interface Category {
  id: number
  title: string
  image: string
}

export const useFoodsStore = defineStore('foods', () => {
  const foods = ref<Food[]>([])
  const categories = ref<Category[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Fetch all foods
  const fetchFoods = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await fetch(`${API_BASE}/foods`)
      if (!response.ok) throw new Error('Failed to fetch foods')
      foods.value = await response.json()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
      console.error('Error fetching foods:', e)
    } finally {
      loading.value = false
    }
  }

  // Fetch all categories
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE}/categories`)
      if (!response.ok) throw new Error('Failed to fetch categories')
      categories.value = await response.json()
    } catch (e) {
      console.error('Error fetching categories:', e)
    }
  }

  // Create new food
  const createFood = async (foodData: Partial<Food>) => {
    loading.value = true
    error.value = null
    try {
      const response = await fetch(`${API_BASE}/foods`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(foodData)
      })
      if (!response.ok) throw new Error('Failed to create food')
      const newFood = await response.json()
      await fetchFoods() // Refresh the list
      return newFood
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
      console.error('Error creating food:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  // Update food
  const updateFood = async (id: number, foodData: Partial<Food>) => {
    loading.value = true
    error.value = null
    try {
      const response = await fetch(`${API_BASE}/foods/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(foodData)
      })
      if (!response.ok) throw new Error('Failed to update food')
      const updatedFood = await response.json()
      await fetchFoods() // Refresh the list
      return updatedFood
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
      console.error('Error updating food:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  // Delete food
  const deleteFood = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      const response = await fetch(`${API_BASE}/foods/${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete food')
      await fetchFoods() // Refresh the list
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
      console.error('Error deleting food:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  // Toggle active status
  const toggleActive = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      const response = await fetch(`${API_BASE}/foods/${id}/toggle-active`, {
        method: 'PATCH'
      })
      if (!response.ok) throw new Error('Failed to toggle food status')
      await fetchFoods() // Refresh the list
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
      console.error('Error toggling food status:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  // Get food by ID
  const getFoodById = (id: number): Food | undefined => {
    return foods.value.find(food => food.id === id)
  }

  return {
    foods,
    categories,
    loading,
    error,
    fetchFoods,
    fetchCategories,
    createFood,
    updateFood,
    deleteFood,
    toggleActive,
    getFoodById
  }
})
