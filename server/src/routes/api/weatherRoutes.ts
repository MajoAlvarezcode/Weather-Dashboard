import { Router, type Request, type Response } from 'express';
const router = Router();

// import HistoryService from '../../service/historyService.js';
import HistoryService from '../../service/historyService';
// import WeatherService from '../../service/weatherService.js';
import WeatherService from '../../service/WeatherService'
// TODO: POST Request with city name to retrieve weather data

const weatherService = new WeatherService();


router.post('/', async (req: Request, res: Response) => {
  try {
    console.log(req.body.cityName);
    
    const { cityName } = req.body;
    if (!cityName) {
      return res.status(400).json({ msg: 'City name is required' });
    }

    // GET weather data from city name
    const weatherData = await weatherService.getWeatherForCity(cityName);

    // Save city to search history
    await HistoryService.addCity(cityName);

    return res.json(weatherData);
  } catch (err) {
    console.log('Error:', err);
    return res.status(500).json({ msg: 'Failed to retrieve weather data', error: err });
    // return err
  }
});

// TODO: GET search history
router.get('/history', async (_req: Request, res: Response) => {
  try {
    const history = await HistoryService.getCities();
    return res.json(history)
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error retrieving history.' });
  }
});

// * BONUS TODO: DELETE city from search history
router.delete('/history/:id', async (req: Request, res: Response) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ error: 'ID is required.' });
    }

    await HistoryService.deleteCity(req.params.id);

    return res.status(200).json({ message: 'City deleted from history.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error deleting city from history.' });
  }
});

export default router;
