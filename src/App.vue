<template>
  <div style="width: 100%; height: 100%;">
    <VueQueryDevtools />
    <button v-if="authStore.isAuthenticated" type="button" @click="logout">Logout</button>
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { VueQueryDevtools } from '@tanstack/vue-query-devtools'
import { useAuthStore } from './stores/auth'
const authStore = useAuthStore()

const logout = () => {
  authStore.logout()
}
</script>

<style scoped>
div {
  display: flex;
  flex-direction: column;
  /* align-items: center; */
  /* justify-content: center; */
  /* height: 100vh; */
}

button {
  position: absolute;
  top: 0;
  right: 0;
}
</style>
