const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const wordSchema = new Schema({
  word : String,
  description : String
});

module.exports = mongoose.model('word', wordSchema);
