console.log('background is running')

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'COUNT') {
    console.log('background has received a message from popup, and count is ', request?.count)
  }
  if (request.type === 'generate') {
    console.log(request)
    // send response to content script
    sendResponse({ type: 'generate', data: request.data })
  }
})
