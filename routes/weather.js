var express = require('express');
var router = express.Router();

const fetch = require('node-fetch');
const City = require('../models/cities');

API_KEY = process.env.OWM_API_KEY;
router.post('/', (req, res) => {
    if (req.body.cityName) {
        // Check if the city has not already been added
        City.findOne({ cityName: { $regex: new RegExp(req.body.cityName, 'i') } }).then(dbData => {
            if (dbData === null) {
                // Request OpenWeatherMap API for weather data using city name
                fetch(`https://api.openweathermap.org/data/2.5/weather?q=${req.body.cityName}&appid=${API_KEY}&units=metric`)
                    .then(response =>console.log(response.json()))
                    .then(apiData => {
                        console.log(apiData);
                        // Handle weather data retrieval
                        // Save new city to the database
                        const newCity = new City({
                            cityName: req.body.cityName,
                            main: apiData.weather[0].main,
                            description: apiData.weather[0].description,
                            temperature: Math.floor(apiData.main.temp), // Include temperature
                            tempMin: Math.floor(apiData.main.temp_min),
                            tempMax: Math.floor(apiData.main.temp_max),
                        });

                        newCity.save().then(() => {
                            // Respond with the newly added city data, including temperature
                            res.json({ result: true, weather: newCity });
                        });
                    })
                    .catch(error => {
                        console.error("Error fetching weather data or saving city:", error);
                        res.status(500).json({ result: false, error: "Error fetching weather data or saving city" });
                    });
            } else {
                // City already exists in database
                res.json({ result: false, error: 'City already saved' });
            }
        });
    } else {
        // Invalid request
        res.status(400).json({ result: false, error: 'Invalid request' });
    }
});



router.get('/', (req, res) => {
    City.find().then(data => {
        res.json({ weather: data });
    });
});

// Get weather data based on user's location
router.get("/location", (req, res) => {
    if (req.query.latitude && req.query.longitude) {
        // Request OpenWeatherMap API for weather data using coordinates
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${req.query.latitude}&lon=${req.query.longitude}&appid=${API_KEY}&units=metric`)
            .then(response => response.json())
            .then(apiData => {
                res.json({ result: true, weather: apiData });
            });
    } else {
        // Invalid request
        res.status(400).json({ result: false, error: 'Invalid request' });
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
