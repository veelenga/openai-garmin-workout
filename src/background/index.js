import { RUNTIME_MESSAGES } from '../lib/constants.js'
import { generateWorkout } from '../lib/openai.js'

async function getOpenAIKey() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get('openaiApiKey', (result) =>
      result.openaiApiKey ? resolve(result.openaiApiKey) : reject(new Error('API Key not found')),
    )
  })
}

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.type === RUNTIME_MESSAGES.generateWorkout) {
    console.log('Generating workout...')

    getOpenAIKey()
      .then((openaiApiKey) => generateWorkout(openaiApiKey, request.prompt))
      .then((workout) => sendResponse({ type: RUNTIME_MESSAGES.generateWorkout, workout }))
      .catch((error) => sendResponse({ type: RUNTIME_MESSAGES.error, error: error.message }))

    return true
  }

  console.error('Unknown message type:', request.type)
})
