import { createWorkout, goToWorkout } from './garmin'
import { RUNTIME_MESSAGES, SELECTORS } from './constants'

export function requestWorkout(prompt) {
  const generateButton = document.querySelector(SELECTORS.plugin.generateWithAIButton)
  setButtonLoading(generateButton, true)

  chrome.runtime.sendMessage(
    { type: RUNTIME_MESSAGES.generateWorkout, prompt },
    async (response) => {
      switch (response?.type) {
        case RUNTIME_MESSAGES.generateWorkout:
          return createWorkout(response.workout, (response) => goToWorkout(response.workoutId))
        case RUNTIME_MESSAGES.noAPIKey:
          alert("You haven't set up your OpenAI API key yet. Please do so in the extension popup.")
          break
        case RUNTIME_MESSAGES.error:
          alert(response.message)
          break
        default:
          alert('Something went wrong. Please again later')
      }
      setButtonLoading(generateButton, false)
    },
  )
}

function setButtonLoading(button, isLoading) {
  if (isLoading) {
    button.setAttribute('disabled', true)
    if (!button.querySelector(SELECTORS.plugin.spinner)) {
      const spinner = document.createElement('span')
      spinner.classList.add(SELECTORS.plugin.spinner.slice(1).replace('.', ''))
      button.appendChild(spinner)
    }
  } else {
    button.removeAttribute('disabled')
    const spinner = button.querySelector(SELECTORS.plugin.spinner)
    if (spinner) spinner.remove()
  }
}
