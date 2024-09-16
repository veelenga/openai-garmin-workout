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
    generateWithAIButton: '#create-workout-with-ai',
    spinner: '.ggw-spinner',
    modal: '#ggw-workout-modal',
    workoutPrompt: '#workout-prompt',
    submitPrompt: '#submit-prompt',
    examplePrompt: '.ggw-example-prompt',
  },
}
