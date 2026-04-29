import { delay, ok } from './utils'

const MOCK_CONDITIONS = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Clear']
const MOCK_WEATHER = {
  tempC: 18,
  condition: 'Partly Cloudy',
  humidity: 60,
  icon: '⛅',
}

function conditionIcon(cond) {
  const c = cond.toLowerCase()
  if (c.includes('rain')) return '🌧️'
  if (c.includes('cloud')) return '☁️'
  if (c.includes('sunny') || c.includes('clear')) return '☀️'
  return '🌤️'
}

export const weatherService = {
  async getCurrentWeather() {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(ok({ ...MOCK_WEATHER, source: 'mock' }))
        return
      }
      navigator.geolocation.getCurrentPosition(
        async () => {
          // Simulate a weather fetch based on location (mocked)
          await delay(400)
          const condition = MOCK_CONDITIONS[Math.floor(Math.random() * MOCK_CONDITIONS.length)]
          resolve(ok({
            tempC: Math.round(12 + Math.random() * 20),
            condition,
            humidity: Math.round(40 + Math.random() * 50),
            icon: conditionIcon(condition),
            source: 'geo',
          }))
        },
        async () => {
          await delay(300)
          resolve(ok({ ...MOCK_WEATHER, icon: conditionIcon(MOCK_WEATHER.condition), source: 'fallback' }))
        },
        { timeout: 5000 }
      )
    })
  },
}
