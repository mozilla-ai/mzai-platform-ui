<template>
  <div class="home">
    <h3>What do you want to build?</h3>
    <textarea
      v-model="prompt"
      placeholder="Type your text here..."
      rows="10"
      cols="70"
      class="text-area"
    ></textarea>
    <div class="button-container">
      <button @click="compose">Compose</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/helpers/api'

const router = useRouter()
const prompt = ref('generate a kubeflow pipeline that converts document to podcast')
const compose = () => {
  if (!prompt.value) {
    alert('Please enter a prompt')
    return
  }
  // Call the API to get the workflow
  api
    .post('/workflows/generate/', { name: 'test', prompt: prompt.value })
    .then((response) => {
      // Handle the response and navigate to the workflow details page
      const workflowId = response.data.workflowId
      router.push({ name: 'WorkflowDetails', params: { workflowId } })
    })
    .catch((error) => {
      console.error('Error fetching workflow:', error)
      alert(error.response?.data ? JSON.stringify(error.response.data) : error.message)
    })
}
</script>
<style scoped>
.text-area {
  width: 100%;
  height: 200px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.button-container {
  display: flex;
  justify-content: center;
}
.button-container button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.button-container button:hover {
  background-color: #0056b3;
}
</style>
