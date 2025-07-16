<template>
  <div class="w-full h-screen">
    <h1 class="text-lg font-bold pb-2">Select a start location</h1>
      <l-map :zoom="6" :center="center" style="height: 50%; width: 80%; margin-left: 10%;">
        <l-tile-layer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <l-marker-cluster-group>
          <l-marker
            v-for="loc in locations"
            :key="loc.name"
            :lat-lng="[loc.latitude_deg, loc.longitude_deg]"
          />
        </l-marker-cluster-group>
      </l-map>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { LMap, LTileLayer, LMarker } from '@vue-leaflet/vue-leaflet';
import * as L from "leaflet";
import { LMarkerClusterGroup  } from 'vue-leaflet-markercluster';
import markerIconUrl from "leaflet/dist/images/marker-icon.png";
import markerIconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import markerShadowUrl from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIconUrl,
  iconRetinaUrl: markerIconRetinaUrl,
  shadowUrl: markerShadowUrl
});

const center = ref([52.0, 19.0]); // Approximate center of Poland
const locations = ref([]);

const country = 'PL'

onMounted(async () => {
  const resp = await fetch(new URL(`../assets/airports_${country}.json`, import.meta.url));
  locations.value = await resp.json();
});
</script>
