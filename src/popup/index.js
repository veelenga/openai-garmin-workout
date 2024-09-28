import './index.css'

document.getElementById('save').addEventListener('click', () => {
  const apiKey = document.getElementById('apiKey').value
  const selectedModel = document.getElementById('modelSelect').value
  if (apiKey) {
    chrome.storage.local.set({ openaiApiKey: apiKey, openaiModel: selectedModel }, () => {
      document.getElementById('status').textContent = 'Settings saved!'
      document.getElementById('apiKey').value = '********' // Mask the API key once it's saved
      setTimeout(() => {
        document.getElementById('status').textContent = ''
      }, 2000) // Clear the status message after 2 seconds
    })
  }
})

document.getElementById('clear').addEventListener('click', () => {
  chrome.storage.local.remove(['openaiApiKey', 'openaiModel'], () => {
    document.getElementById('apiKey').value = ''
    document.getElementById('modelSelect').value = 'gpt-4o-mini'
    document.getElementById('status').textContent = 'Settings cleared!'
    setTimeout(() => {
      document.getElementById('status').textContent = ''
    }, 2000) // Clear the status message after 2 seconds
  })
})

// Load saved settings when the popup is opened
chrome.storage.local.get(['openaiApiKey', 'openaiModel'], (result) => {
  if (result.openaiApiKey) {
    document.getElementById('apiKey').value = '********' // Display masked version
  }
  if (result.openaiModel) {
    document.getElementById('modelSelect').value = result.openaiModel
  }
})
