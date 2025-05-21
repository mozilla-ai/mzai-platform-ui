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
      <li v-for="workflow in workflowsQuery.data.value" :key="workflow.id" class="workflow">
        <RouterLink :to="{ name: 'WorkflowDetails', params: { workflowId: workflow.id } }">
          <h2>{{ workflow.name }}</h2>
          <p>id: {{ workflow.id }}</p>
          <em>Status: {{ workflow.status }}</em>
          <p>prompt: {{ workflow.prompt }}</p>
          <p>Created at: {{ new Date(workflow.created_at).toLocaleString() }}</p>
          <p>Updated at: {{ new Date(workflow.updated_at).toLocaleString() }}</p>
          <p>Webhook UUID: {{ workflow.webhook_uuid }}</p>
          <p>YAML S3 Key: {{ workflow.yaml_s3_key }}</p>
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

.icon {
  font-size: 1.2rem;
}
</style>
