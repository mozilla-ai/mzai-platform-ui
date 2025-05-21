<template>
  <form class="compose-form" @submit.prevent="compose" name="compose-form">
    <div>
      <label for="prompt">What do you want to build?</label>
      <textarea
        name="prompt"
        id="prompt"
        :aria-required="true"
        v-model="prompt"
        placeholder="Type your text here..."
        rows="10"
        cols="70"
        class="text-area"
      ></textarea>
    </div>
    <div>
      <label for="name">Give it a name</label>
      <input
        name="name"
        id="name"
        v-model="name"
        type="text"
        placeholder="Give it a name.."
        autocomplete="workflow-name"
        :aria-required="true"
      />
    </div>
    <div class="button-container">
      <button type="submit" :disabled="mutation.isPending.value">Compose</button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/helpers/api'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { AxiosError } from 'axios'
// import { useWorkflowsStore } from '@/stores/workflows'

const router = useRouter()
// const workflowStore = useWorkflowsStore()

const prompt = ref('generate a pipeline that converts document to podcast')
const name = ref('Document to Podcast test')
const mutation = useMutation({
  mutationFn: (data: { name: string; prompt: string }) => api.post('/workflows/generate/', data),
  onSuccess: (response) => {
    const workflowId = response.data.id
    // workflowStore.addWorkflow(workflowId, response.data)
    router.push({ name: 'WorkflowDetails', params: { workflowId } })
  },
  onError: (error: AxiosError) => {
    console.error('Error fetching workflow:', error)
    alert(error.response?.data ? JSON.stringify(error.response.data) : error.message)
  },
})

const queryClient = useQueryClient()
const compose = () => {
  if (!prompt.value) {
    alert('Please enter a prompt')
    return
  }
  // Call the API to get the workflow
  mutation.mutate({ name: name.value, prompt: prompt.value })
  queryClient.invalidateQueries({
    queryKey: ['workflows'],
  })
}
</script>
<style scoped>
.compose-form {
  margin: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.text-area {
  width: 100%;
  height: 200px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.button-container {
  display: flex;
  justify-content: flex-end;
}

input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>
