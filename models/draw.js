const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const drawSchema = new Schema({
  writer: String,
  created: Date,
  category: String,
  name: String,
  image: Buffer
});

module.exports = mongoose.model('draw', drawSchema);
