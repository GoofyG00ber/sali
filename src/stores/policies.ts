import { defineStore } from 'pinia'
import { ref } from 'vue'

const API_BASE = 'http://localhost:3001/api'

export interface Policy {
  id: string
  title: string
  content: string
  lastUpdated: string
}

export const usePoliciesStore = defineStore('policies', () => {
  const aszf = ref<Policy | null>(null)
  const privacy = ref<Policy | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Fetch ASZF
  const fetchAszf = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await fetch(`${API_BASE}/policies/aszf`)
      if (!response.ok) throw new Error('Failed to fetch ASZF')
      aszf.value = await response.json()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
      console.error('Error fetching ASZF:', e)
    } finally {
      loading.value = false
    }
  }

  // Fetch Privacy Policy
  const fetchPrivacy = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await fetch(`${API_BASE}/policies/privacy`)
      if (!response.ok) throw new Error('Failed to fetch Privacy Policy')
      privacy.value = await response.json()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
      console.error('Error fetching Privacy Policy:', e)
    } finally {
      loading.value = false
    }
  }

  // Update ASZF
  const updateAszf = async (content: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await fetch(`${API_BASE}/policies/aszf`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      })
      if (!response.ok) throw new Error('Failed to update ASZF')
      aszf.value = await response.json()
      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
      console.error('Error updating ASZF:', e)
      return false
    } finally {
      loading.value = false
    }
  }

  // Update Privacy Policy
  const updatePrivacy = async (content: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await fetch(`${API_BASE}/policies/privacy`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      })
      if (!response.ok) throw new Error('Failed to update Privacy Policy')
      privacy.value = await response.json()
      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
      console.error('Error updating Privacy Policy:', e)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    aszf,
    privacy,
    loading,
    error,
    fetchAszf,
    fetchPrivacy,
    updateAszf,
    updatePrivacy
  }
})
