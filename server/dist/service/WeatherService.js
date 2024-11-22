import dotenv from 'dotenv';
dotenv.config();
// Clase para encapsular los datos del clima
class Weather {
    constructor(city, date, icon, description, temp, windSpeed, humidity) {
        this.city = city;
        this.date = date;
        this.icon = icon;
        this.description = description;
        this.temp = temp;
        this.windSpeed = windSpeed;
        this.humidity = humidity;
    }
}
// Clase para el servicio de clima
class WeatherService {
    constructor(cityName) {
        this.baseURL = process.env.API_BASE_URL || '';
        this.apiKey = process.env.API_KEY || '';
        this.cityName = cityName || '';
    }
    // Método para obtener datos de ubicación
    async fetchLocationData(query) {
        try {
            const response = await fetch(query);
            const data = await response.json();
            return data.city.coord; // Obtener solo las coordenadas
        }
        catch (err) {
            console.error('Error fetching location data: ', err);
            throw new Error('Failed to fetch location data');
        }
    }
    // Desestructuración de los datos de ubicación
    destructureLocationData(locationData) {
        const { lat, lon } = locationData; // Renombrar lat y lon para coincidir con las propiedades
        return { lat, lon };
    }
    // Construir la consulta para geocodificación
    buildGeocodeQuery() {
        return `${this.baseURL}/data/2.5/forecast?q=${this.cityName}&appid=${this.apiKey}`;
    }
    // Construir la consulta para obtener los datos del clima
    buildWeatherQuery(coordinates) {
        const { lat, lon } = coordinates;
        return `${this.baseURL}/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}`;
    }
    // Obtener las coordenadas de la ciudad
    async fetchAndDestructureLocationData() {
        const query = this.buildGeocodeQuery();
        const locationData = await this.fetchLocationData(query);
        return this.destructureLocationData(locationData);
    }
    // Obtener los datos del clima
    async fetchWeatherData(coordinates) {
        try {
            const weatherQuery = this.buildWeatherQuery(coordinates);
            const weatherData = await fetch(weatherQuery);
            return await weatherData.json();
        }
        catch (err) {
            console.error('Error fetching weather data: ', err);
            throw new Error('Failed to fetch weather data');
        }
    }
    // Parsear los datos del clima actual
    parseCurrentWeather(data) {
        const city = this.cityName;
        const date = new Date(data.list[0].dt * 1000).toLocaleDateString();
        const icon = data.list[0].weather[0].icon;
        const description = data.list[0].weather[0].description;
        const tempC = data.list[0].main.temp - 273.15; // Convertir de Kelvin a Celsius
        const tempF = parseFloat((tempC * 9 / 5 + 32).toFixed(2)); // Convertir de Celsius a Fahrenheit
        const windSpeed = data.list[0].wind.speed;
        const humidity = data.list[0].main.humidity;
        return new Weather(city, date, icon, description, tempF, windSpeed, humidity);
    }
    // Construir el pronóstico del clima
    buildForecastArray(weatherData) {
        const forecast = [];
        const uniqueDates = new Set();
        weatherData.forEach((entry) => {
            const date = entry.dt_txt.split(' ')[0];
            if (!uniqueDates.has(date) && uniqueDates.size < 5) {
                uniqueDates.add(date);
                const city = this.cityName;
                const formattedDate = new Date(entry.dt * 1000).toLocaleDateString();
                const icon = entry.weather[0].icon;
                const description = entry.weather[0].description;
                const tempC = entry.main.temp - 273.15; // Convertir de Kelvin a Celsius
                const tempF = parseFloat((tempC * 9 / 5 + 32).toFixed(2)); // Convertir de Celsius a Fahrenheit
                const windSpeed = entry.wind.speed;
                const humidity = entry.main.humidity;
                forecast.push(new Weather(city, formattedDate, icon, description, tempF, windSpeed, humidity));
            }
        });
        return forecast;
    }
    // Obtener el clima para una ciudad
    async getWeatherForCity(cityName) {
        this.cityName = cityName;
        try {
            const coordinates = await this.fetchAndDestructureLocationData();
            const weatherData = await this.fetchWeatherData(coordinates);
            if (!weatherData || !weatherData.list || weatherData.list.length === 0) {
                throw new Error('No weather data available');
            }
            const currentWeather = this.parseCurrentWeather(weatherData);
            const forecast = this.buildForecastArray(weatherData.list);
            return [currentWeather, ...forecast];
        }
        catch (error) {
            console.error('Error fetching weather data: ', error);
            throw new Error('Failed to fetch weather data');
        }
    }
}
export default WeatherService;
