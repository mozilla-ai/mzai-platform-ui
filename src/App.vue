<template>
  <div style="width: 100%; height: 100%">
    <VueQueryDevtools />
    <button class="logout-button" v-if="authStore.isAuthenticated" type="button" @click="logout">
      Logout
    </button>
    <button
      class="back-button"
      v-if="authStore.isAuthenticated && route.name !== 'Workflows'"
      type="button"
      @click="handleBackButtonClicked"
    >
      Workflows
    </button>
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { RouterView, useRoute, useRouter } from 'vue-router'
import { VueQueryDevtools } from '@tanstack/vue-query-devtools'
import { useAuthStore } from './stores/auth'
const authStore = useAuthStore()

const logout = () => {
  authStore.logout()
}

const router = useRouter()
const route = useRoute()

const handleBackButtonClicked = () => {
  router.push({ name: 'Workflows' })
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

.logout-button {
  position: absolute;
  top: 0;
  right: 0;
}

.back-button {
  position: absolute;
  top: 0;
  left: 0;
}
</style>
