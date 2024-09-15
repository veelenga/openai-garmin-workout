import OpenAI from 'openai'

/**
 * Generates a workout based on the description.
 * @param {string} description - The workout description.
 * @param {OpenAI} [openaiClient] - Optional OpenAI client for testing.
 * @returns {Promise<Object>} - The generated workout object.
 */
export async function generateWorkout(description, openaiClient) {
  const prompt = createPrompt(description)
  const client = openaiClient || new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  const response = await client.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1000,
    temperature: 0.7,
  })

  const assistantMessage = response.choices[0].message.content
  return parseWorkoutResponse(assistantMessage)
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
      "stepDuration": duration_in_seconds,
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
- The "type" should be one of the supported sports.
- "stepDuration" should be in seconds.
- For pace targets, convert times like "4:30 per km" to minutes per km as a decimal (e.g., 4.5).
- Use "no target" if no specific target is given.
- For repeats, include "numberOfIterations" and "steps".
- The JSON must be parsable and not include additional explanations.
`
}

function parseWorkoutResponse(responseText) {
  const trimmedText = responseText.trim()

  try {
    const workout = JSON.parse(trimmedText)
    return workout
  } catch {
    throw new Error('Invalid JSON response from OpenAI.')
  }
}
