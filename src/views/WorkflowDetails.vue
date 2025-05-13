<template>
  <div class="container">
    <div class="details-container">
      <form class="parameters-container" @submit="handleSubmit" name="workflow-form">
        <div v-for="parameter in parameters" :key="parameter.key" class="parameter-field">
          <label class="label" :for="parameter.key" :aria-required="parameter.required"
            >{{ parameter.key }}
            <span aria-label="required" v-if="parameter.required">* (required)</span>
          </label>
          <input
            v-if="parameter.type === 'string'"
            class="input"
            type="text"
            :id="parameter.name"
            :name="parameter.key"
            :value="parameter.default_value"
            :required="parameter.required"
            :placeholder="parameter.description"
            :autocomplete="parameter.name"
          />
        </div>
        <button type="submit" :disabled="mutation.isPending.value">
          {{ mutation.isPending.value ? 'Submitting...' : 'Submit' }}
        </button>
      </form>
      <div class="flow-container">
        <VueFlow
          v-if="nodes.length && edges.length"
          :nodes="nodes"
          :edges="edges"
          :default-viewport="{ zoom: 1.5 }"
          :min-zoom="0.2"
          :max-zoom="4"
          fit-view
          @init="onFlowInit"
        >
          <!-- <Background /> -->
          <!-- <Controls /> -->
          <!-- <MiniMap /> -->
        </VueFlow>
        <div v-else-if="workflowQuery.isLoading && !workflowQuery.data" class="loading">
          Loading workflow data...
        </div>
        <div v-else-if="workflowQuery.isError && !workflowQuery.data" class="error">
          Error loading workflow: {{ workflowQuery.error.value?.message || 'Unknown error' }}
        </div>
      </div>
    </div>
    <div class="results">
      <h2>Results</h2>
      <div class="mutation-results">
        <div v-if="mutation.isSuccess.value" class="results-content">
          <pre>{{ mutation.data.value }}</pre>
        </div>
        <div v-else-if="mutation.isError.value" class="error">
          Error: {{ mutation.error.value?.message || 'Unknown error' }}
        </div>
        <div v-else class="no-results">No results yet. Submit the form to see results.</div>
      </div>
      <div class="run-data">
        <span v-if="runQuery.isFetching.value">Loading run data...</span>
        <span v-else-if="runQuery.isError.value"
          >Error loading run data: {{ runQuery.error.value?.message }}</span
        >
        <pre v-else-if="runQuery.data.value">{{ runQuery.data.value }}</pre>
        <audio
          :src="runQuery.data.value.url"
          v-if="runQuery.data.value.status === 'Succeeded'"
          controls
          preload="metadata"
        >
          Your browser does not support the audio element.
        </audio>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useVueFlow, VueFlow } from '@vue-flow/core'
// import { MiniMap } from '@vue-flow/additional-components'
import { useQuery, useMutation } from '@tanstack/vue-query'
import { api } from '@/helpers/api'
import type { AxiosError } from 'axios'
import sampleResponse from '@/helpers/sample-response.json'
import { useWorkflowsStore } from '@/stores/workflows'

type StepInput = {
  name: string
  type: string
  required?: boolean
  default_value?: string
  description?: string
}

type Step = {
  id: string
  description: string
  inputs: StepInput[]
  image: string
}

// type WorkflowResponse = {
//   id: string
//   description: string
//   steps: Step[]
// }

// Define props
const props = defineProps<{
  workflowId: string
}>()

const runId = ref()

// Destructure fitView and onFlowInit from useVueFlow
const { fitView } = useVueFlow()
const workflowStore = useWorkflowsStore()
// Fetch workflow data with useQuery
const workflowQuery = useQuery({
  initialData: sampleResponse, // Use sample data while loading or on error
  queryKey: ['workflow', props.workflowId],
  queryFn: async () => {
    return workflowStore.workflows[props.workflowId] || sampleResponse
    // try {
    //   const response = await api.get<WorkflowResponse>(`/workflows/${props.workflowId}/`)
    //   return response.data
    // } catch (error: unknown) {
    //   // Show alert when an error occurs
    //   const err = error as AxiosError
    //   const errorMessage = err.response?.data ? JSON.stringify(err.response.data) : err.message
    //   alert(`Error fetching workflow data: ${errorMessage}`)
    //   throw error // Re-throw to let useQuery know there was an error
    // }
  },
  retry: false,
  refetchOnWindowFocus: false,
})

// Form submission mutation
const mutation = useMutation({
  mutationFn: async (formData: Record<string, string | File>) => {
    const response = await api.post(`/workflows/${props.workflowId}/run/`, formData)
    return response.data
  },
  onSuccess: (data) => {
    alert('Workflow run submitted successfully!')
    runId.value = data.id
  },
  onError: (error: AxiosError) => {
    const errorMessage = error.response?.data ? JSON.stringify(error.response.data) : error.message
    alert(`Error: ${errorMessage}`)
  },
})
const runQuery = useQuery({
  queryKey: computed(() => ['run', runId.value]), // This is reactive
  queryFn: async () => {
    if (!runId.value) throw new Error('runId is not set') // safety check

    const response = await api.get(`/workflows/${props.workflowId}/runs/${runId.value}/`)
    /*
       {
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "workflow_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "kfp_run_id": "string",
  "status": "PENDING",
  "started_at": "2025-05-13T13:07:23.575Z",
  "finished_at": "2025-05-13T13:07:23.575Z",
  "yaml_snapshot_s3_key": "string"
}
  */
    return response.data
  },
  refetchInterval: 3000, // Refetch every 3 seconds
  retry: false,
  enabled: computed(() => Boolean(runId.value)),
})

const handleSubmit = (event: Event) => {
  event.preventDefault()
  const formData = new FormData(event.target as HTMLFormElement)
  const parameters: Record<string, string | File> = Object.fromEntries(formData.entries())

  // Convert FormData to Record<string, string>
  // formData.forEach((value, key) => {
  //   // Handle only string values, ignore files
  //   if (typeof value === 'string') {
  //     parameters[key] = value
  //   }
  // })

  console.log('Submitted parameters:', parameters)

  // Use the mutation to submit the form
  mutation.mutate(parameters)
}

// Calculate parameters based on workflow data
const parameters = computed(() => {
  const steps = workflowQuery.data.value?.steps || []

  return steps.flatMap((step: Step) => {
    return step.inputs.map((input: StepInput) => ({
      ...input,
      step: step.id,
      key: `${step.id}-${input.name}`,
    }))
  })
})

// Computed nodes and edges
const nodes = computed(() => {
  const steps = workflowQuery.data.value?.steps || []

  return steps.map((step: Step, index: number) => ({
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
  const steps = workflowQuery.data.value?.steps || []
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
.container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.details-container {
  display: flex;
}
.parameters-container {
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

.loading,
.error {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  font-size: 1.2rem;
  color: #555;
}

.error {
  color: #d32f2f;
}
</style>
