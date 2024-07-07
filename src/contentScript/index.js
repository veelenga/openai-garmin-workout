const selectors = {
  addStepButton: '[type=button][aria-label="Add a Step"]',
}

const events = {
  addStepButtonReady: 'GarminAddStepButtonReady',
}

document.addEventListener(events.addStepButtonReady, () => {
  console.log(document.querySelector(selectors.addStepButton))
})

function waitPageLoaded() {
  let MutationObserver = window.MutationObserver || window.WebKitMutationObserver

  let observer = new MutationObserver(function (mutations) {
    if (document.getElementsByClassName('content page workoutPage').length === 0) {
      return
    }

    const mutation = mutations.find((mutation) => mutation.target.matches(selectors.addStepButton))

    if (mutation) {
      document.dispatchEvent(new Event(events.addStepButtonReady))
    }
  })

  observer.observe(document.getElementsByTagName('body')[0], {
    subtree: true,
    childList: true,
  })
}

waitPageLoaded()
