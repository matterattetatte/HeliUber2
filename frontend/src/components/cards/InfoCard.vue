<template>
  <div class="bg-white rounded-lg shadow-md p-4 flex flex-col justify-between">
    <div>
      <h2 class="text-sm font-semibold text-gray-600">{{ title }}</h2>
      <p class="text-lg font-medium text-gray-800">{{ label }}</p>
      <p v-if="sub" class="text-gray-500">{{ sub }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string
  label: string
  sub?: string
}>()
</script>
