const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const wordSchema = new Schema({
  word : String,
  category : String,
  description : String
});

module.exports = mongoose.model('word', wordSchema);
