<template>
  <div class="flow-container">
    {{ prompt }}
    <VueFlow
      :nodes="nodes"
      :edges="edges"
      fit-view
      @init="onFlowInit"
      v-if="nodes.length && edges.length"
    >
      <Background />
      <Controls />
      <MiniMap />
    </VueFlow>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useVueFlow, VueFlow } from '@vue-flow/core'
import { Background, MiniMap, Controls } from '@vue-flow/additional-components'
import pipelineData from '../helpers/sample-response.json'

// Define props
defineProps<{
  prompt: string
}>()

// Destructure fitView and onFlowInit from useVueFlow
const { fitView } = useVueFlow()

const steps = pipelineData.steps

// Computed nodes and edges
const nodes = computed(() => {
  return steps.map((step, index) => ({
    id: step.id,
    type: 'default',
    position: { x: 100, y: index * 150 },
    data: {
      label: `${step.id}: ${step.description}`,
    },
  }))
})

const edges = computed(() => {
  const connections = []
  for (let i = 0; i < steps.length - 1; i++) {
    connections.push({
      id: `e-${steps[i].id}-${steps[i + 1].id}`,
      source: steps[i].id,
      target: steps[i + 1].id,
    })
  }
  return connections
})

// Trigger fitView when VueFlow is initialized
const onFlowInit = () => {
  fitView({ padding: 0.2 })
}
</script>

<style>
/* Required core styles */
@import '@vue-flow/core/dist/style.css';

/* Optional default theme */
@import '@vue-flow/core/dist/theme-default.css';
</style>

<style scoped>
.flow-container {
  height: 100vh;
  width: 100%;
  background-color: #f5f5f5;
}

.vue-flow__node-default {
  padding: 12px;
  border: 1px solid #ccc;
  background-color: #ffffff;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  font-family: sans-serif;
  font-size: 14px;
  max-width: 250px;
  word-wrap: break-word;
}
</style>
