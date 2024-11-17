import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

// Clase para encapsular los datos de una ciudad
class City {
  name: string;
  id: string;

  constructor(name: string, id: string) {
    this.name = name;
    this.id = id;
  }
}

// Servicio de historial
class HistoryService {
  private filePath: string;

  constructor() {
    this.filePath = path.join(__dirname, '../../data/searchHistory.json');
  }

  // Método privado para leer el archivo JSON
  private async read(): Promise<City[]> {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error: unknown) {
      if (error instanceof Error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
        // Si el archivo no existe, devuelve un arreglo vacío
        return [];
      }
      if (error instanceof Error) {
        // Si el error es un objeto Error, se lanza con un mensaje
        throw new Error(`Error reading file: ${error.message}`);
      }
      // Si el error no es un Error estándar, se lanza un error desconocido
      throw new Error('Unknown error occurred while reading file.');
    }
  }

  // Método privado para escribir en el archivo JSON
  private async write(cities: City[]): Promise<void> {
    try {
      const data = JSON.stringify(cities, null, 2);
      await fs.writeFile(this.filePath, data, 'utf-8');
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Error writing file: ${error.message}`);
      }
      throw new Error('Unknown error occurred while writing file.');
    }
  }

  // Método para obtener todas las ciudades del historial
  async getCities(): Promise<City[]> {
    return await this.read();
  }

  // Método para añadir una ciudad al historial
  async addCity(cityName: string): Promise<void> {
    try {
      const cities = await this.read();

      // Generar un ID único para la ciudad
      const id = crypto.randomUUID();

      // Verificar si la ciudad ya existe
      const exists = cities.some((city) => city.name.toLowerCase() === cityName.toLowerCase());
      if (exists) {
        throw new Error(`City "${cityName}" already exists in history.`);
      }

      // Agregar la nueva ciudad
      const newCity = new City(cityName, id);
      cities.push(newCity);

      // Escribir en el archivo
      await this.write(cities);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Error adding city: ${error.message}`);
      }
      throw new Error('Unknown error occurred while adding city.');
    }
  }

  // Método para eliminar una ciudad del historial
  async deleteCity(id: string): Promise<void> {
    try {
      const cities = await this.read();

      // Filtrar las ciudades para eliminar la correspondiente al ID
      const updatedCities = cities.filter((city) => city.id !== id);

      if (updatedCities.length === cities.length) {
        throw new Error(`City with ID "${id}" not found.`);
      }

      // Escribir el archivo actualizado
      await this.write(updatedCities);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Error removing city: ${error.message}`);
      }
      throw new Error('Unknown error occurred while removing city.');
    }
  }
}

export default new HistoryService();
