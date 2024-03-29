var express = require('express');
var router = express.Router();
const City = require('../models/cities')

const fetch = require('node-fetch');

// Route pour récupérer les villes existantes
router.get('/', async (req, res) => {
    try {
      const cities = await City.find({}, 'cityName description tempMin tempMax main'); 
      res.json({ cities: cities });
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la récupération des villes' });
    }
  });

  // Get weather data based on user's location
router.get('/location', async (req, res) => {
  const { lat, lon, cityName } = req.query;
  const API_KEY = process.env.OWM_API_KEY; // Remplacez par votre clé API OpenWeatherMap

  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
    const data = await response.json();
    const userLocation = {
      cityName: cityName,
      main: data.weather[0].main,
      description: data.weather[0].description,
      temp: Math.floor(data.main.temp - 273.15),
      tempMin: Math.floor(data.main.temp_min - 273.15),
      tempMax: Math.floor(data.main.temp_max - 273.15),
    };
    res.json({ result: true, weather: userLocation });
  } catch (error) {
    console.error("Error fetching weather data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

  module.exports = router;