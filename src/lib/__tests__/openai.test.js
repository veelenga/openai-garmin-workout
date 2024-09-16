import nock from 'nock'
import { generateWorkout } from '../openai'

describe('generateWorkout', () => {
  afterEach(() => {
    nock.cleanAll()
  })

  test('generates a new workout', async () => {
    const description = `
      Long Run.

      30min at pace 6:00
      30min at pace 5:30
      30min at pace 5:00
      30min at pace 4:45
      30min at pace 4:15
    `

    const mockedResponse = {
      id: 'chatcmpl-mocked',
      object: 'chat.completion',
      created: 1234567890,
      model: 'gpt-4',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: `{
  "name": "Long Run",
  "type": "running",
  "steps": [
    {
      "stepName": "Segment 1",
      "stepDescription": "Run for 30 minutes at pace 6.0 min/km",
      "stepDuration": 1800,
      "stepType": "interval",
      "target": {
        "type": "pace",
        "value": 6.0,
        "unit": "min_per_km"
      }
    },
    {
      "stepName": "Segment 2",
      "stepDescription": "Run for 30 minutes at pace 5.5 min/km",
      "stepDuration": 1800,
      "stepType": "interval",
      "target": {
        "type": "pace",
        "value": 5.5,
        "unit": "min_per_km"
      }
    },
    {
      "stepName": "Segment 3",
      "stepDescription": "Run for 30 minutes at pace 5.0 min/km",
      "stepDuration": 1800,
      "stepType": "interval",
      "target": {
        "type": "pace",
        "value": 5.0,
        "unit": "min_per_km"
      }
    },
    {
      "stepName": "Segment 4",
      "stepDescription": "Run for 30 minutes at pace 4.75 min/km",
      "stepDuration": 1800,
      "stepType": "interval",
      "target": {
        "type": "pace",
        "value": 4.75,
        "unit": "min_per_km"
      }
    },
    {
      "stepName": "Segment 5",
      "stepDescription": "Run for 30 minutes at pace 4.25 min/km",
      "stepDuration": 1800,
      "stepType": "interval",
      "target": {
        "type": "pace",
        "value": 4.25,
        "unit": "min_per_km"
      }
    }
  ]
}`,
          },
          finish_reason: 'stop',
        },
      ],
      usage: {
        prompt_tokens: 100,
        completion_tokens: 500,
        total_tokens: 600,
      },
    }

    nock('https://api.openai.com').post('/v1/chat/completions').reply(200, mockedResponse)
    const workout = await generateWorkout('test-api-key', description)

    expect(workout).toEqual({
      name: 'Long Run',
      type: 'running',
      steps: [
        {
          stepName: 'Segment 1',
          stepDescription: 'Run for 30 minutes at pace 6.0 min/km',
          stepDuration: 1800,
          stepType: 'interval',
          target: {
            type: 'pace',
            value: 6.0,
            unit: 'min_per_km',
          },
        },
        {
          stepName: 'Segment 2',
          stepDescription: 'Run for 30 minutes at pace 5.5 min/km',
          stepDuration: 1800,
          stepType: 'interval',
          target: {
            type: 'pace',
            value: 5.5,
            unit: 'min_per_km',
          },
        },
        {
          stepName: 'Segment 3',
          stepDescription: 'Run for 30 minutes at pace 5.0 min/km',
          stepDuration: 1800,
          stepType: 'interval',
          target: {
            type: 'pace',
            value: 5.0,
            unit: 'min_per_km',
          },
        },
        {
          stepName: 'Segment 4',
          stepDescription: 'Run for 30 minutes at pace 4.75 min/km',
          stepDuration: 1800,
          stepType: 'interval',
          target: {
            type: 'pace',
            value: 4.75,
            unit: 'min_per_km',
          },
        },
        {
          stepName: 'Segment 5',
          stepDescription: 'Run for 30 minutes at pace 4.25 min/km',
          stepDuration: 1800,
          stepType: 'interval',
          target: {
            type: 'pace',
            value: 4.25,
            unit: 'min_per_km',
          },
        },
      ],
    })
  })

  test('handles OpenAI API errors gracefully', async () => {
    const description = 'Some workout description'

    nock('https://api.openai.com')
      .post('/v1/chat/completions')
      .reply(500, {
        error: {
          message: 'Internal server error',
          type: 'server_error',
        },
      })

    await expect(generateWorkout('test-api-key', description)).rejects.toThrow()
  })

  test('throws error when response is invalid JSON', async () => {
    const description = 'Some workout description'

    const mockedResponse = {
      id: 'chatcmpl-mocked',
      object: 'chat.completion',
      created: 1234567890,
      model: 'gpt-4',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: `This is not valid JSON.`,
          },
          finish_reason: 'stop',
        },
      ],
    }

    nock('https://api.openai.com').post('/v1/chat/completions').reply(200, mockedResponse)

    await expect(generateWorkout('test-api-key', description)).rejects.toThrow(
      'Invalid JSON response from OpenAI.',
    )
  })
})
