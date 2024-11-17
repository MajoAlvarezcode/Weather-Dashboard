import { Router, type Request, type Response } from 'express';
const router = Router();

// import HistoryService from '../../service/historyService.js';
import HistoryService from '../../service/historyService.js';
// import WeatherService from '../../service/weatherService.js';
import WeatherService from '../../service/weatherService.js';

// TODO: POST Request with city name to retrieve weather data
router.post('/', async (req: Request, res: Response) => {
  // TODO: GET weather data from city name
  // TODO: save city to search history
  try {
    const { city } = req.body;
    if (!city) {
      return res.status(400).json({ error: 'City name is required.' });
    }

    // Obtener datos del clima
    const weatherData = await WeatherService.getWeatherByCity(city);

    // Guardar ciudad en el historial
    await HistoryService.addCity(city);

    return res.status(200).json({
      message: 'Weather data retrieved successfully.',
      data: weatherData,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error fetching weather data.' });
  }
});

// TODO: GET search history
router.get('/history', async (req: Request, res: Response) => {
  try {
    const history = await HistoryService.getcities();
    return res.status(200).json({ data: history });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error retrieving history.' });
  }
});

// * BONUS TODO: DELETE city from search history
router.delete('/history/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'ID is required.' });
    }

    await HistoryService.deletecity(id);

    return res.status(200).json({ message: 'City deleted from history.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error deleting city from history.' });
  }
});

export default router;
