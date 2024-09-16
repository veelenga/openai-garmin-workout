import './index.css'
import { createWorkout, goToWorkout } from '../lib/garmin.js'

const selectors = {
  generateWithAIButton: 'button#create-workout-with-ai',
  createWorkoutButton: 'button.create-workout',
}

const events = {
  indexPageReady: 'GarminWorkoutIndexPageReady',
  newPromptFired: 'NewPromptFired',
}

document.addEventListener(events.indexPageReady, () => {
  addGenerateButton()
})

function setLoading(button, isLoading) {
  if (isLoading) {
    button.setAttribute('disabled', true)
    if (!button.querySelector('.btn-spinner')) {
      const spinner = document.createElement('span')
      spinner.classList.add('btn-spinner')
      button.appendChild(spinner)
    }
  } else {
    button.removeAttribute('disabled')
    const spinner = button.querySelector('.btn-spinner')
    if (spinner) spinner.remove()
  }
}

document.addEventListener(events.newPromptFired, (event) => {
  const generateButton = document.querySelector(selectors.generateWithAIButton)
  setLoading(generateButton, true)

  chrome.runtime.sendMessage({ type: 'GENERATE', prompt: event.detail }, async (response) => {
    if (response && response.type === 'GENERATE') {
      return createWorkout(response.workout, (response) => {
        console.log('Workout created:', response.workoutId)
        goToWorkout(response.workoutId)
      }).finally(() => setLoading(generateButton, false))
    }
    if (response && response.type === 'ERROR') {
      alert(response.message)
      setLoading(generateButton, false)
    }
  })
})

function addGenerateButton(text = 'Generate with AI') {
  const createWorkoutButton = document.querySelector(selectors.createWorkoutButton)
  if (!createWorkoutButton) {
    return
  }

  if (document.querySelector(selectors.generateWithAIButton)) {
    return
  }

  const newButton = createWorkoutButton.cloneNode(true)
  newButton.addEventListener('click', (event) => {
    event.preventDefault()
    const result = prompt('Describe your workout:', '10m warmup, 5x(5m 300wt, 5m 120w)')
    if (result) {
      document.dispatchEvent(new CustomEvent(events.newPromptFired, { detail: result }))
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

function waitPageLoaded() {
  let MutationObserver = window.MutationObserver || window.WebKitMutationObserver

  let observer = new MutationObserver(function (mutations) {
    var evtName = null
    var evt = null
    let mutation = mutations.pop()
    let target = mutation.target
    let isWorkoutIndexPage =
      target.classList.contains('body-workouts-index') &&
      mutation.oldValue.indexOf('body-workouts-index') !== -1

    if (isWorkoutIndexPage) {
      evtName = events.indexPageReady
      console.debug('====> Workout index page is ready')
    }

    if (evtName) {
      evt = new Event(evtName)
      document.dispatchEvent(evt)
    }
  })

  observer.observe(document.getElementsByTagName('body')[0], {
    subtree: false,
    attributes: true,
    attributeOldValue: true,
    attributeFilter: ['class'],
  })
}

waitPageLoaded()
