import './index.css'

document.addEventListener('DOMContentLoaded', function () {
  const apiKeyInput = document.getElementById('apiKey')
  const modelSelect = document.getElementById('modelSelect')
  const saveButton = document.getElementById('save')
  const clearButton = document.getElementById('clear')
  const statusMessage = document.getElementById('status')

  function checkAndHighlightApiKey() {
    chrome.storage.local.get('openaiApiKey', function (result) {
      if (!result.openaiApiKey) {
        apiKeyInput.classList.add('error')
        apiKeyInput.focus()
      } else {
        apiKeyInput.classList.remove('error')
        apiKeyInput.value = '********'
      }
    })
  }

  checkAndHighlightApiKey()

  chrome.storage.local.get('openaiModel', function (result) {
    if (result.openaiModel) {
      modelSelect.value = result.openaiModel
    }
  })

  saveButton.addEventListener('click', function () {
    const apiKey = apiKeyInput.value
    const selectedModel = modelSelect.value

    if (apiKey && apiKey !== '********') {
      chrome.storage.local.set({ openaiApiKey: apiKey, openaiModel: selectedModel }, function () {
        statusMessage.textContent = 'Settings saved!'
        apiKeyInput.classList.remove('error')
        setTimeout(() => {
          statusMessage.textContent = ''
        }, 2000)
      })
    } else {
      statusMessage.textContent = 'Please enter a valid API key.'
      apiKeyInput.classList.add('error')
      apiKeyInput.focus()
    }
  })

  clearButton.addEventListener('click', function () {
    chrome.storage.local.remove(['openaiApiKey', 'openaiModel'], function () {
      apiKeyInput.value = ''
      modelSelect.value = 'gpt-3.5-turbo'
      statusMessage.textContent = 'Settings cleared!'
      checkAndHighlightApiKey()
      setTimeout(() => {
        statusMessage.textContent = ''
      }, 2000)
    })
  })

  apiKeyInput.addEventListener('input', function () {
    apiKeyInput.classList.remove('error')
  })
})
