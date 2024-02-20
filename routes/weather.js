var express = require('express');
var router = express.Router();

const fetch = require('node-fetch');
const City = require('../models/cities');

API_KEY= process.env.OWM_API_KEY

router.post('/', (req, res) => {
    if (req.body.cityName) {
        // Check if the city has not already been added
        City.findOne({ cityName: { $regex: new RegExp(req.body.cityName, 'i') } }).then(dbData => {
            if (dbData === null) {
                // Request OpenWeatherMap API for weather data using city name
                fetch(`https://api.openweathermap.org/data/2.5/weather?q=${req.body.cityName}&appid=${API_KEY}&units=metric`)
                    .then(response => response.json())
                    .then(apiData => {
                        console.log(apiData.main.temp);
                        const newCity = new City({
                            cityName: req.body.cityName,
                            main: apiData.weather[0].main,
                            description: apiData.weather[0].description,
                            temperature: apiData.main.temp,
                            tempMin: Math.floor(apiData.main.temp_min),
                            tempMax: Math.floor(apiData.main.temp_max),
                        });

                        // Finally save in database
                        newCity.save().then(newDoc => {
                            res.json({ result: true, apiData: newDoc });
                        });
                    });
            } else {
                // City already exists in database
                res.json({ result: false, error: 'City already saved' });
            }
        });
    } else if (req.body.latitude && req.body.longitude) {
        // Request OpenWeatherMap API for weather data using coordinates
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${req.body.latitude}&lon=${req.body.longitude}&appid=${API_KEY}&units=metric`)
            .then(response => response.json())
            .then(apiData => {
                // Creates new document with weather data
                const newCity = new City({
                    cityName: apiData.name,
                    main: apiData.weather[0].main,
                    description: apiData.weather[0].description,
                    temp: apiData.main.temp,
                    tempMin: apiData.main.temp_min,
                    tempMax: apiData.main.temp_max,
                });

                // Finally save in database
                newCity.save().then(newDoc => {
                    res.json({ result: true, weather: newDoc });
                });
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
