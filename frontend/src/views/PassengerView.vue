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
        <button @click="clearSelection()" class="bg-red-500 text-white px-4 py-2 rounded">
          Clear Selection
        </button>
      </div>
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
const startLocation = ref(null);
const endLocation = ref(null);
const mapRef = ref(null);
let map = null;

const onMapReady = () => {
  map = mapRef.value.leafletObject;
}

const clearSelection = () => {
  startLocation.value = null;
  endLocation.value = null;
  
  // clear all markers from the map
  if (map) {
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });
  }
  console.log('Selection cleared');
  // reset the map view to the center
  map.setView(center.value, 5, {
    animate: true,
    duration: 0.5
  });
  console.log('Map view reset to center:', center.value);
};



const country = 'PL'

const handleMarkerClick = (marker, type) => {
  if (map) {
    map.setView(center.value, 5, {
      animate: true,
      duration: 0.5
    });
  }

  if (type === 'startLocation') {
    startLocation.value = marker;
    console.log('Start location selected:', startLocation.value);
    
    const startLatLng = [
      marker.latitude_deg,
      marker.longitude_deg
    ];
    const startIcon = L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/7893/7893979.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });
    L.marker(startLatLng, { icon: startIcon }).addTo(map).bindPopup(`Start: ${marker.name}`).openPopup();
  } else {
    endLocation.value = marker;
    console.log('End location selected:', endLocation.value);

    const startLatLng = [
          startLocation.value.latitude_deg,
          startLocation.value.longitude_deg
        ];
    const endLatLng = [
      marker.latitude_deg,
      marker.longitude_deg
    ];
    const polyline = L.polyline([startLatLng, endLatLng], {
      color: 'blue',
      weight: 3
    }).addTo(map);

    map.fitBounds(polyline.getBounds(), {
      padding: [50, 50],
      maxZoom: 12,
      animate: true
    });
    L.marker(startLatLng).addTo(map).bindPopup(`Start: ${startLocation.value.name}`).openPopup();
    L.marker(endLatLng).addTo(map).bindPopup(`End: ${marker.name}`).openPopup();
  }
};

onMounted(async () => {
  const resp = await fetch(new URL(`../assets/airports_${country}.json`, import.meta.url));
  locations.value = await resp.json();
});
</script>
