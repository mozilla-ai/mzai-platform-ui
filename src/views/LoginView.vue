<template>
  <form @submit.prevent="handleLogin" class="login-form">
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
  } catch {
    alert('Login failed')
  }
}
</script>

<style scoped>
.login-form {
  display: flex;
  flex-direction: column;
  width: 300px;
  margin: auto;
}
.login-form input {
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.login-form button {
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.login-form button:hover {
  background-color: #0056b3;
}
</style>
