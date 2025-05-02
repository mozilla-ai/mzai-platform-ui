// stores/auth.ts
import { defineStore } from 'pinia'

interface User {
  id: number
  email: string
  name: string
  // Add more fields as needed
}

interface Credentials {
  email: string
  password: string
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') as string | undefined,
    user: undefined as User | undefined,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
  },
  actions: {
    async login(credentials: Credentials): Promise<void | User> {
      const res = await fetch('http://localhost:8000/api/v1/api/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      })

      if (!res.ok) throw new Error('Login failed')
      const { access, refresh } = await res.json()
      this.token = access
      localStorage.setItem('token', access)

      // await this.fetchUser()
    },

    logout(): void {
      this.token = undefined
      this.user = undefined
      localStorage.removeItem('token')
    },

    // async fetchUser(): Promise<User | void> {
    //   if (!this.token) return

    //   const res = await fetch('/api/me', {
    //     headers: {
    //       Authorization: `Bearer ${this.token}`,
    //     },
    //   })

    //   if (res.ok) {
    //     this.user = await res.json()
    //     return this.user
    //   } else {
    //     this.logout()
    //   }
    // },
  },
})
