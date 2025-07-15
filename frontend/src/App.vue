<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/passenger">Passenger</RouterLink>
        <RouterLink to="/pilot">Pilot</RouterLink>
      </nav>
      <RouterView />
</template>

<style scoped>

</style>
