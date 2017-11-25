/**
 * Created by jaehong on 2017. 11. 25..
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  id: String,
  password: String,
  attempt: Number,
  correct: Number,
  points: Number
});

module.exports = mongoose.model('user', userSchema);