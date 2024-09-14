console.log('background is running')

const garminWorkoutExample = {
  name: 'Example Workout',
  type: 'running',
  steps: [
    {
      stepName: 'Warm Up',
      stepDescription: 'Warm up for 10 minutes',
      stepDuration: 600,
      stepType: 'warmup',
    },
    {
      stepName: 'Run',
      stepDescription: 'Run for 30 minutes',
      stepDuration: 1800,
      stepType: 'interval',
    },
    {
      stepName: 'Cool Down',
      stepDescription: 'Cool down for 10 minutes',
      stepDuration: 600,
      stepType: 'cooldown',
    },
  ],
}

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.type === 'GENERATE') {
    sendResponse({ type: 'GENERATE', workout: garminWorkoutExample })
  }
})
