console.log('background is running')

// const garminWorkoutExample = {
//   name: 'Example Workout',
//   type: 'running',
//   steps: [
//     {
//       stepName: 'Warm Up',
//       stepDescription: 'Warm up for 10 minutes',
//       stepDuration: 600,
//       stepType: 'warmup',
//       target: {
//         type: 'heart rate',
//         value: [120, 140], // Target heart rate range in bpm
//         unit: 'bpm',
//       },
//     },
//     {
//       stepName: 'Run Interval',
//       stepDescription: 'Run at target pace',
//       stepDuration: 1800,
//       stepType: 'interval',
//       target: {
//         type: 'pace',
//         value: [4.5, 5.5], // Target pace range in min/km
//         unit: 'min_per_km',
//       },
//     },
//     {
//       stepName: 'Cool Down',
//       stepDescription: 'Cool down for 10 minutes',
//       stepDuration: 600,
//       stepType: 'cooldown',
//       target: {
//         type: 'no target',
//       },
//     },
//   ],
// }

// const cyclingWorkoutExample = {
//   name: 'Cycling Workout',
//   type: 'cycling',
//   steps: [
//     {
//       stepName: 'Warm Up',
//       stepDescription: 'Warm up for 15 minutes',
//       stepDuration: 900,
//       stepType: 'warmup',
//       target: {
//         type: 'power',
//         value: [100, 150], // Target power range in watts
//         unit: 'watts',
//       },
//     },
//     {
//       stepName: 'Main Interval',
//       stepDescription: 'Ride at target power',
//       stepDuration: 1800,
//       stepType: 'interval',
//       target: {
//         type: 'power',
//         value: [200, 250],
//         unit: 'watts',
//       },
//     },
//     {
//       stepName: 'Cool Down',
//       stepDescription: 'Cool down for 10 minutes',
//       stepDuration: 600,
//       stepType: 'cooldown',
//       target: {
//         type: 'no target',
//       },
//     },
//   ],
// }

const garminWorkoutWithRepeats = {
  name: 'Interval Workout with Repeats',
  type: 'running',
  steps: [
    {
      stepName: 'Warm Up',
      stepDescription: 'Warm up for 10 minutes',
      stepDuration: 600,
      stepType: 'warmup',
    },
    {
      stepType: 'repeat',
      numberOfIterations: 3,
      steps: [
        {
          stepName: 'Run Hard',
          stepDescription: 'Run hard for 5 minutes',
          stepDuration: 300,
          stepType: 'interval',
          target: {
            type: 'pace',
            value: [4, 5], // min/km
          },
        },
        {
          stepName: 'Recover',
          stepDescription: 'Recover for 2 minutes',
          stepDuration: 120,
          stepType: 'recovery',
        },
      ],
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
    sendResponse({ type: 'GENERATE', workout: garminWorkoutWithRepeats })
  }
})
