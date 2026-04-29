import { useState, useEffect, useCallback } from 'react'
import { weatherService } from '../services/weatherService'

export function useWeather() {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchWeather = useCallback(async () => {
    setLoading(true)
    const res = await weatherService.getCurrentWeather()
    if (res.success) setWeather(res.data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchWeather() }, [fetchWeather])

  return { weather, loading, refresh: fetchWeather }
}
