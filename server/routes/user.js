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

router.get('/admin', (req, res) => {
  const user = new User();

  user.id = 'admin';
  user.password = '1234';
  user.attempt = 0;
  user.correct = 0;
  user.points = 0;

  user.save(function(err){
    if(err){
      console.error(err);
      res.json({result: 0});
      return true;
    }
    res.json({result: 1});

  });
})

router.get('/rank', (req, res) => {
  // 포인트 상위 20명 가져 옴
   const query = User.find().sort('-points').limit(20);
   query.exec((err, users) => {
     res.json({result: users});
   })
})

// 회원가입
router.post('/', function (req, res) {

  console.log('user register node');
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
      return true;
    }
    res.json({result: 1});

  });
});

// 로그인 https://devdactic.com/restful-api-user-authentication-1/
router.post('/login', (req, res) => {
  const sess = req.session;
  console.log(req.body);
  User.findOne({
    id: req.body.id
  }, (err, user) => {
    if (err) throw err;

    if (!user) {
      res.send({success: false, msg: 'Authentication failed. User not found.'});
    } else {
      user.comparePassword(req.body.password, function (err, isMatch) {
        if (isMatch && !err) {
          // if user is found and password is right create a token

          sess.name = req.body.id;

          res.json({success: true, session: sess.name});

        } else {
          res.send({success: false, msg: 'Authentication failed. Wrong password.'});
        }
      });
    }
  });
});
// 로그아웃
router.post('/logout', (req, res) => {
  const sess = req.session;


  if(sess.name){
    req.session.destroy(err => {
      if(err) {
          console.log(err);
        }
        else {
        res.json({result: true});
      }
    });
  } else {
    res.redirect({result: true});
  }
});

// 로그인 유저의 정보 반환
router.get('/me', (req, res) => {
  User.findOne({
    id: req.session.name
  }, (err, user) => {
    res.json(user);
  });
})


module.exports = router;
