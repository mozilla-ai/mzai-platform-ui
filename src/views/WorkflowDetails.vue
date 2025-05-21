<template>
  <div class="container">
    <div v-if="workflowQuery.isLoading.value && !workflowQuery.data.value" class="loading">
      Loading workflow data...
    </div>
    <div v-else-if="workflowQuery.isError.value && !workflowQuery.data.value" class="error">
      Error loading workflow: {{ workflowQuery.error.value?.message || 'Unknown error' }}
    </div>
    <div class="details-container" v-else>
      <form class="form-container" @submit="handleSubmit" name="workflow-form">
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
      </div>
    </div>
    <div class="bottom-container" v-if="workflowQuery.data.value">
      <section class="runs-container">
        <ul class="runs-list" v-if="runsQuery.data.value.length">
          <h2>runs</h2>
          <li v-for="run in runsQuery.data.value" :key="run.id" class="run" @click="runId = run.id">
            <p>id: {{ run.id }}</p>
            <p>status: {{ run.status }}</p>
            <p>started at: {{ run.started_at }}</p>
            <p>finished at: {{ run.finished_at }}</p>
            <!-- <p>kfp_run_id: {{ run.kfp_run_id }}</p>
            <p>run_url: {{ run.run_url }}</p>
            <p>yaml_snapshot_s3_key: {{ run.yaml_snapshot_s3_key }}</p> -->
            <!-- <button type="button">View</button> -->
          </li>
        </ul>
        <div v-if="runsQuery.isFetching.value">Loading runs...</div>
        <div v-else-if="runsQuery.isError.value">
          Error loading runs: {{ runsQuery.error.value?.message }}
        </div>
        <div v-else-if="!runsQuery.data.value.length">No runs found for this workflow.</div>
      </section>
      <section class="results-container" v-if="runQuery.data.value">
        <h2>Results</h2>
        <div class="mutation-results">
          <div class="no-results" v-if="!runQuery.data.value">
            No results yet. Submit the form to see results.
          </div>
        </div>
        <div class="run-data">
          <a
            v-if="runQuery.data.value?.run_url"
            :href="runQuery.data.value?.run_url"
            target="_blank"
            rel="noreferrer"
            >Run url</a
          >
          <div v-if="runQuery.isFetching.value">Loading run data...</div>
          <div v-else-if="runQuery.isError.value">
            Error loading run data: {{ runQuery.error.value?.message }}
          </div>
          <pre :key="runQuery.data.value?.id" v-else-if="runQuery.data.value">{{
            runQuery.data.value
          }}</pre>
          <audio
            :key="runQuery.data.value?.url"
            :src="runQuery.data.value?.url"
            v-if="runQuery.data.value?.status === 'Succeeded'"
            controls
            preload="metadata"
          >
            Your browser does not support the audio element.
          </audio>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useVueFlow, VueFlow } from '@vue-flow/core'
// import { MiniMap } from '@vue-flow/additional-components'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { api } from '@/helpers/api'
import type { AxiosError } from 'axios'
import type { WorkflowResponse } from '@/stores/workflows'
// import { useWorkflowsStore } from '@/stores/workflows'

type StepInput = {
  name: string
  type: string
  required?: boolean
  default_value?: string
  description?: string
}

type SomeError = {
  detail: string
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
const queryClient = useQueryClient()
// Destructure fitView and onFlowInit from useVueFlow
const { fitView } = useVueFlow()
// const workflowStore = useWorkflowsStore()
// Fetch workflow data with useQuery
const workflowQuery = useQuery({
  queryKey: ['workflows', props.workflowId],
  queryFn: async () => {
    try {
      const response = await api.get<WorkflowResponse | SomeError>(
        `/workflows/${props.workflowId}/`,
      )
      if (isErrorResponse(response.data)) {
        throw new Error(response.data.detail)
      }
      return response.data
    } catch (error: unknown) {
      // Show alert when an error occurs
      const err = error as AxiosError
      const errorMessage = err.response?.data ? JSON.stringify(err.response.data) : err.message
      alert(`Error fetching workflow data: ${errorMessage}`)
      throw error // Re-throw to let useQuery know there was an error
    }
  },
  refetchOnWindowFocus: false,
  retry: 1,
})

function isErrorResponse(response: WorkflowResponse | SomeError): response is SomeError {
  return (response as SomeError).detail !== undefined
}

// Form submission mutation
const mutation = useMutation({
  mutationFn: async (formData: Record<string, string | File>) => {
    const response = await api.post(`/workflows/${props.workflowId}/run/`, formData)
    return response.data
  },
  onSuccess: (data) => {
    alert('Workflow run submitted successfully!')
    runId.value = data.id
    // Invalidate the query to refetch the runs
  },
  onError: (error: AxiosError) => {
    const errorMessage = error.response?.data ? JSON.stringify(error.response.data) : error.message
    alert(`Error: ${errorMessage}`)
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['runs', props.workflowId] })
  },
})
const runQuery = useQuery({
  queryKey: computed(() => ['runs', runId.value]), // This is reactive
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
  refetchInterval: 5000, // Refetch every 5 seconds
  retry: false,
  enabled: computed(() => Boolean(runId.value)),
})

const runsQuery = useQuery({
  queryKey: computed(() => ['runs', props.workflowId]),
  queryFn: async () => {
    const response = await api.get(`/workflows/${props.workflowId}/runs/`)
    return response.data
  },
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
  const steps = workflowQuery.data.value?.json.steps || []

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
  const steps = workflowQuery.data.value?.json.steps || []
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
  const steps = workflowQuery.data.value?.json.steps || []
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
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  overflow-y: hidden;
  height: 100vh;
}

.details-container {
  display: flex;
  flex: 3;
  gap: 1rem;
  overflow-y: auto;
}

.bottom-container {
  display: flex;
  gap: 1rem;
  flex: 1;
  overflow-y: auto;
}

.results-container {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.runs-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
}

.runs {
  display: flex;
  flex-direction: column;
  /* gap: 1rem; */
}

.flow-container {
  flex: 1;
  /* flex: 2; */
  background-color: #e3e3e3;
}

.form-container {
  /* width: 100%;
  height: 100%; */
  display: flex;
  align-content: center;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
  /* background-color: #f5f5f5; */
}

.parameter-field {
  display: flex;
  flex-direction: column;
}

.loading,
.error {
  display: flex;
  align-items: center;
  justify-content: center;
  /* height: 100%;
  width: 100%; */
  font-size: 1.2rem;
  color: #555;
}

.error {
  color: #d32f2f;
}
</style>
