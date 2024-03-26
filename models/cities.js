const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const citySchema = new Schema({
  cityName: String,
  main: String,
  description: String,
  temp: Number, 
  tempMin: Number,
  tempMax: Number,
});

module.exports = mongoose.model('City', citySchema);
