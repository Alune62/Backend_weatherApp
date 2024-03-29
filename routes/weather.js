var express = require('express');
var router = express.Router();

const fetch = require('node-fetch');
const City = require('../models/cities');

const API_KEY = process.env.OWM_API_KEY;

router.post('/', async (req, res) => {
  if (!req.body.cityName) {
    return res.status(400).json({ result: false, error: 'Invalid request' });
  }

  try {
    const existingCity = await City.findOne({ cityName: { $regex: new RegExp(req.body.cityName, 'i') } });

    if (existingCity) {
      return res.json({ result: false, error: 'City already saved' });
    }

    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${req.body.cityName}&appid=${API_KEY}&units=metric`);
    const apiData = await response.json();

    const newCity = new City({
      cityName: req.body.cityName,
      main: apiData.weather[0].main,
      description: apiData.weather[0].description,
      temp: Math.floor(apiData.main.temp),
      tempMin: Math.floor(apiData.main.temp_min),
      tempMax: Math.floor(apiData.main.temp_max),
    });
    await newCity.save();
    res.json({ result: true, weather: newCity });
  } catch (error) {
    console.error("Error fetching weather data or saving city:", error);
    res.status(500).json({ result: false, error: "Error fetching weather data or saving city" });
  }
});

router.get('/', (req, res) => {
    City.find().then(data => {
        res.json({ weather: data });
    });
});

// Get weather data based on user's location
app.get('/location', async (req, res) => {
    const { lat, lon } = req.query;
    const API_KEY = 'Votre_API_Key'; // Remplacez par votre clé API OpenWeatherMap
  
    try {
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

router.get("/:cityName", (req, res) => {
    City.findOne({
        cityName: { $regex: new RegExp(req.params.cityName, "i") },
    }).then(data => {
        if (data) {
            res.json({ result: true, weather: data });
        } else {
            res.json({ result: false, error: "City not found" });
        }
    });
});

router.delete("/:cityName", (req, res) => {
    City.deleteOne({
        cityName: { $regex: new RegExp(req.params.cityName, "i") },
    }).then(deletedDoc => {
        if (deletedDoc.deletedCount > 0) {
            // document successfully deleted
            City.find().then(data => {
                res.json({ result: true, weather: data });
            });
        } else {
            res.json({ result: false, error: "City not found" });
        }
    });
});

module.exports = router;
