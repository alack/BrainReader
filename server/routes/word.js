
const express = require('express');

// models: word
const models_word = require('../../models/word');
const router = express.Router();
const server = require('../../server');

router.get('/word', (req, res) => {
  console.log('room::/word');
  models_word.count().exec(function (err, count) {
    const random = Math.floor(Math.random() * count);
    console.log('room::/word random value : %s, words cnt : %s', random, count);
    models_word.findOne().skip(random).exec(function (err, documents) {
      console.log('room::/word return word : %s', documents.word);
      if (!err) {
        server.truewords[req.query.roomId] = documents;
        console.log('room::/word roomId : %s word : %s', req.query.roomId, documents.word);
        res.json({result: "success", word: documents.word});
      }
      else
        res.json({result:"failed", word:documents.word});
    });
  });
});

router.post('/addWord', (req, res) => {
  const words = new models_word();
  words.word = req.body['word'];
  words.category = req.body['category'];
  words.description = 'ppap';
  models_word.find({ word: req.body['word'] },function(err) {
    if(err) {
      res.json({result: "save failed (duplicated)"});
    }
    else
      words.save(function(err) {
        console.log('room::addWord value : %s', words.word);
        if(err)
          res.json({result: "save failed (save error)"});
        else
          res.json({result: "save success"});
      });
  });

});

module.exports = router;
