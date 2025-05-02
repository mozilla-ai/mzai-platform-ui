<template>
  <form @submit.prevent="handleLogin">
    <input v-model="email" placeholder="Email" />
    <input v-model="password" type="password" placeholder="Password" />
    <button type="submit">Login</button>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const email = ref<string>('')
const password = ref<string>('')
const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const handleLogin = async () => {
  try {
    await authStore.login({ email: email.value, password: password.value })
    const redirectPath = (route.query.redirect as string) || '/'
    router.push(redirectPath)
  } catch (err) {
    alert('Login failed', err)
  }
}
</script>
