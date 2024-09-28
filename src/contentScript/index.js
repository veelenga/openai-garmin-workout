import { requestWorkout } from '../lib/actions'
import { EVENTS } from '../lib/constants'
import { initGenerateWithAIButton } from '../lib/elements'
import './elements.css'

let cleanupFunction = null
let observer = null

function setupListeners() {
  document.addEventListener(EVENTS.indexPageReady, handleIndexPageReady)
  document.addEventListener(EVENTS.newPromptFired, handleNewPromptFired)
}

function removeListeners() {
  document.removeEventListener(EVENTS.indexPageReady, handleIndexPageReady)
  document.removeEventListener(EVENTS.newPromptFired, handleNewPromptFired)
}

function handleIndexPageReady() {
  if (cleanupFunction) {
    cleanupFunction()
  }
  cleanupFunction = initGenerateWithAIButton()
}

function handleNewPromptFired(event) {
  requestWorkout(event.detail)
}

export function waitPageLoaded() {
  let MutationObserver = window.MutationObserver || window.WebKitMutationObserver
  observer = new MutationObserver(function (mutations) {
    var evtName = null
    var evt = null
    let mutation = mutations.pop()
    let target = mutation.target
    let isWorkoutIndexPage =
      target.classList.contains('body-workouts-index') &&
      mutation.oldValue.indexOf('body-workouts-index') !== -1

    if (isWorkoutIndexPage) {
      evtName = EVENTS.indexPageReady
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

function cleanup() {
  if (cleanupFunction) {
    cleanupFunction()
  }
  if (observer) {
    observer.disconnect()
  }
  removeListeners()
}

window.addEventListener('unload', cleanup)

setupListeners()
waitPageLoaded()
