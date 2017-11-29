const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const drawSchema = new Schema({
  writer: String,
  created: Date,
  category: String,
  name: String,
  image: Buffer,
  time_stamp: [Number],
  xs: [Number],
  ys: [Number]
});

drawSchema.static({
  createCollection: function (in_times, in_xs, in_ys, callback) {
    var collection = [];
    var i = 0;
    var draw_time = sizeof(in_times);
    this.time_stamp = new Number[draw_time];
    this.xs = new Number[draw_time];
    this.ys = new Number[draw_time];

    in_times.forEach(function (item) {
      for(i = 0; i<draw_time; i++){
        this.time_stamp[i] = item;
      }
    });
    in_xs.forEach(function (item) {
      for(i = 0; i<draw_time; i++){
        this.x[i] = item;
      }
    });
    in_ys.forEach(function (item) {
      for(i = 0; i<draw_time; i++){
        this.ys[i] = item;
      }
    });
    callback(null, collection);
  }
});

module.exports = mongoose.model('draw', drawSchema);
