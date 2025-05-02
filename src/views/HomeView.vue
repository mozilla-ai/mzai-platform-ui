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

const router = useRouter()
const prompt = ref('')
const compose = () => {
  router.push({
    name: 'WorkflowDetails',
    query: {
      prompt: prompt.value,
    },
  })
}
</script>
