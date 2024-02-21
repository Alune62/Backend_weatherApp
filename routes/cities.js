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


  module.exports = router;