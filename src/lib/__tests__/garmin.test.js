import { sportTypeMapping, makePayload } from '../garmin'

describe('makePayload Function', () => {
  test('Creates payload for a simple running workout without repeats', () => {
    const workout = {
      name: 'Simple Running Workout',
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
          stepDescription: 'Run at a steady pace',
          stepDuration: 1800,
          stepType: 'interval',
          target: {
            type: 'pace',
            value: [5, 6], // min/km
            unit: 'min_per_km',
          },
        },
        {
          stepName: 'Cool Down',
          stepDescription: 'Cool down for 5 minutes',
          stepDuration: 300,
          stepType: 'cooldown',
        },
      ],
    }

    const payload = makePayload(workout)

    expect(payload.workoutName).toBe('Simple Running Workout')
    expect(payload.sportType).toEqual(sportTypeMapping.running)
    expect(payload.workoutSegments[0].workoutSteps.length).toBe(3)
    expect(payload.workoutSegments[0].workoutSteps[1].targetType.workoutTargetTypeKey).toBe(
      'pace.zone',
    )
  })

  test('Creates payload for a cycling workout with power target', () => {
    const workout = {
      name: 'Cycling Power Workout',
      type: 'cycling',
      steps: [
        {
          stepName: 'Warm Up',
          stepDescription: 'Warm up for 15 minutes',
          stepDuration: 900,
          stepType: 'warmup',
        },
        {
          stepName: 'Intervals',
          stepDescription: '5x3min at high power',
          stepType: 'repeat',
          numberOfIterations: 5,
          steps: [
            {
              stepName: 'High Power',
              stepDescription: 'Ride hard for 3 minutes',
              stepDuration: 180,
              stepType: 'interval',
              target: {
                type: 'power',
                value: [250, 300], // watts
              },
            },
            {
              stepName: 'Recover',
              stepDescription: 'Recover for 2 minutes',
              stepDuration: 120,
              stepType: 'recovery',
              target: {
                type: 'no target',
              },
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

    const payload = makePayload(workout)

    expect(payload.workoutName).toBe('Cycling Power Workout')
    expect(payload.sportType).toEqual(sportTypeMapping.cycling)
    expect(payload.workoutSegments[0].workoutSteps.length).toBe(3)
    // Check repeat step
    const repeatStep = payload.workoutSegments[0].workoutSteps[1]
    expect(repeatStep.type).toBe('RepeatGroupDTO')
    expect(repeatStep.numberOfIterations).toBe(5)
    expect(repeatStep.workoutSteps.length).toBe(2)
    // Check target type in interval
    expect(repeatStep.workoutSteps[0].targetType.workoutTargetTypeKey).toBe('power.zone')
  })

  test('Handles unknown sport type gracefully', () => {
    const workout = {
      name: 'Unknown Sport Workout',
      type: 'unknown_sport',
      steps: [],
    }

    expect(() => {
      makePayload(workout)
    }).toThrow('Unsupported sport type: unknown_sport')
  })

  test('Handles missing step duration', () => {
    const workout = {
      name: 'Workout with Missing Duration',
      type: 'running',
      steps: [
        {
          stepName: 'Step Without Duration',
          stepDescription: 'This step lacks duration',
          stepType: 'interval',
        },
      ],
    }

    expect(() => {
      makePayload(workout)
    }).toThrow()
  })

  test('Creates payload for a workout with nested repeats', () => {
    const workout = {
      name: 'Nested Repeats Workout',
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
          numberOfIterations: 2,
          steps: [
            {
              stepType: 'repeat',
              numberOfIterations: 3,
              steps: [
                {
                  stepName: 'Fast Run',
                  stepDescription: 'Run fast for 1 minute',
                  stepDuration: 60,
                  stepType: 'interval',
                  target: {
                    type: 'pace',
                    value: [3, 4], // min/km
                    unit: 'min_per_km',
                  },
                },
                {
                  stepName: 'Walk',
                  stepDescription: 'Walk for 1 minute',
                  stepDuration: 60,
                  stepType: 'recovery',
                },
              ],
            },
            {
              stepName: 'Rest',
              stepDescription: 'Rest for 5 minutes',
              stepDuration: 300,
              stepType: 'rest',
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

    const payload = makePayload(workout)

    expect(payload.workoutName).toBe('Nested Repeats Workout')
    expect(payload.sportType).toEqual(sportTypeMapping.running)
    const repeatStep = payload.workoutSegments[0].workoutSteps[1]
    expect(repeatStep.type).toBe('RepeatGroupDTO')
    expect(repeatStep.numberOfIterations).toBe(2)
    expect(repeatStep.workoutSteps[0].type).toBe('RepeatGroupDTO')
    expect(repeatStep.workoutSteps[0].numberOfIterations).toBe(3)
  })

  test('Creates payload for a strength workout with custom steps', () => {
    const workout = {
      name: 'Strength Training',
      type: 'strength',
      steps: [
        {
          stepName: 'Warm Up',
          stepDescription: 'Light cardio for 5 minutes',
          stepDuration: 300,
          stepType: 'warmup',
        },
        {
          stepName: 'Circuit',
          stepDescription: 'Perform circuit exercises',
          stepType: 'repeat',
          numberOfIterations: 4,
          steps: [
            {
              stepName: 'Push-ups',
              stepDescription: 'Do push-ups for 30 seconds',
              stepDuration: 30,
              stepType: 'interval',
              target: {
                type: 'no target',
              },
            },
            {
              stepName: 'Squats',
              stepDescription: 'Do squats for 30 seconds',
              stepDuration: 30,
              stepType: 'interval',
            },
            {
              stepName: 'Rest',
              stepDescription: 'Rest for 1 minute',
              stepDuration: 60,
              stepType: 'rest',
            },
          ],
        },
        {
          stepName: 'Cool Down',
          stepDescription: 'Stretching for 5 minutes',
          stepDuration: 300,
          stepType: 'cooldown',
        },
      ],
    }

    const payload = makePayload(workout)

    expect(payload.workoutName).toBe('Strength Training')
    expect(payload.sportType).toEqual(sportTypeMapping.strength)
    expect(payload.workoutSegments[0].workoutSteps.length).toBe(3)
    const circuitStep = payload.workoutSegments[0].workoutSteps[1]
    expect(circuitStep.type).toBe('RepeatGroupDTO')
    expect(circuitStep.numberOfIterations).toBe(4)
    expect(circuitStep.workoutSteps.length).toBe(3)
  })

  test('Handles workout with different target types', () => {
    const workout = {
      name: 'Mixed Targets Workout',
      type: 'running',
      steps: [
        {
          stepName: 'Warm Up',
          stepDescription: 'Warm up for 10 minutes',
          stepDuration: 600,
          stepType: 'warmup',
          target: {
            type: 'heart rate',
            value: [110, 130], // bpm
          },
        },
        {
          stepName: 'Run',
          stepDescription: 'Run at cadence',
          stepDuration: 1800,
          stepType: 'interval',
          target: {
            type: 'cadence',
            value: [170, 180], // steps per minute
          },
        },
        {
          stepName: 'Cool Down',
          stepDescription: 'Cool down',
          stepDuration: 600,
          stepType: 'cooldown',
          target: {
            type: 'speed',
            value: [2, 3], // m/s
          },
        },
      ],
    }

    const payload = makePayload(workout)

    expect(payload.workoutName).toBe('Mixed Targets Workout')
    expect(payload.sportType).toEqual(sportTypeMapping.running)
    expect(payload.workoutSegments[0].workoutSteps.length).toBe(3)
    const warmUpStep = payload.workoutSegments[0].workoutSteps[0]
    expect(warmUpStep.targetType.workoutTargetTypeKey).toBe('heart.rate.zone')
    const runStep = payload.workoutSegments[0].workoutSteps[1]
    expect(runStep.targetType.workoutTargetTypeKey).toBe('cadence.zone')
    const coolDownStep = payload.workoutSegments[0].workoutSteps[2]
    expect(coolDownStep.targetType.workoutTargetTypeKey).toBe('speed.zone')
  })

  test('Handles invalid target type gracefully', () => {
    const workout = {
      name: 'Workout with Invalid Target',
      type: 'running',
      steps: [
        {
          stepName: 'Run',
          stepDescription: 'Run with invalid target',
          stepDuration: 600,
          stepType: 'interval',
          target: {
            type: 'unknown_target',
            value: [100, 200],
          },
        },
      ],
    }

    expect(() => {
      makePayload(workout)
    }).toThrow()
  })

  test('Creates payload for swimming workout', () => {
    const workout = {
      name: 'Swimming Workout',
      type: 'swimming',
      steps: [
        {
          stepName: 'Warm Up',
          stepDescription: 'Swim easy for 200 meters',
          stepDuration: 600, // Assuming 600 seconds
          stepType: 'warmup',
        },
        {
          stepName: 'Main Set',
          stepDescription: 'Swim intervals',
          stepType: 'repeat',
          numberOfIterations: 5,
          steps: [
            {
              stepName: 'Fast Swim',
              stepDescription: 'Swim fast for 100 meters',
              stepDuration: 180, // Assuming 180 seconds
              stepType: 'interval',
            },
            {
              stepName: 'Rest',
              stepDescription: 'Rest for 30 seconds',
              stepDuration: 30,
              stepType: 'rest',
            },
          ],
        },
        {
          stepName: 'Cool Down',
          stepDescription: 'Swim easy for 200 meters',
          stepDuration: 600,
          stepType: 'cooldown',
        },
      ],
    }

    const payload = makePayload(workout)

    expect(payload.workoutName).toBe('Swimming Workout')
    expect(payload.sportType).toEqual(sportTypeMapping.swimming)
    const mainSet = payload.workoutSegments[0].workoutSteps[1]
    expect(mainSet.type).toBe('RepeatGroupDTO')
    expect(mainSet.numberOfIterations).toBe(5)
  })

  test('Handles workout with no steps', () => {
    const workout = {
      name: 'Empty Workout',
      type: 'running',
      steps: [],
    }

    const payload = makePayload(workout)

    expect(payload.workoutSegments[0].workoutSteps.length).toBe(0)
  })
})
