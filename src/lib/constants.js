export const EVENTS = {
  indexPageReady: 'GarminWorkoutIndexPageReady',
  newPromptFired: 'NewPromptFired',
}

export const RUNTIME_MESSAGES = {
  generateWorkout: 'GenerateWorkout',
  noAPIKey: 'NoAPIKey',
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
    examplePrompt: '.ogw-example-item',
  },
}

class MissingOpenAISettingsError extends Error {
  constructor(message = 'API Key or model not found') {
    super(message)
    this.name = 'MissingOpenAISettings'
  }
}

class WorkoutGenerationError extends Error {
  constructor(message = 'Workout generation failed') {
    super(message)
    this.name = 'WorkoutGenerationError'
  }
}

export const ERRORS = {
  MissingOpenAISettingsError,
  WorkoutGenerationError,
}
