// Weather utility for KPI blocks with real OpenWeatherMap API
const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
const WEATHER_CITY = import.meta.env.VITE_WEATHER_CITY || 'Kapalong'
const WEATHER_COUNTRY = import.meta.env.VITE_WEATHER_COUNTRY || 'PH'
const WEATHER_LAT = import.meta.env.VITE_WEATHER_LAT || '7.5815'
const WEATHER_LON = import.meta.env.VITE_WEATHER_LON || '125.8235'

export const getWeatherForKapalong = async () => {
  try {
    // Check if API key is available
    if (!OPENWEATHER_API_KEY) {
      console.warn('OpenWeatherMap API key not found, using fallback data')
      return getFallbackWeatherData()
    }

    // Fetch real weather data from OpenWeatherMap
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${WEATHER_LAT}&lon=${WEATHER_LON}&appid=${OPENWEATHER_API_KEY}&units=metric`
    
    const response = await fetch(apiUrl)
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    // Transform OpenWeatherMap data to our format
    const weatherData = {
      location: `${WEATHER_CITY}, Davao del Norte`,
      temperature: Math.round(data.main.temp),
      condition: mapWeatherCondition(data.weather[0].main, data.weather[0].description),
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
      description: data.weather[0].description,
      icon: getWeatherIcon(data.weather[0].main, data.weather[0].icon),
      timestamp: new Date().toISOString(),
      realData: true
    }

    return weatherData
  } catch (error) {
    console.error('Error fetching weather from API:', error)
    // Return fallback data if API fails
    return getFallbackWeatherData()
  }
}

// Fallback weather data when API is unavailable
const getFallbackWeatherData = () => {
  return {
    location: "Kapalong, Davao del Norte",
    temperature: Math.floor(Math.random() * 10) + 25, // 25-35°C
    condition: getRandomWeatherCondition(),
    humidity: Math.floor(Math.random() * 30) + 60, // 60-90%
    windSpeed: Math.floor(Math.random() * 15) + 5, // 5-20 km/h
    description: "Weather data unavailable",
    icon: "🌤️",
    timestamp: new Date().toISOString(),
    realData: false
  }
}

// Map OpenWeatherMap conditions to our format
const mapWeatherCondition = (main, description) => {
  const conditionMap = {
    'Clear': 'Clear',
    'Clouds': description.includes('few') ? 'Partly Cloudy' : 'Cloudy',
    'Rain': description.includes('light') ? 'Light Rain' : description.includes('heavy') ? 'Heavy Rain' : 'Rain',
    'Drizzle': 'Drizzle',
    'Thunderstorm': 'Thunderstorm',
    'Snow': 'Snow',
    'Mist': 'Cloudy',
    'Fog': 'Cloudy',
    'Haze': 'Cloudy'
  }
  
  return conditionMap[main] || 'Partly Cloudy'
}

// Get weather icon based on OpenWeatherMap icon codes
const getWeatherIcon = (main, iconCode) => {
  const iconMap = {
    '01d': '☀️', '01n': '🌙', // Clear sky
    '02d': '⛅', '02n': '☁️', // Few clouds
    '03d': '☁️', '03n': '☁️', // Scattered clouds
    '04d': '☁️', '04n': '☁️', // Broken clouds
    '09d': '🌧️', '09n': '🌧️', // Shower rain
    '10d': '🌦️', '10n': '🌧️', // Rain
    '11d': '⛈️', '11n': '⛈️', // Thunderstorm
    '13d': '❄️', '13n': '❄️', // Snow
    '50d': '🌫️', '50n': '🌫️'  // Mist
  }
  
  return iconMap[iconCode] || '🌤️'
}

const getRandomWeatherCondition = () => {
  const conditions = [
    "Sunny", "Partly Cloudy", "Cloudy", "Rain", "Thunderstorm", 
    "Light Rain", "Heavy Rain", "Drizzle", "Clear"
  ]
  return conditions[Math.floor(Math.random() * conditions.length)]
}

const getWeatherInfo = (condition) => {
  const weatherMap = {
    "Sunny": { description: "Clear skies, perfect for farming", icon: "☀️" },
    "Partly Cloudy": { description: "Some clouds, good farming weather", icon: "⛅" },
    "Cloudy": { description: "Overcast, moderate farming conditions", icon: "☁️" },
    "Rain": { description: "Rainy day, protect your crops", icon: "🌧️" },
    "Thunderstorm": { description: "Storm warning, secure your farm", icon: "⛈️" },
    "Light Rain": { description: "Light showers, good for irrigation", icon: "🌦️" },
    "Heavy Rain": { description: "Heavy rainfall, flood risk", icon: "🌧️" },
    "Drizzle": { description: "Light drizzle, gentle moisture", icon: "🌦️" },
    "Clear": { description: "Clear weather, ideal for farming", icon: "☀️" }
  }
  
  return weatherMap[condition] || { description: "Weather conditions normal", icon: "🌤️" }
}

export const getWeatherStatus = (condition) => {
  const statusMap = {
    "Sunny": "excellent",
    "Clear": "excellent", 
    "Partly Cloudy": "good",
    "Cloudy": "moderate",
    "Light Rain": "good",
    "Drizzle": "good",
    "Rain": "caution",
    "Heavy Rain": "warning",
    "Thunderstorm": "danger"
  }
  
  return statusMap[condition] || "moderate"
}

export const getWeatherColor = (status) => {
  const colorMap = {
    "excellent": "text-green-600",
    "good": "text-blue-600", 
    "moderate": "text-yellow-600",
    "caution": "text-orange-600",
    "warning": "text-red-600",
    "danger": "text-red-800"
  }
  
  return colorMap[status] || "text-gray-600"
}
