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

function makePayload(workout) {
  // determine sportType
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

  // Mapping for end conditions (assuming time-based steps)
  const endConditionTime = {
    conditionTypeId: 2,
    conditionTypeKey: 'time',
    displayOrder: 2,
    displayable: true,
  }

  let stepOrder = 1

  // Build workout steps
  workout.steps.forEach((step) => {
    const stepType = stepTypeMapping[step.stepType.toLowerCase()] || stepTypeMapping['run']

    const workoutStep = {
      stepId: stepOrder,
      stepOrder: stepOrder,
      stepType: stepType,
      type: 'ExecutableStepDTO',
      endCondition: endConditionTime,
      endConditionValue: step.stepDuration, // Duration in seconds
      description: step.stepDescription || '',
      stepAudioNote: null,
    }

    segment.workoutSteps.push(workoutStep)
    stepOrder += 1
  })

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
