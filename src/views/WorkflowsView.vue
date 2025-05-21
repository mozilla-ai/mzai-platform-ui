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
    <ul class="workflows-list">
      <li v-for="workflow in workflowsQuery.data.value" :key="workflow.id">
        <RouterLink :to="{ name: 'WorkflowDetails', params: { workflowId: workflow.id } }">
          <div class="workflow">
            <h2>{{ workflow.name }}</h2>
            <p>id: {{ workflow.id }}</p>
            <em>Status: {{ workflow.status }}</em>
            <p>prompt: {{ workflow.prompt }}</p>
            <p>Created at: {{ new Date(workflow.created_at).toLocaleString() }}</p>
            <p>Updated at: {{ new Date(workflow.updated_at).toLocaleString() }}</p>
            <p>Webhook UUID: {{ workflow.webhook_uuid }}</p>
            <p>YAML S3 Key: {{ workflow.yaml_s3_key }}</p>
          </div>
        </RouterLink>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { api } from '@/helpers/api'
import { useQuery } from '@tanstack/vue-query'
import { RouterLink } from 'vue-router'

type Workflow = {
  created_at: string
  id: string
  name: string
  status: string
  updated_at: string
  webhook_uuid: string
  yaml_s3_key: string
  prompt: string
}

const workflowsQuery = useQuery<Workflow[]>({
  queryKey: ['workflows'],
  queryFn: () => {
    return api.get('/workflows').then((response) => {
      return response.data
    })
  },
  select: (data: Workflow[]) => {
    return data.sort((a: Workflow, b: Workflow) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
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

.workflows-list {
  list-style-type: none;
  padding: 0;
  gap: 1rem;
  display: flex;
  flex-direction: column;
}

.workflow {
  border: 1px solid #8ca6d5;
  border-radius: 0.5rem;
  color: #7f8ec6;
  padding: 1rem;
  display: flex;
  flex-direction: column;
}

.workflow:hover {
  background-color: #475fb3;
  color: white;
}
</style>
