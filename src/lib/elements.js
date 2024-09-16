import { EVENTS, SELECTORS } from './constants'

export function initGenerateWithAIButton(text = 'Generate with AI') {
  const createWorkoutButton = document.querySelector(SELECTORS.garminConnect.createWorkoutButton)
  if (!createWorkoutButton) {
    return
  }

  if (document.querySelector(SELECTORS.plugin.generateWithAIButton)) {
    return
  }

  const newButton = createWorkoutButton.cloneNode(true)
  newButton.addEventListener('click', (event) => {
    event.preventDefault()
    const result = prompt('Describe your workout:', '10m warmup, 5x(5m 300wt, 5m 120w)')
    if (result) {
      document.dispatchEvent(new CustomEvent(EVENTS.newPromptFired, { detail: result }))
    }
  })
  newButton.setAttribute('id', 'create-workout-with-ai')
  newButton.setAttribute('class', 'btn btn-form')
  newButton.setAttribute('aria-label', text)
  newButton.removeAttribute('disabled')
  newButton.textContent = text
  newButton.style.backgroundColor = 'green'
  createWorkoutButton.parentElement.appendChild(newButton)
}
