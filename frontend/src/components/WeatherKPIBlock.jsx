import { useState, useEffect } from "react"
import { getWeatherForKapalong } from "../utils/weatherUtils"
import climateImage from "../assets/Images/climate.png"

const WeatherKPIBlock = () => {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const weatherData = await getWeatherForKapalong()
        setWeather(weatherData)
      } catch (error) {
        console.error('Error fetching weather:', error)
        setWeather({
          temperature: 28,
          condition: "Partly Cloudy",
          description: "Weather data unavailable",
          icon: "🌤️"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchWeather()
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-4 flex items-center justify-between text-gray-800 hover:scale-105 transition-all duration-300 shadow-sm border border-gray-200">
        <div className="flex-1">
          <div className="text-sm font-bold text-black mb-1">Todays Weather</div>
          <div className="text-2xl font-bold text-gray-800 mb-1">--°C</div>
          <div className="text-xs text-gray-600 mb-2">Loading...</div>
          <div className="text-xs text-gray-500 mt-1">Please wait</div>
        </div>
        <div className="flex-shrink-0 ml-3">
          <img src={climateImage} alt="Today's Weather" className="h-12 w-12" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl p-4 flex items-center justify-between text-gray-800 hover:scale-105 transition-all duration-300 shadow-sm border border-gray-200">
      <div className="flex-1">
        <div className="text-sm font-bold text-black mb-1">Todays Weather</div>
        <div className="text-2xl font-bold text-gray-800 mb-1">{weather?.temperature || 28}°C</div>
        <div className="text-xs text-gray-600 mb-2">Kapalong, Davao</div>
        <div className="text-xs text-gray-500 mt-1">{weather?.condition || "Partly Cloudy"}</div>
      </div>
      <div className="flex-shrink-0 ml-3">
        <img src={climateImage} alt="Today's Weather" className="h-12 w-12" />
      </div>
    </div>
  )
}

export default WeatherKPIBlock

