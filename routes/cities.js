var express = require('express');
var router = express.Router();
const City = require('../models/cities')

const fetch = require('node-fetch');

// Route pour récupérer les villes existantes
router.get('/', async (req, res) => {
    try {
      const cities = await City.find({}, 'cityName description tempMin tempMax main'); // Assurez-vous d'ajuster la requête en fonction de votre modèle de données
      res.json({ cities: cities });
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la récupération des villes' });
    }
  });


  module.exports = router;