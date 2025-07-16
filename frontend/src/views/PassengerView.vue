<template>
  <div class="w-full h-screen">
    <h1 class="text-lg font-bold pb-2">Select a start and end location</h1>
      <LMap :zoom="5" ref="mapRef" @ready="onMapReady" :center="[center[0], center[1]]" style="height: 50%; width: 80%; margin-left: 10%;">
        <LTileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy OpenStreetMap contributors"
        />
        <LMarkerClusterGroup v-if="!endLocation">
          <LMarker
            v-for="loc in locations"
            :key="loc.name"
            :lat-lng="[loc.latitude_deg, loc.longitude_deg]"
            @click="handleMarkerClick(loc, startLocation ? 'endLocation' : 'startLocation')"
          />
        </LMarkerClusterGroup>
      </LMap>

      <div class="p-6 grid md:grid-cols-3 gap-6">
        <InfoCard
          title="Start"
          :label="startLocation ? startLocation.name : 'Select a start'"
          :sub="startLocation ? startLocation.municipality : ''"
        />
        <InfoCard
          title="End"
          :label="endLocation ? endLocation.name : 'Select an end'"
          :sub="endLocation ? endLocation.municipality : ''"
        />
        <InfoCard
          title="Summary"
          :label="startLocation && endLocation ? `${distanceKm} km` : 'Select locations'"
          :sub="startLocation && endLocation ? `${price} PLN` : ''"
        />
      <button @click="clearSelection()" class="bg-red-500 text-white px-4 py-2 rounded">
        Clear Selection
      </button>
      <button @click="showModal = true" class="bg-blue-500 text-white px-4 py-2 rounded">
        Continue to Checkout
      </button>
      </div>
      <BaseModal
        v-model:show="showModal"
        title="Checkout"
      >
        <template #default>
          <div class="space-y-4">
            <p class="text-gray-700">Start Location: {{ startLocation ? startLocation.name : 'Not selected' }}</p>
            <p class="text-gray-700">End Location: {{ endLocation ? endLocation.name : 'Not selected' }}</p>
            <p class="text-gray-700">Distance: {{ distanceKm }} km</p>
            <p class="text-gray-700">Price: {{ price }} PLN</p>
            <p class="text-gray-700">Pilot Details:</p>
            <div class="bg-gray-100 p-4 rounded" v-if="pilot">
              <p class="text-gray-600">Pilot Address: {{ pilot.address }}</p>
              <p class="text-gray-600">Pilot Name: {{ pilot.name }}</p>
              <p class="text-gray-600">License Number: {{ pilot.licenseNumber }}</p>
              <p class="text-gray-600">Rating: {{ pilot.rating }} ⭐</p>
              <p class="text-gray-600">Total Rides: {{ pilot.totalRides }}</p>
            </div>
            <div v-else class="bg-gray-100 p-4 rounded">
              Fetching pilot details...
            </div>
          </div>
        </template>
        <template #footer>
          <button @click="showModal = false" class="bg-gray-300 px-4 py-2 rounded">
            Close
          </button>
          <button @click="confirmCheckout" class="bg-blue-500 text-white px-4 py-2 rounded">
            Confirm Checkout
          </button>
        </template>
      </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { LMap, LTileLayer, LMarker } from '@vue-leaflet/vue-leaflet'
import * as L from "leaflet"
import { spline } from 'leaflet-spline'
import { LMarkerClusterGroup  } from 'vue-leaflet-markercluster'
import markerIconUrl from "leaflet/dist/images/marker-icon.png"
import markerIconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png"
import markerShadowUrl from "leaflet/dist/images/marker-shadow.png"
import InfoCard from '@/components/cards/InfoCard.vue'
import BaseModal from '@/components/modals/BaseModal.vue'
import HeliUberContract from '@/abis/HeliUber.json'
import { publicClient } from '@/clients'

L.Icon.Default.mergeOptions({
  iconUrl: markerIconUrl,
  iconRetinaUrl: markerIconRetinaUrl,
  shadowUrl: markerShadowUrl
})
const center = ref<L.LatLngTuple>([52.0, 19.0]) // Approximate center of Poland
const locations = ref<Port[]>([])
const startLocation = ref<Port | null>(null)
const endLocation = ref<Port | null>(null)
const mapRef = ref<typeof LMap | null>(null)
const pilot = ref<PilotProfile | null>(null)
const showModal = ref(false)

let map: L.Map | null = null

const onMapReady = () => {
  map = mapRef?.value?.leafletObject
}

const clearSelection = () => {
  startLocation.value = null
  endLocation.value = null
  
  // clear all markers from the map
  if (map) {
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map?.removeLayer(layer)
      }
    })
  }
  console.log('Selection cleared')
  // reset the map view to the center
  map?.setView(center.value, 5, {
    animate: true,
    duration: 0.5
  })
  console.log('Map view reset to center:', center.value)
}

const country = 'PL'

const handleMarkerClick = (marker: Port, type: string) => {
  if (!map) {
    console.error('Map is not initialized')
    return
  }

  map.setView(center.value, 5, {
    animate: true,
    duration: 0.5
  })

  if (type === 'startLocation') {
    startLocation.value = marker
    console.log('Start location selected:', startLocation.value)
    
    const startLatLng = [
      marker.latitude_deg,
      marker.longitude_deg
    ] as L.LatLngTuple
    const startIcon = L.icon({
      iconUrl: 'https://png.pngtree.com/png-vector/20240920/ourlarge/pngtree-helicopter-emoji-png-image_13618743.png',
      iconSize: [32, 32],
      iconAnchor: [16, 0],
      popupAnchor: [0, -32]
    })
    L.marker(startLatLng, { icon: startIcon, zIndexOffset: 1000 }).addTo(map).bindPopup(`Start: ${marker.name}`).openPopup()
  } else {
    endLocation.value = marker
    console.log('End location selected:', endLocation.value)

    const startLatLng = [
          startLocation.value?.latitude_deg,
          startLocation.value?.longitude_deg
        ] as L.LatLngTuple
    const endLatLng = [
      marker.latitude_deg,
      marker.longitude_deg
    ] as L.LatLngTuple
    const midLat = (startLatLng[0] + endLatLng[0]) / 2 + 0.5 // Add offset
    const midLng = (startLatLng[1] + endLatLng[1]) / 2

    const curveLayer = spline(
      [
        startLatLng,
        [midLat, midLng],
        [midLat, midLng + 1],
        endLatLng
      ],
      { color: 'blue', weight: 3, smoothing: 0.5 }
    ).addTo(map)
    map.fitBounds(curveLayer.getBounds(), { padding:[50,50], animate:true })
    L.marker(startLatLng).addTo(map).bindPopup(`Start: ${startLocation.value?.name}`).openPopup()
    L.marker(endLatLng).addTo(map).bindPopup(`End: ${marker.name}`).openPopup()
  }
}


const distanceKm = computed(() => {
  if (!startLocation.value || !endLocation.value) return 0

  const toRad = (x: number) => (x * Math.PI) / 180
  const R = 6371 // Earth's radius in km

  const { latitude_deg: lat1, longitude_deg: lng1 } = startLocation.value
  const { latitude_deg: lat2, longitude_deg: lng2 } = endLocation.value

  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return +(R * c).toFixed(2) // Distance in km, rounded to 2 decimals
})

const price = computed(() => {
  const ratePerKm = 5 // Example rate per km
  return +(distanceKm.value * ratePerKm).toFixed(2) // Price, rounded to 2 decimals
})


onMounted(async () => {
  const resp = await fetch(new URL(`../assets/airports_${country}.json`, import.meta.url))
  locations.value = await resp.json()
})

watch(showModal, async (newValue) => {
  if (newValue && startLocation.value && endLocation.value) {
    // here, I want to interact using the abis
    // start by getting all pilots
    // getPilotsList
    const pilotIds = await publicClient.readContract({
      address: import.meta.env.VITE_HELIUBER_CONTRACT_ADDRESS,
      abi: HeliUberContract.abi,
      functionName: 'getPilotsList'
    }) as string[]

    const pilotId = pilotIds[Math.floor(Math.random() * pilotIds.length)]

    console.log('Selected pilot ID:', pilotId)

    const pilotData = await publicClient.readContract({
      address: import.meta.env.VITE_HELIUBER_CONTRACT_ADDRESS,
      abi: HeliUberContract.abi,
      functionName: 'getPilotProfile',
      args: [pilotId]
    }) as PilotProfile

    pilot.value = {
      address: pilotId,
      name: pilotData.name,
      licenseNumber: pilotData.licenseNumber,
      rating: pilotData.rating,
      totalRides: pilotData.totalRides
    }    
  } else {
    pilot.value = null
  }
})


</script>
