import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'

type WorkflowResponse = {
  workflowId: string
  description: string
  steps: Step[]
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
