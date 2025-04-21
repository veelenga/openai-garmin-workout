import OpenAI from 'openai'
import { ERRORS } from '../lib/constants.js'

/**
 * Generates a workout based on the description.
 * @param {string} apiKey - The OpenAI API key.
 * @param {string} model - The OpenAI model to use.
 * @param {string} description - The workout description.
 * @returns {Promise<Object>} - The generated workout object.
 */
export async function generateWorkout(apiKey, model, description) {
  try {
    const prompt = createPrompt(description)
    const client = new OpenAI({ apiKey })

    const response = await client.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000,
      temperature: 0.7,
    })

    const assistantMessage = response.choices[0].message.content
    return parseWorkoutResponse(assistantMessage)
  } catch (error) {
    throw new ERRORS.WorkoutGenerationError(error.message)
  }
}

function createPrompt(description) {
  return `
You are a fitness coach.
Given the following workout description, create a structured JSON object that represents the workout.
The JSON should be compatible with the makePayload function used for Garmin workouts.

Workout Description:
${description}

Requirements:
- The output must be valid JSON.
- Use the following structure for the workout object:
{
  "name": "Workout Name",
  "type": "running" | "cycling" | "swimming" | "walking" | "cardio" | "strength",
  "steps": [
    {
      "stepName": "Step Name",
      "stepDescription": "Description",
      "endConditionType": "time" | "distance", // Either time or distance based
      "stepDuration": duration_in_seconds, // Only used when endConditionType is "time"
      "stepDistance": distance_value, // Only used when endConditionType is "distance"
      "distanceUnit": "m" | "km" | "mile", // Only used when endConditionType is "distance"
      "stepType": "warmup" | "cooldown" | "interval" | "recovery" | "rest" | "repeat",
      "target": {
        "type": "no target" | "pace" | "heart rate" | "power" | "cadence" | "speed",
        "value": [minValue, maxValue] or single_value,
        "unit": "min_per_km" | "bpm" | "watts" | etc.
      },
      "numberOfIterations": number, // Only for repeat steps
      "steps": [ ... ] // Nested steps for repeats
    }
  ]
}

Constraints:
- Be creative on the workout name. It should be understandable and describe the workout. Avoid sport type in the name.
- The "type" should be one of the supported sports.
- When using time-based steps, "stepDuration" should be in seconds.
- When using distance-based steps, include "stepDistance" and "distanceUnit" instead of "stepDuration".
- For distance-based steps, use "m" for meters, "km" for kilometers, and "mile" for miles.
- For pace targets, convert times like "4:30 per km" to minutes per km as a decimal (e.g., 4.5).
- Use "no target" if no specific target is given.
- For repeats, include "numberOfIterations" and "steps".
- Use repeats where possible to avoid repeating steps. For example, use a repeat step for 5x1km intervals.
- Never mix intervals with recovery or rest steps in the same step. Use separate steps for each.
- The step with the slowest target in the repeat should be of type "recovery" or "rest".
- The JSON must be parsable and not include additional explanations. Do not include any formatting or comments in the JSON.
`
}

function parseWorkoutResponse(responseText) {
  const trimmedText = responseText.trim()

  try {
    return JSON.parse(trimmedText)
  } catch {
    throw new Error('Invalid JSON response from OpenAI.')
  }
}
