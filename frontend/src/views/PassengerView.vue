<template>
  <div class="w-full h-screen">
    <h1 class="text-lg font-bold pb-2">Select a start and end location</h1>
      <l-map :zoom="5" ref="mapRef" @ready="onMapReady" :center="center" style="height: 50%; width: 80%; margin-left: 10%;">
        <l-tile-layer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <l-marker-cluster-group v-if="!endLocation">
          <l-marker
            v-for="loc in locations"
            :key="loc.name"
            :lat-lng="[loc.latitude_deg, loc.longitude_deg]"
            @click="handleMarkerClick(loc, startLocation ? 'endLocation' : 'startLocation')"
          />
        </l-marker-cluster-group>
      </l-map>

      <div class="flex justify-between mt-4">
        <div>
          <h2 class="text-md font-semibold">Start Location:</h2>
          <p v-if="startLocation">{{ startLocation.name }} ({{ startLocation.municipality }})</p>
          <p v-else>Select a start location</p>
        </div>
        <div>
          <h2 class="text-md font-semibold">End Location:</h2>
          <p v-if="endLocation">{{ endLocation.name }} ({{ endLocation.municipality }})</p>
          <p v-else>Select an end location</p>
        </div>
        <!-- display distance and price -->
        <div>
          <h2 class="text-md font-semibold">Distance:</h2>
          <p v-if="startLocation && endLocation">{{ distanceKm }} km</p>
          <p v-else>Calculate distance after selecting locations</p>
          <h2 class="text-md font-semibold">Price:</h2>
          <p v-if="startLocation && endLocation">{{ price }} PLN</p>
          <p v-else>Calculate price after selecting locations</p>
        </div>
        <button @click="clearSelection()" class="bg-red-500 text-white px-4 py-2 rounded">
          Clear Selection
        </button>
      </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { LMap, LTileLayer, LMarker } from '@vue-leaflet/vue-leaflet';
import * as L from "leaflet";
import { spline } from 'leaflet-spline';
import { LMarkerClusterGroup  } from 'vue-leaflet-markercluster';
import markerIconUrl from "leaflet/dist/images/marker-icon.png";
import markerIconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import markerShadowUrl from "leaflet/dist/images/marker-shadow.png";


// delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIconUrl,
  iconRetinaUrl: markerIconRetinaUrl,
  shadowUrl: markerShadowUrl
});

const center = ref<L.LatLngTuple>([52.0, 19.0]); // Approximate center of Poland
const locations = ref<Location[]>([]);
const startLocation = ref<Location | null>(null);
const endLocation = ref<Location | null>(null);
const mapRef = ref<typeof LMap | null>(null);
let map: L.Map | null = null;

const onMapReady = () => {
  map = mapRef?.value?.leafletObject;
}

const clearSelection = () => {
  startLocation.value = null;
  endLocation.value = null;
  
  // clear all markers from the map
  if (map) {
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map?.removeLayer(layer);
      }
    });
  }
  console.log('Selection cleared');
  // reset the map view to the center
  map?.setView(center.value, 5, {
    animate: true,
    duration: 0.5
  });
  console.log('Map view reset to center:', center.value);
};



const country = 'PL'

const handleMarkerClick = (marker: Location, type: string) => {
  if (!map) {
    console.error('Map is not initialized');
    return;
  }

  map.setView(center.value, 5, {
    animate: true,
    duration: 0.5
  });

  if (type === 'startLocation') {
    startLocation.value = marker;
    console.log('Start location selected:', startLocation.value);
    
    const startLatLng = [
      marker.latitude_deg,
      marker.longitude_deg
    ] as L.LatLngTuple;
    const startIcon = L.icon({
      iconUrl: 'https://png.pngtree.com/png-vector/20240920/ourlarge/pngtree-helicopter-emoji-png-image_13618743.png',
      iconSize: [32, 32],
      iconAnchor: [16, 0],
      popupAnchor: [0, -32]
    });
    L.marker(startLatLng, { icon: startIcon, zIndexOffset: 1000 }).addTo(map).bindPopup(`Start: ${marker.name}`).openPopup();
  } else {
    endLocation.value = marker;
    console.log('End location selected:', endLocation.value);

    const startLatLng = [
          startLocation.value?.latitude_deg,
          startLocation.value?.longitude_deg
        ] as L.LatLngTuple;
    const endLatLng = [
      marker.latitude_deg,
      marker.longitude_deg
    ] as L.LatLngTuple;
    const midLat = (startLatLng[0] + endLatLng[0]) / 2 + 0.5; // Add offset
    const midLng = (startLatLng[1] + endLatLng[1]) / 2;

    const curveLayer = spline(
      [
        startLatLng,
        [midLat, midLng],
        [midLat, midLng + 1],
        endLatLng
      ],
      { color: 'blue', weight: 3, smoothing: 0.5 }
    ).addTo(map);
    map.fitBounds(curveLayer.getBounds(), { padding:[50,50], animate:true });
    L.marker(startLatLng).addTo(map).bindPopup(`Start: ${startLocation.value?.name}`).openPopup();
    L.marker(endLatLng).addTo(map).bindPopup(`End: ${marker.name}`).openPopup();
  }
};


const distanceKm = computed(() => {
  if (!startLocation.value || !endLocation.value) return 0;

  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371; // Earth's radius in km

  const { latitude_deg: lat1, longitude_deg: lng1 } = startLocation.value;
  const { latitude_deg: lat2, longitude_deg: lng2 } = endLocation.value;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return +(R * c).toFixed(2); // Distance in km, rounded to 2 decimals
});

const price = computed(() => {
  const ratePerKm = 5; // Example rate per km
  return +(distanceKm.value * ratePerKm).toFixed(2); // Price, rounded to 2 decimals
});


onMounted(async () => {
  const resp = await fetch(new URL(`../assets/airports_${country}.json`, import.meta.url));
  locations.value = await resp.json();
});


</script>
