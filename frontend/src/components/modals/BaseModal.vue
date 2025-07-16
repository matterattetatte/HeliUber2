<template>
  <Teleport to="body">
    <div v-if="show" class="fixed inset-0 z-[1100] flex items-center justify-center">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black opacity-50" @click="handleClose" />

      <!-- Modal panel -->
      <div
        class="bg-white rounded-lg shadow-lg z-10 w-full max-w-md p-6"
        role="dialog"
        aria-modal="true"
        @keydown.esc="handleClose"
      >
        <header class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold">{{ title }}</h2>
          <button @click="handleClose" aria-label="Close modal" class="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </header>

        <!-- Content slot -->
        <div class="mb-4">
          <slot />
        </div>

        <!-- Footer slot -->
        <footer class="text-right">
          <slot name="footer" />
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, onMounted } from 'vue'

const props = defineProps({
  show: { type: Boolean, required: true },
  title: { type: String, default: '' }
})

const emit = defineEmits(['update:show', 'close'])

function handleClose() {
  emit('update:show', false)
  emit('close')
}

// Focus trap for accessibility (optional)
onMounted(() => {
  if (props.show) {
    document.body.style.overflow = 'hidden'
  }
})
</script>

<style>
/* Add any scoped styling here */
</style>
