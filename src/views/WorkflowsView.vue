<template>
  <div v-if="workflowsQuery.isLoading.value" class="loading">Loading workflows...</div>
  <div v-else-if="workflowsQuery.isError.value" class="error">
    Error loading workflows: {{ workflowsQuery.error.value?.message }}
  </div>
  <div class="workflows">
    <h1>Workflows</h1>
    <RouterLink to="compose" custom v-slot="{ navigate }">
      <button @click="navigate" type="button"><span class="icon">➕</span> Create New</button>
    </RouterLink>
    <ul>
      <li v-for="workflow in workflowsQuery.data.value" :key="workflow.id">
        <RouterLink :to="{ name: 'WorkflowDetails', params: { workflowId: workflow.id } }">
          {{ workflow.name }} - {{ workflow.id }}
        </RouterLink>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { api } from '@/helpers/api'
import { useQuery } from '@tanstack/vue-query'
import { RouterLink } from 'vue-router'

const workflowsQuery = useQuery({
  queryKey: ['workflows'],
  queryFn: () => {
    return api.get('/workflows').then((response) => {
      return response.data
    })
  },
})
</script>

<style scoped>
.workflows {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

button {
  width: 20rem;
  background-color: #5370d5;
  /* border: dashed 1px rgb(18, 102, 180); */
  color: white;
  padding: 0.5rem;
  text-align: center;
  text-decoration: none;
  display: flex;
  font-size: 1rem;
  font-weight: bold;
  border-radius: 0.5rem;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  cursor: pointer;
}

button:hover {
  background-color: #475fb3;
  color: white;
}

.icon {
  font-size: 1.2rem;
}

ul {
  list-style-type: none;
  padding: 0;
}
</style>
