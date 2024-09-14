const addWorkoutEndpoint = 'https://connect.garmin.com/workout-service/workout'
const workoutUrl = 'https://connect.garmin.com/modern/workout/'

const sportTypeMapping = {
  running: { sportTypeId: 1, sportTypeKey: 'running', displayOrder: 1 },
  cycling: { sportTypeId: 2, sportTypeKey: 'cycling', displayOrder: 2 },
  swimming: { sportTypeId: 5, sportTypeKey: 'swimming', displayOrder: 5 },
  walking: { sportTypeId: 3, sportTypeKey: 'walking', displayOrder: 3 },
  cardio: { sportTypeId: 8, sportTypeKey: 'cardio', displayOrder: 8 },
  strength: { sportTypeId: 9, sportTypeKey: 'strength_training', displayOrder: 9 },
}

// Mapping for step types
const stepTypeMapping = {
  warmup: { stepTypeId: 1, stepTypeKey: 'warmup', displayOrder: 1 },
  cooldown: { stepTypeId: 2, stepTypeKey: 'cooldown', displayOrder: 2 },
  interval: { stepTypeId: 3, stepTypeKey: 'interval', displayOrder: 3 },
  recovery: { stepTypeId: 4, stepTypeKey: 'recovery', displayOrder: 4 },
  rest: { stepTypeId: 5, stepTypeKey: 'rest', displayOrder: 5 },
  repeat: { stepTypeId: 6, stepTypeKey: 'repeat', displayOrder: 6 },
}

const targetTypeMapping = {
  'no target': { workoutTargetTypeId: 1, workoutTargetTypeKey: 'no.target', displayOrder: 1 },
  'heart rate': {
    workoutTargetTypeId: 3,
    workoutTargetTypeKey: 'heart.rate.zone',
    displayOrder: 3,
  },
  speed: { workoutTargetTypeId: 2, workoutTargetTypeKey: 'speed.zone', displayOrder: 2 },
  cadence: { workoutTargetTypeId: 4, workoutTargetTypeKey: 'cadence.zone', displayOrder: 4 },
  power: { workoutTargetTypeId: 5, workoutTargetTypeKey: 'power.zone', displayOrder: 5 },
  pace: { workoutTargetTypeId: 6, workoutTargetTypeKey: 'pace.zone', displayOrder: 6 },
}

function makePayload(workout) {
  // Determine sportType
  const sportType = sportTypeMapping[workout.type.toLowerCase()]

  // Initialize payload
  const payload = {
    sportType: sportType,
    subSportType: null,
    workoutName: workout.name,
    estimatedDistanceUnit: {
      unitKey: null,
    },
    workoutSegments: [],
    avgTrainingSpeed: null,
    estimatedDurationInSecs: 0,
    estimatedDistanceInMeters: 0,
    estimateType: null,
  }

  // Create the workout segment
  const segment = {
    segmentOrder: 1,
    sportType: sportType,
    workoutSteps: [],
  }

  let stepOrder = 1

  // Function to process steps recursively
  function processSteps(stepsArray) {
    const steps = []

    stepsArray.forEach((step) => {
      const stepTypeKey = step.stepType.toLowerCase()

      if (stepTypeKey === 'repeat') {
        // Handle repeat steps
        const repeatStep = {
          stepId: stepOrder,
          stepOrder: stepOrder,
          stepType: stepTypeMapping['repeat'],
          numberOfIterations: step.numberOfIterations || 1,
          smartRepeat: false,
          endCondition: {
            conditionTypeId: 7,
            conditionTypeKey: 'iterations',
            displayOrder: 7,
            displayable: false,
          },
          type: 'RepeatGroupDTO',
        }

        stepOrder += 1

        // Recursively process child steps
        repeatStep.workoutSteps = processSteps(step.steps)

        steps.push(repeatStep)
      } else {
        // Handle regular steps
        const stepType = stepTypeMapping[stepTypeKey] || stepTypeMapping['interval']

        const workoutStep = {
          stepId: stepOrder,
          stepOrder: stepOrder,
          stepType: stepType,
          type: 'ExecutableStepDTO',
          endCondition: {
            conditionTypeId: 2,
            conditionTypeKey: 'time',
            displayOrder: 2,
            displayable: true,
          },
          endConditionValue: step.stepDuration, // Duration in seconds
          description: step.stepDescription || '',
          stepAudioNote: null,
        }

        // Handle targets if any
        if (step.target) {
          const targetTypeKey = step.target.type.toLowerCase()
          const targetType = targetTypeMapping[targetTypeKey] || targetTypeMapping['no target']

          workoutStep.targetType = targetType

          if (step.target.value) {
            let targetValueOne = null
            let targetValueTwo = null

            if (Array.isArray(step.target.value)) {
              let [minValue, maxValue] = step.target.value

              // Perform unit conversions if necessary
              if (targetTypeKey === 'pace') {
                // Convert pace from min/km to m/s
                minValue = 1000 / (minValue * 60) // minValue in m/s
                maxValue = 1000 / (maxValue * 60) // maxValue in m/s
              }

              targetValueOne = minValue
              targetValueTwo = maxValue
            } else {
              // Single value targets
              targetValueOne = step.target.value
            }

            workoutStep.targetValueOne = targetValueOne
            workoutStep.targetValueTwo = targetValueTwo
          }

          // Set targetValueUnit to null as per previous discussion
          workoutStep.targetValueUnit = null
        } else {
          // If no target, set targetType to 'no.target'
          workoutStep.targetType = targetTypeMapping['no target']
        }

        steps.push(workoutStep)
        stepOrder += 1
      }
    })

    return steps
  }

  // Process the top-level steps
  segment.workoutSteps = processSteps(workout.steps)

  // Add the segment to payload
  payload.workoutSegments.push(segment)

  return payload
}

export function createWorkout(workout, callback) {
  let garminVersion = document.getElementById('garmin-connect-version')
  let xhr = new XMLHttpRequest()

  xhr.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      callback(JSON.parse(xhr.response))
    }
  }

  let localStoredToken = window.localStorage.getItem('token')
  let accessTokenMap = JSON.parse(localStoredToken)
  let token = accessTokenMap.access_token
  const payload = makePayload(workout)

  console.log('payload ', payload)

  xhr.open('POST', addWorkoutEndpoint, true)
  xhr.setRequestHeader('Content-Type', 'application/json')
  xhr.setRequestHeader('Accept', 'application/json, text/javascript, */*; q=0.01')

  xhr.setRequestHeader('x-app-ver', garminVersion.innerText || '4.27.1.0')
  xhr.setRequestHeader('x-requested-with', 'XMLHttpRequest')
  xhr.setRequestHeader('x-lang', 'it-IT')
  xhr.setRequestHeader('nk', 'NT')
  xhr.setRequestHeader('Di-Backend', 'connectapi.garmin.com')
  xhr.setRequestHeader('authorization', 'Bearer ' + token)
  xhr.withCredentials = true

  xhr.send(JSON.stringify(payload))
}

export function goToWorkout(id) {
  window.location.assign(workoutUrl + id)
}
