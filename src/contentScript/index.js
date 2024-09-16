import { requestWorkout } from '../lib/actions'
import { EVENTS } from '../lib/constants'
import { initGenerateWithAIButton } from '../lib/elements'
import './elements.css'

export function waitPageLoaded() {
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

document.addEventListener(EVENTS.indexPageReady, () => initGenerateWithAIButton())
document.addEventListener(EVENTS.newPromptFired, (event) => requestWorkout(event.detail))

waitPageLoaded()
