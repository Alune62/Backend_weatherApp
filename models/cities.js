const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const citySchema = new Schema({
  cityName: String,
  main: String,
  description: String,
  temp: Number, // Modifier le nom du champ temperature en temp
  tempMin: Number,
  tempMax: Number,
});

module.exports = mongoose.model('City', citySchema);
