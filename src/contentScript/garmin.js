const addWorkoutEndpoint = 'https://connect.garmin.com/workout-service/workout'
const workoutUrl = 'https://connect.garmin.com/modern/workout/'

export const sportTypeMapping = {
  running: { sportTypeId: 1, sportTypeKey: 'running', displayOrder: 1 },
  cycling: { sportTypeId: 2, sportTypeKey: 'cycling', displayOrder: 2 },
  swimming: { sportTypeId: 5, sportTypeKey: 'swimming', displayOrder: 5 },
  walking: { sportTypeId: 3, sportTypeKey: 'walking', displayOrder: 3 },
  cardio: { sportTypeId: 8, sportTypeKey: 'cardio', displayOrder: 8 },
  strength: { sportTypeId: 9, sportTypeKey: 'strength_training', displayOrder: 9 },
}

export const stepTypeMapping = {
  warmup: { stepTypeId: 1, stepTypeKey: 'warmup', displayOrder: 1 },
  cooldown: { stepTypeId: 2, stepTypeKey: 'cooldown', displayOrder: 2 },
  interval: { stepTypeId: 3, stepTypeKey: 'interval', displayOrder: 3 },
  recovery: { stepTypeId: 4, stepTypeKey: 'recovery', displayOrder: 4 },
  rest: { stepTypeId: 5, stepTypeKey: 'rest', displayOrder: 5 },
  repeat: { stepTypeId: 6, stepTypeKey: 'repeat', displayOrder: 6 },
}

export const targetTypeMapping = {
  'no target': { workoutTargetTypeId: 1, workoutTargetTypeKey: 'no.target', displayOrder: 1 },
  speed: { workoutTargetTypeId: 2, workoutTargetTypeKey: 'speed.zone', displayOrder: 2 },
  'heart rate': {
    workoutTargetTypeId: 3,
    workoutTargetTypeKey: 'heart.rate.zone',
    displayOrder: 3,
  },
  cadence: { workoutTargetTypeId: 4, workoutTargetTypeKey: 'cadence.zone', displayOrder: 4 },
  power: { workoutTargetTypeId: 5, workoutTargetTypeKey: 'power.zone', displayOrder: 5 },
  pace: { workoutTargetTypeId: 6, workoutTargetTypeKey: 'pace.zone', displayOrder: 6 },
}

/**
 * Main function to create the workout payload.
 * @param {Object} workout - The workout object containing workout details and steps.
 * @returns {Object} - The formatted payload ready to be sent to Garmin.
 */
export function makePayload(workout) {
  let stepOrder = 1
  const sportType = getSportType(workout.type)
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

  const segment = {
    segmentOrder: 1,
    sportType: sportType,
    workoutSteps: [],
  }

  const result = processSteps(workout.steps, stepOrder)
  segment.workoutSteps = result.steps
  stepOrder = result.stepOrder

  payload.workoutSegments.push(segment)

  return payload
}

/**
 * Retrieves the sport type object from the mapping.
 * @param {string} sportTypeKey - The sport type key (e.g., 'running').
 * @returns {Object} - The sport type object.
 */
function getSportType(sportTypeKey) {
  const sportType = sportTypeMapping[sportTypeKey.toLowerCase()]
  if (!sportType) {
    throw new Error(`Unsupported sport type: ${sportTypeKey}`)
  }
  return sportType
}

/**
 * Recursively processes an array of steps.
 * @param {Array} stepsArray - The array of steps to process.
 * @param {number} stepOrder - The current step order.
 * @returns {Object} - An object containing the array of formatted steps and updated stepOrder.
 */
function processSteps(stepsArray, stepOrder) {
  const steps = []

  stepsArray.forEach((step) => {
    const result = processStep(step, stepOrder)
    steps.push(result.step)
    stepOrder = result.stepOrder
  })

  return { steps, stepOrder }
}

/**
 * Processes an individual step (regular or repeat).
 * @param {Object} step - The step object to process.
 * @param {number} stepOrder - The current step order.
 * @returns {Object} - An object containing the formatted step and updated stepOrder.
 */
function processStep(step, stepOrder) {
  if (!step.stepType) {
    throw new Error(`Missing stepType for step: ${step.stepName || 'Unnamed Step'}`)
  }

  const stepTypeKey = step.stepType.toLowerCase()

  if (stepTypeKey === 'repeat') {
    return processRepeatStep(step, stepOrder)
  } else {
    return processRegularStep(step, stepOrder)
  }
}

/**
 * Processes a regular executable step.
 * @param {Object} step - The step object to process.
 * @param {number} stepOrder - The current step order.
 * @returns {Object} - An object containing the formatted executable step and updated stepOrder.
 */
function processRegularStep(step, stepOrder) {
  const stepType = stepTypeMapping[step.stepType.toLowerCase()] || stepTypeMapping['interval']

  if (typeof step.stepDuration !== 'number' || step.stepDuration <= 0) {
    throw new Error(`Invalid or missing stepDuration for step: ${step.stepName || 'Unnamed Step'}`)
  }

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
    processTarget(workoutStep, step)
  } else {
    // If no target, set targetType to 'no.target'
    workoutStep.targetType = targetTypeMapping['no target']
  }

  stepOrder += 1
  return { step: workoutStep, stepOrder }
}

/**
 * Processes a repeat step and its child steps.
 * @param {Object} step - The repeat step object to process.
 * @param {number} stepOrder - The current step order.
 * @returns {Object} - An object containing the formatted repeat step and updated stepOrder.
 */
function processRepeatStep(step, stepOrder) {
  if (typeof step.numberOfIterations !== 'number' || step.numberOfIterations <= 0) {
    throw new Error(`Invalid or missing numberOfIterations for repeat step.`)
  }

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
  const result = processSteps(step.steps, stepOrder)
  repeatStep.workoutSteps = result.steps
  stepOrder = result.stepOrder

  return { step: repeatStep, stepOrder }
}

/**
 * Processes the target information for a workout step.
 * @param {Object} workoutStep - The workout step object to update.
 * @param {Object} step - The original step object containing target information.
 */
function processTarget(workoutStep, step) {
  const targetTypeKey = step.target.type.toLowerCase()
  const targetType = targetTypeMapping[targetTypeKey]

  if (!targetType) {
    throw new Error(`Unsupported target type: ${step.target.type}`)
  }

  workoutStep.targetType = targetType

  if (step.target.value) {
    const { targetValueOne, targetValueTwo } = convertTargetValues(step, targetTypeKey)
    workoutStep.targetValueOne = targetValueOne
    workoutStep.targetValueTwo = targetValueTwo
  }

  // Set targetValueUnit to null as per previous discussion
  workoutStep.targetValueUnit = null
}

/**
 * Converts target values based on the target type and units.
 * @param {Object} step - The step object containing target values and units.
 * @param {string} targetTypeKey - The key representing the target type.
 * @returns {Object} - An object containing converted target values.
 */
function convertTargetValues(step, targetTypeKey) {
  let targetValueOne = null
  let targetValueTwo = null

  if (Array.isArray(step.target.value)) {
    let [minValue, maxValue] = step.target.value

    // Perform unit conversions if necessary
    if (targetTypeKey === 'pace' && step.target.unit === 'min_per_km') {
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

  return { targetValueOne, targetValueTwo }
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
