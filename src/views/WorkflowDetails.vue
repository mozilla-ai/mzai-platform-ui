<template>
  <div class="details-container">
    <form class="parameters-contianer" @submit="handleSubmit">
      <div v-for="(parameter, index) in parameters" :key="index" class="parameter-field">
        <label class="label" :for="parameter.name">{{ parameter.name }}</label>
        <input
          v-if="parameter.type === 'string'"
          class="input"
          type="text"
          :id="parameter.name"
          :name="parameter.name"
          v-model="parameter.default_value"
          :required="parameter.required"
          :placeholder="parameter.description"
        />
      </div>
      <button type="submit">Submit</button>
    </form>
    <div class="flow-container">
      <VueFlow
        :nodes="nodes"
        :edges="edges"
        :default-viewport="{ zoom: 1.5 }"
        :min-zoom="0.2"
        :max-zoom="4"
        fit-view
        @init="onFlowInit"
        v-if="nodes.length && edges.length"
      >
        <!-- <Background /> -->
        <!-- <Controls position="top-left">
      <ControlButton title="Reset Transform" @click="resetTransform">
        <Icon name="reset" />
      </ControlButton>

      <ControlButton title="Shuffle Node Positions" @click="updatePos">
        <Icon name="update" />
      </ControlButton>

      <ControlButton title="Toggle Dark Mode" @click="toggleDarkMode">
        <Icon v-if="dark" name="sun" />
        <Icon v-else name="moon" />
      </ControlButton>

      <ControlButton title="Log `toObject`" @click="logToObject">
        <Icon name="log" />
      </ControlButton>
    </Controls> -->
        <MiniMap />
      </VueFlow>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useVueFlow, VueFlow } from '@vue-flow/core'
import { MiniMap } from '@vue-flow/additional-components'
import pipelineData from '../helpers/sample-response.json'

// Define props
defineProps<{
  prompt: string
}>()

// Destructure fitView and onFlowInit from useVueFlow
const { fitView } = useVueFlow()

const steps = pipelineData.steps

const handleSubmit = (event: Event) => {
  event.preventDefault()
  const formData = new FormData(event.target as HTMLFormElement)
  const parameters = Object.fromEntries(formData.entries())
  console.log('Submitted parameters:', parameters)
}

const parameters = computed(() => {
  return nodes.value.flatMap((node) => {
    return node.data.inputs
  })
})

// Computed nodes and edges
const nodes = computed(() => {
  return steps.map((step, index) => ({
    id: step.id,
    type: 'default',
    position: { x: 100, y: index * 150 },
    data: {
      label: `${step.id}: ${step.description}`,
      inputs: step.inputs,
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
.details-container {
  display: flex;
  width: 100%;
  height: 100%;
}
.parameters-contianer {
  width: 100%;
  height: 100%;
  display: flex;
  align-content: center;
  flex-direction: column;
  gap: 1rem;
  /* flex: 1; */
  /* background-color: #f5f5f5; */
}

.parameter-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.label {
  font-size: 1rem;
  font-weight: bold;
}
.input {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 100%;
}
.input:focus {
  border-color: #007bff;
  outline: none;
}
.input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}
button {
  padding: 0.5rem 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
button:hover {
  background-color: #0056b3;
}
button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.flow-container {
  width: 100%;
  height: 100%;
  /* flex: 2; */
  /* background-color: #f5f5f5; */
}
</style>
