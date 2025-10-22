"use client"

import { useState, useEffect } from "react"
import { Cloud, CloudRain, Sun, Wind, CloudSnow, CloudLightning, CloudDrizzle, RefreshCw } from "lucide-react"
import { getWeatherForKapalong, getWeatherForecast, getFarmingRecommendation } from "../../utils/weatherUtils"

const WeatherWidget = () => {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchWeather = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)

      // Fetch current weather and forecast in parallel
      const [currentWeather, forecastData] = await Promise.all([
        getWeatherForKapalong(),
        getWeatherForecast()
      ])

      const weatherData = {
        ...currentWeather,
        forecast: forecastData.forecast,
        farmingRecommendation: getFarmingRecommendation(currentWeather),
        realData: currentWeather.realData
      }

      setWeather(weatherData)
    } catch (err) {
      console.error('Error fetching weather:', err)
      setError("Failed to load weather data")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchWeather()
  }, [])

  const handleRefresh = () => {
    fetchWeather(true)
  }

  const getWeatherIcon = (condition) => {
    switch (condition.toLowerCase()) {
      case "clear":
      case "sunny":
        return <Sun className="h-8 w-8 text-yellow-500" />
      case "partly cloudy":
      case "cloudy":
        return <Cloud className="h-8 w-8 text-gray-500" />
      case "rain":
        return <CloudRain className="h-8 w-8 text-blue-500" />
      case "thunderstorm":
        return <CloudLightning className="h-8 w-8 text-purple-500" />
      case "snow":
        return <CloudSnow className="h-8 w-8 text-blue-200" />
      case "drizzle":
        return <CloudDrizzle className="h-8 w-8 text-blue-400" />
      default:
        return <Cloud className="h-8 w-8 text-gray-400" />
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow p-4 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-10 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow p-4">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  if (!weather) {
    return null
  }

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-semibold text-gray-800">{weather.location}</h2>
            {weather.realData && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                Live Data
              </span>
            )}
          </div>
          <div className="flex items-center">
            <span className="text-3xl font-bold">{weather.temperature}°C</span>
            <span className="ml-2 text-gray-600">{weather.condition}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div>{getWeatherIcon(weather.condition)}</div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            title="Refresh weather data"
          >
            <RefreshCw className={`h-4 w-4 text-gray-500 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
        <div className="flex items-center">
          <Wind className="h-4 w-4 mr-1 text-gray-500" />
          <span>Wind: {weather.windSpeed} km/h</span>
        </div>
        <div className="flex items-center">
          <CloudRain className="h-4 w-4 mr-1 text-gray-500" />
          <span>Humidity: {weather.humidity}%</span>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-3">
        <h3 className="text-sm font-medium mb-2">5-Day Forecast</h3>
        <div className="grid grid-cols-5 gap-1 text-xs">
          {weather.forecast.map((day, index) => (
            <div key={index} className="text-center">
              <div className="font-medium">{day.day}</div>
              <div className="my-1">{getWeatherIcon(day.condition)}</div>
              <div>
                {day.high}° / {day.low}°
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="bg-blue-50 border-l-4 border-blue-400 p-2 text-xs text-blue-800">
          <p className="font-medium">Farming Recommendation</p>
          <p>{weather.farmingRecommendation}</p>
        </div>
        {weather.realData && (
          <div className="mt-2 text-xs text-gray-500 text-center">
            Last updated: {new Date(weather.timestamp).toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  )
}

export default WeatherWidget
