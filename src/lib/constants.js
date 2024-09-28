export const EVENTS = {
  indexPageReady: 'GarminWorkoutIndexPageReady',
  newPromptFired: 'NewPromptFired',
}

export const RUNTIME_MESSAGES = {
  generateWorkout: 'GenerateWorkout',
  error: 'Error',
}

export const SELECTORS = {
  garminConnect: {
    createWorkoutButton: 'button.create-workout',
  },
  plugin: {
    generateWithAIButton: '#ogw-create-workout',
    spinner: '.ogw-spinner',
    modal: '#ogw-modal',
    workoutPromptInput: '#ogw-modal-textarea',
    submitPromptBtn: '#ogw-modal-submit-button',
    examplePrompt: '.ogw-example-item-prompt',
  },
}
