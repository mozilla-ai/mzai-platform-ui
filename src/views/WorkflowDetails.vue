<template>
  <div class="details-container">
    <form class="parameters-contianer" @submit="handleSubmit" name="workflow-form">
      <div v-for="(parameter, index) in parameters" :key="index" class="parameter-field">
        <label class="label" :for="parameter.name" :aria-required="parameter.required"
          >{{ parameter.name }}
          <span aria-label="required" v-if="parameter.required">*</span>
        </label>
        <input
          v-if="parameter.type === 'string'"
          class="input"
          type="text"
          :id="parameter.name"
          :name="parameter.name"
          :value="parameter.default_value"
          :required="parameter.required"
          :placeholder="parameter.description"
          :autocomplete="parameter.name"
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
import { api } from '@/helpers/api'

// Define props
const props = defineProps<{
  workflowId: string
}>()

// Destructure fitView and onFlowInit from useVueFlow
const { fitView } = useVueFlow()

const steps = pipelineData.steps

const handleSubmit = (event: Event) => {
  event.preventDefault()
  const formData = new FormData(event.target as HTMLFormElement)
  const parameters = Object.fromEntries(formData.entries())
  console.log('Submitted parameters:', parameters)

  api
    .post(`/workflows/${props.workflowId}/run/`, parameters)
    .then((response) => {
      console.log('Parameters submitted successfully:', response.data)
      alert('Parameters submitted successfully!')
    })
    .catch((error) => {
      console.error('Error submitting parameters:', error)
      alert(error.response?.data ? JSON.stringify(error.response.data) : error.message)
    })

  // Here you can send the parameters to your API or perform any other action
  // For example:
  // await api.submitParameters(parameters)
  // alert('Parameters submitted successfully!')
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

input:invalid:focus {
  border: solid 2px red;
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
