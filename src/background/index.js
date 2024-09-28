import { RUNTIME_MESSAGES } from '../lib/constants.js'
import { generateWorkout } from '../lib/openai.js'

function getOpenAISettings() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['openaiApiKey', 'openaiModel'], (result) => {
      if (result.openaiApiKey && result.openaiModel) {
        resolve({
          apiKey: result.openaiApiKey,
          model: result.openaiModel,
        })
      } else {
        reject(new Error('API Key or Model not found'))
      }
    })
  })
}

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.type === RUNTIME_MESSAGES.generateWorkout) {
    console.log('Generating workout...')
    getOpenAISettings()
      .then(({ apiKey, model }) => generateWorkout(apiKey, model, request.prompt))
      .then((workout) => sendResponse({ type: RUNTIME_MESSAGES.generateWorkout, workout }))
      .catch((error) => sendResponse({ type: RUNTIME_MESSAGES.error, error: error.message }))
    return true
  }
  console.error('Unknown message type:', request.type)
})
