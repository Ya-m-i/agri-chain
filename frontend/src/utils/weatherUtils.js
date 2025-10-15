// Weather utility for KPI blocks
export const getWeatherForKapalong = async () => {
  try {
    // For now, using mock data for Kapalong, Davao del Norte
    // In production, you would integrate with a real weather API like OpenWeatherMap
    const mockWeatherData = {
      location: "Kapalong, Davao del Norte",
      temperature: Math.floor(Math.random() * 10) + 25, // 25-35°C
      condition: getRandomWeatherCondition(),
      humidity: Math.floor(Math.random() * 30) + 60, // 60-90%
      windSpeed: Math.floor(Math.random() * 15) + 5, // 5-20 km/h
      description: "",
      icon: "",
      timestamp: new Date().toISOString()
    }

    // Add description and icon based on condition
    const weatherInfo = getWeatherInfo(mockWeatherData.condition)
    mockWeatherData.description = weatherInfo.description
    mockWeatherData.icon = weatherInfo.icon

    return mockWeatherData
  } catch (error) {
    console.error('Error fetching weather:', error)
    return {
      location: "Kapalong, Davao del Norte",
      temperature: 28,
      condition: "Partly Cloudy",
      humidity: 75,
      windSpeed: 10,
      description: "Weather data unavailable",
      icon: "cloud",
      timestamp: new Date().toISOString()
    }
  }
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
