import dotenv from 'dotenv';
dotenv.config();

// Interface para Coordenadas
interface Coordinates {
  lat: number;
  lon: number;
}

// Interface para la respuesta de la API
interface WeatherAPIResponse {
  list: {
    dt: number;
    dt_txt: string;
    weather: { icon: string; description: string }[];
    main: { temp: number; humidity: number };
    wind: { speed: number };
  }[];
  city: { coord: Coordinates };
}

// Clase para encapsular los datos del clima
class Weather {
  icon: string;
  description: string;
  city: string;
  date: string;
  temp: number;
  windSpeed: number;
  humidity: number;

  constructor(
    city: string,
    date: string,
    icon: string,
    description: string,
    temp: number,
    windSpeed: number,
    humidity: number
  ) {
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
export class WeatherService {
  baseURL: string;
  apiKey: string;
  cityName: string;

  constructor(cityName: string = '') {
    this.baseURL = process.env.API_BASE_URL || '';
    this.apiKey = process.env.API_KEY || '';
    this.cityName = cityName;
  }

  // Método para construir la consulta de geocodificación
  private buildGeocodeQuery(): string {
    return `${this.baseURL}/geo/1.0/direct?q=${this.cityName}&appid=${this.apiKey}`;
  }

  // Método para construir la consulta del pronóstico
  private buildForecastQuery(coordinates: Coordinates): string {
    const { lat, lon } = coordinates;
    return `${this.baseURL}/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}`;
  }

  // Método para obtener datos de ubicación desde la API
  private async fetchLocationData(query: string): Promise<Coordinates> {
    const response = await fetch(query);
    if (!response.ok) {
      throw new Error(`Failed to fetch location data. Status: ${response.status}`);
    }
    const data: WeatherAPIResponse = await response.json();
    return data.city.coord;
  }

  // Método para obtener y desestructurar los datos de ubicación
  private async fetchAndDestructureLocationData(): Promise<Coordinates> {
    const query = this.buildGeocodeQuery();
    const locationData = await this.fetchLocationData(query);
    return locationData;
  }

  // Método para obtener datos del clima desde la API
  private async fetchWeatherData(coordinates: Coordinates): Promise<WeatherAPIResponse> {
    const query = this.buildForecastQuery(coordinates);
    const response = await fetch(query);
    if (!response.ok) {
      throw new Error(`Failed to fetch weather data. Status: ${response.status}`);
    }
    return await response.json();
  }

  // Método para analizar el clima actual
  private parseCurrentWeather(data: WeatherAPIResponse): Weather {
    const icon = data.list[0].weather[0].icon;
    const description = data.list[0].weather[0].description;
    const city = this.cityName;
    const date = new Date(data.list[0].dt * 1000).toLocaleDateString();
    const temp = parseFloat(((data.list[0].main.temp - 273.15) * 9 / 5 + 32).toFixed(2));
    const windSpeed = data.list[0].wind.speed;
    const humidity = data.list[0].main.humidity;

    return new Weather(city, date, icon, description, temp, windSpeed, humidity);
  }

  // Método para construir el array del pronóstico
  private buildForecastArray(weatherData: WeatherAPIResponse): Weather[] {
    const forecast: Weather[] = [];
    const uniqueDates: Set<string> = new Set();

    weatherData.list.forEach((entry) => {
      const date = entry.dt_txt.split(' ')[0];
      if (!uniqueDates.has(date) && uniqueDates.size < 5) {
        uniqueDates.add(date);

        const city = this.cityName;
        const formattedDate = new Date(entry.dt * 1000).toLocaleDateString();
        const icon = entry.weather[0].icon;
        const description = entry.weather[0].description;
        const temp = parseFloat(((entry.main.temp - 273.15) * 9 / 5 + 32).toFixed(2));
        const windSpeed = entry.wind.speed;
        const humidity = entry.main.humidity;

        forecast.push(new Weather(city, formattedDate, icon, description, temp, windSpeed, humidity));
      }
    });

    return forecast;
  }

  // Método público para obtener el clima y el pronóstico
  static async getWeatherForCity(city: string): Promise<Weather[]> {
    const instance = new WeatherService(city); // Crear instancia dentro del método estático
    const coordinates = await instance.fetchAndDestructureLocationData();
    const weatherData = await instance.fetchWeatherData(coordinates);
    const currentWeather = instance.parseCurrentWeather(weatherData);
    const forecast = instance.buildForecastArray(weatherData);
    return [currentWeather, ...forecast];
  }
}

export default WeatherService;
