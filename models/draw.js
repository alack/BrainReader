const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const drawSchema = new Schema({
  created: Date,
  category: String,
  word: String,
  image: Buffer
});

module.exports = mongoose.model('draw', drawSchema);
