import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface OpeningHour {
  id: number
  name_of_day: string
  open_time: string
  close_time: string
  is_open: boolean | number
}

export const useSettingsStore = defineStore('settings', () => {
  const openingHours = ref<OpeningHour[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchOpeningHours = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await fetch('/api/opening-hours')
      if (!response.ok) throw new Error('Failed to fetch opening hours')
      const data = await response.json()
      // Ensure boolean type for is_open and map timestamps to HH:mm
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      openingHours.value = data.map((h: any) => {
        // Helper to extract HH:mm from timestamp string
        const extractTime = (ts: string) => {
          if (!ts) return '00:00'
          const date = new Date(ts)
          // If invalid date, try to parse manually or return default
          if (isNaN(date.getTime())) return '00:00'

          // Convert to Hungary time to be safe, or just take UTC hours if stored as such
          // Assuming server sends ISO string.
          // Let's use the same logic as server: convert to Hungary time string then extract
          const hungaryTime = new Date(date.toLocaleString('en-US', { timeZone: 'Europe/Budapest' }))
          return `${hungaryTime.getHours().toString().padStart(2, '0')}:${hungaryTime.getMinutes().toString().padStart(2, '0')}`
        }

        const openTime = extractTime(h.from_time)
        const closeTime = extractTime(h.til_time)

        return {
          id: h.id,
          name_of_day: h.name_of_day,
          open_time: openTime,
          close_time: closeTime,
          is_open: openTime !== closeTime
        }
      })
    } catch (err) {
      error.value = (err as Error).message
      console.error('Error fetching opening hours:', err)
    } finally {
      loading.value = false
    }
  }

  const updateOpeningHours = async (hours: OpeningHour[]) => {
    loading.value = true
    error.value = null
    try {
      // Prepare data for server: if is_open is false, set times to 00:00
      const payload = hours.map(h => {
        if (!h.is_open) {
          return {
            ...h,
            open_time: '00:00',
            close_time: '00:00'
          }
        }
        return h
      })

      const response = await fetch('/api/opening-hours', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hours: payload })
      })
      if (!response.ok) throw new Error('Failed to update opening hours')

      // Refresh data
      await fetchOpeningHours()
      return true
    } catch (err) {
      error.value = (err as Error).message
      console.error('Error updating opening hours:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    openingHours,
    loading,
    error,
    fetchOpeningHours,
    updateOpeningHours
  }
})
