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

  router.get('/location', async (req, res) => {
    const { lat, lon } = req.query;
    const API_KEY = process.env.OWM_API_KEY; // Replace with your OpenWeatherMap API key
  
    try {
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
      const data = await response.json();
  
      if (data.cod === 200) { // Check for successful API response (code 200)
        const userLocation = {
          cityName: data.name, // Assuming 'name' property contains city name
          main: data.weather[0].main,
          description: data.weather[0].description,
          temp: Math.floor(data.main.temp - 273.15),
          tempMin: Math.floor(data.main.temp_min - 273.15),
          tempMax: Math.floor(data.main.temp_max - 273.15),
        };
        res.json({ result: true, weather: userLocation });
      } else {
        console.warn("Error fetching weather data:", data.message); // Use message from API response
        res.status(400).json({ error: "Error retrieving city name" }); // More specific error message
      }
    } catch (error) {
      console.error("Error fetching weather data:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  

  module.exports = router;