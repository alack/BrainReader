/**
 * Created by jaehong on 2017. 11. 24..
 */
const express = require('express');
const User = require('../../models/user');

const router = express.Router();

// 모든 유저 정보
router.get('/', function (req, res) {
  User.find(function(err, users) {
    if (err) return res.status(500).send({ error: 'database failure' });
    res.json(users);
    // res.send('express works');
  });
});

// 회원가입
router.post('/', function (req, res) {
  const user = new User();

  user.id = req.body.id;
  user.password = req.body.password;
  user.attempt = 0;
  user.correct = 0;
  user.points = 0;

  user.save(function(err){
    if(err){
      console.error(err);
      res.json({result: 0});
    }
    res.json({result: 1});

  });
})
module.exports = router;