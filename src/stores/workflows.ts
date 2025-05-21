import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'

export type WorkflowResponse = {
  id: string
  name: string
  yaml_s3_key: string
  status: string
  webhook_uuid: string
  created_at: string
  updated_at: string
  json: {
    workflowId: string
    description: string
    steps: Step[]
  }
  runs: Run[]
}

type Run = {
  id: string
  workflow_id: string
  kfp_run_id: string
  status: string
  started_at: string
  finished_at: string
  yaml_snapshot_s3_key: string
  run_url: string
}

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

export const useWorkflowsStore = defineStore('workflows', () => {
  const workflows: Ref<{ [key: string]: WorkflowResponse }> = ref({})

  const addWorkflow = (id: string, workflow: WorkflowResponse) => {
    workflows.value[id] = workflow
  }

  return {
    workflows,
    addWorkflow,
  }
})
