const express = require('express');
const server = require('../../server');
const draw =  require('../../models/draw');
const router = express.Router();

//   created: Date,
//   category: String,
//   word: String,
//   image: Buffer

router.post('/', (req, res) => {
  const new_draw = new draw();
  const obj = {};
  obj.created = new_draw.created = new Date().toLocaleString();
  obj.category = new_draw.category = server.truewords[req.body['roomId']].category;
  obj.word = new_draw.word = server.truewords[req.body['roomId']].word;
  obj.image = new_draw.image = req.body['IMGbase64'];

  new_draw.save(function (err) {
    if (err) {
      console.log('save image error object : ', obj);
      res.json({result:false});
    }
    else {
      console.log('save image success object : ', obj);
      res.json({result: true, obj: obj});
    }
  });
});

router.get('/', (req, res) => {
  draw.count(function (err, count) {
    const rnd = Math.floor(Math.random()*count);
    draw.findOne().skip(rnd).exec(function (err, document) {
      if (err) {
        console.log('load image error object : ');
        res.json({result:false});
      }
      else {
        console.log('save image success object : ', document);
        server.truewords[req.query.roomId] = document;
        res.json({result: true, obj: document});
      }
    });
  });
});

module.exports = router;
