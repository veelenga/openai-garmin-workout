const selectors = {
  addStepButton: '[type=button][aria-label="Add a Step"]',
  deleteStepButton: '[type=button][aria-label="Delete Step"]',
  generateButton: '[type=button][aria-label="Generate with AI"]',

  popupDeleteButton: '[type=button][aria-label="Delete"]',
}

const events = {
  addStepButtonReady: 'GarminAddStepButtonReady',
  newPromptFired: 'GarminNewPromptAdded',
  deleteStepPopupFired: 'GarminDeleteStepPopupFired',
}

document.addEventListener(events.addStepButtonReady, () => {
  addGenerateButton()
})

document.addEventListener(events.newPromptFired, (event) => {
  const generateButton = document.querySelector(selectors.generateButton)
  generateButton.disabled = true

  chrome.runtime.sendMessage({ type: 'generate', prompt: event.detail }, (response) => {
    deleteSteps()
    generateButton.disabled = false
  })
})

document.addEventListener(events.deleteStepPopupFired, ({ detail: { target } }) => {
  target.click()
  debugger
  deleteSteps()
})

function deleteSteps() {
  const deleteStepButtons = document.querySelectorAll(selectors.deleteStepButton)
  deleteStepButtons.forEach((button) => {
    button.click()
  })
}

function addGenerateButton(text = 'Generate with AI') {
  const addStepButton = document.querySelector(selectors.addStepButton)
  if (!addStepButton) {
    return
  }

  if (document.querySelector(selectors.generateButton)) {
    return
  }

  const newButton = addStepButton.cloneNode(true)
  newButton.addEventListener('click', () => {
    const result = prompt('Describe your workout:', '10m warmup, 5x(5m 300wt, 5m 120w)')
    if (result) {
      document.dispatchEvent(new Event(events.newPromptFired, { detail: result }))
    }
  })
  newButton.style.backgroundColor = 'green'
  newButton.textContent = text
  newButton.ariaLabel = text
  addStepButton.parentElement.appendChild(newButton)
}

function waitPageLoaded() {
  let MutationObserver = window.MutationObserver || window.WebKitMutationObserver

  let observer = new MutationObserver(function (mutations) {
    if (document.getElementsByClassName('content page workoutPage').length === 0) {
      return
    }

    // const mutation = mutations.find((mutation) => mutation.target.matches(selectors.addStepButton))

    // if (mutation) {
    //   document.dispatchEvent(new Event(events.addStepButtonReady))
    // }
    mutations.forEach((mutation) => {
      if (mutation.target.matches(selectors.addStepButton)) {
        document.dispatchEvent(new Event(events.addStepButtonReady))
      }

      console.log(mutation)
      if (mutation.target.matches(selectors.popupDeleteButton)) {
        document.dispatchEvent(
          new CustomEvent(events.deleteStepPopupFired, { detail: { target: mutation.target } }),
        )
      }
    })
  })

  observer.observe(document.getElementsByTagName('body')[0], {
    subtree: true,
    childList: true,
  })
}

waitPageLoaded()
