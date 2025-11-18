<template>
  <div>
    <div v-if="!apiKey" class="h-64 w-full flex items-center justify-center bg-gray-100 rounded-lg text-gray-600 p-4">
      <div class="text-center">
        <div class="font-medium">Google Maps nincs konfigurálva</div>
        <div class="text-sm mt-2">Állítsd be a <code>VITE_GOOGLE_MAPS_API_KEY</code> környezeti változót a `.env` fájlban.</div>
      </div>
    </div>

    <div v-else id="gmap" ref="mapEl" style="height: 250px; width: 100%;" />
  </div>
</template>

<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ref, onMounted, onBeforeUnmount } from 'vue'

// Center used previously in Leaflet version
const defaultPosition = { lat: 47.67204465176636, lng: 19.534340000000004 }
const defaultZoom = 15

const apiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || ''
const mapEl = ref<HTMLElement | null>(null)
let map: any = null
let marker: any = null

function loadGoogleMaps(key: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).google && (window as any).google.maps) return resolve()

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}`
    script.async = true
    script.defer = true
    script.onload = () => {
      if ((window as any).google && (window as any).google.maps) resolve()
      else reject(new Error('Google Maps failed to load'))
    }
    script.onerror = () => reject(new Error('Failed to load Google Maps script'))
    document.head.appendChild(script)
  })
}

onMounted(async () => {
  if (!apiKey) return

  try {
    await loadGoogleMaps(apiKey)

    if (!mapEl.value) return

    map = new (window as any).google.maps.Map(mapEl.value, {
      center: defaultPosition,
      zoom: defaultZoom,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false
    })

    // use a marker roughly similar to the previous one
    marker = new (window as any).google.maps.Marker({
      position: defaultPosition,
      map,
      title: 'Cím',
    })
  } catch (err: any) {
    console.error('Google Maps init error', err)
  }
})

onBeforeUnmount(() => {
  if (marker) {
    marker.setMap(null)
    marker = null
  }
  map = null
})
</script>

<style scoped>
#gmap {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}
</style>
