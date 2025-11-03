<template>
  <div id="map" style="height: 250px; width: 100%;"></div>
</template>

<script setup>
import { onMounted } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

onMounted(() => {
  const position = [47.67204465176636, 19.534340000000004];

  // Térkép inicializálása
  const map = L.map("map").setView(position, 15);

  // OpenStreetMap csempék
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
  }).addTo(map);

   const redIcon = L.icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

    L.marker(position, { icon: redIcon }).addTo(map);
});
</script>

<style scoped>
#map {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}
</style>
