document.getElementById('save').addEventListener('click', () => {
  const apiKey = document.getElementById('apiKey').value
  if (apiKey) {
    chrome.storage.local.set({ openaiApiKey: apiKey }, () => {
      document.getElementById('status').textContent = 'API key saved!'
    })
  }
})

document.getElementById('clear').addEventListener('click', () => {
  chrome.storage.local.remove('openaiApiKey', () => {
    document.getElementById('apiKey').value = ''
    document.getElementById('status').textContent = 'API key cleared!'
  })
})

// Load the saved API key when the options page is opened
chrome.storage.local.get('openaiApiKey', (result) => {
  if (result.openaiApiKey) {
    document.getElementById('apiKey').value = result.openaiApiKey
  }
})
