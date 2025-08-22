"use client"

import { useState, useEffect } from "react"
import { Cloud, CloudRain, Sun, Wind, CloudSnow, CloudLightning, CloudDrizzle } from "lucide-react"

const WeatherWidget = () => {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // In a real app, you would fetch from a weather API
    // For this demo, we'll use mock data
    const fetchWeather = async () => {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const mockWeatherData = {
          location: "San Isidro, Quezon City",
          temperature: 32,
          condition: "Partly Cloudy",
          humidity: 75,
          windSpeed: 12,
          forecast: [
            { day: "Today", condition: "Partly Cloudy", high: 32, low: 24 },
            { day: "Tomorrow", condition: "Rain", high: 30, low: 23 },
            { day: "Wed", condition: "Thunderstorm", high: 29, low: 23 },
            { day: "Thu", condition: "Rain", high: 28, low: 22 },
            { day: "Fri", condition: "Partly Cloudy", high: 31, low: 23 },
          ],
        }

        setWeather(mockWeatherData)
        setLoading(false)
      } catch (err) {
        setError("Failed to load weather data")
        setLoading(false)
      }
    }

    fetchWeather()
  }, [])

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
          <h2 className="text-lg font-semibold text-gray-800">{weather.location}</h2>
          <div className="flex items-center">
            <span className="text-3xl font-bold">{weather.temperature}°C</span>
            <span className="ml-2 text-gray-600">{weather.condition}</span>
          </div>
        </div>
        <div>{getWeatherIcon(weather.condition)}</div>
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
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-2 text-xs text-yellow-800">
          <p className="font-medium">Weather Alert</p>
          <p>Heavy rainfall expected in the next 48 hours. Consider protective measures for your crops.</p>
        </div>
      </div>
    </div>
  )
}

export default WeatherWidget
