import { EVENTS, SELECTORS } from './constants'
/**
 * Initializes the Generate with AI button and modal.
 * @param {string} text - The text to display on the button.
 */
export function initGenerateWithAIButton(text = 'Generate with AI') {
  const createWorkoutButton = document.querySelector(SELECTORS.garminConnect.createWorkoutButton)
  if (!createWorkoutButton || document.querySelector(SELECTORS.plugin.generateWithAIButton)) {
    return
  }

  createModal()
  const newButton = createButton(createWorkoutButton, text)
  setupEventListeners(newButton)
}

/**
 * Creates and appends the modal HTML to the document.
 */
function createModal() {
  const { plugin } = SELECTORS
  const modalHTML = `
    <div id="${plugin.modal.slice(1)}" class="ggw-workout-modal">
      <div class="ggw-workout-modal-content">
        <h2>Generate Workout with AI</h2>
        <textarea id="${plugin.workoutPrompt.slice(1)}" placeholder="Describe your workout..."></textarea>
        <button id="${plugin.submitPrompt.slice(1)}" class="ggw-btn ggw-btn-primary">Generate Workout</button>
        <div class="ggw-example-prompts">
          <h3>Example Prompts:</h3>
          <div class="${plugin.examplePrompt.slice(1)}" data-icon="🏊">1500m swim with 5x100m sprints every 400m</div>
          <div class="${plugin.examplePrompt.slice(1)}" data-icon="🚴">10 min warmup, 3x(20min at 280wt, 10min at 180wt)</div>
          <div class="${plugin.examplePrompt.slice(1)}" data-icon="🏃">1 hour pace 6:00, 1 hour pace 5:00, 30 min pace 4:00</div>
        </div>
      </div>
    </div>
  `
  document.body.insertAdjacentHTML('beforeend', modalHTML)
}

/**
 * Creates the new button based on the existing create workout button.
 * @param {HTMLElement} createWorkoutButton - The existing create workout button.
 * @param {string} text - The text to display on the new button.
 * @returns {HTMLElement} The newly created button.
 */
function createButton(createWorkoutButton, text) {
  const newButton = createWorkoutButton.cloneNode(true)
  newButton.setAttribute('id', SELECTORS.plugin.generateWithAIButton.slice(1))
  newButton.setAttribute('class', 'btn btn-form')
  newButton.setAttribute('aria-label', text)
  newButton.removeAttribute('disabled')
  newButton.textContent = text
  newButton.style.backgroundColor = 'green'
  createWorkoutButton.parentElement.appendChild(newButton)
  return newButton
}

/**
 * Sets up all event listeners for the modal and buttons.
 * @param {HTMLElement} newButton - The newly created button.
 */
function setupEventListeners(newButton) {
  const { plugin } = SELECTORS
  const modal = document.getElementById(plugin.modal.slice(1))
  const submitButton = document.getElementById(plugin.submitPrompt.slice(1))
  const textArea = document.getElementById(plugin.workoutPrompt.slice(1))
  const examplePrompts = document.querySelectorAll(plugin.examplePrompt)

  newButton.addEventListener('click', (event) => {
    event.preventDefault()
    modal.style.display = 'block'
  })

  submitButton.addEventListener('click', () => handleSubmit(modal, textArea))

  examplePrompts.forEach((prompt) => {
    prompt.addEventListener('click', () => {
      textArea.value = prompt.textContent
    })
  })

  window.addEventListener('click', (event) => {
    if (event.target === modal) {
      modal.style.display = 'none'
    }
  })
}

/**
 * Handles the submit action when generating a workout.
 * @param {HTMLElement} modal - The modal element.
 * @param {HTMLTextAreaElement} textArea - The textarea containing the workout prompt.
 */
function handleSubmit(modal, textArea) {
  const result = textArea.value.trim()
  if (result) {
    document.dispatchEvent(new CustomEvent(EVENTS.newPromptFired, { detail: result }))
    modal.style.display = 'none'
    textArea.value = ''
  }
}
