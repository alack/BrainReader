/**
 * Created by jaehong on 2017. 11. 24..
 */
const express = require('express');
const User = require('../../models/user');
const server = require('../../server');

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
});

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
  user.image ='default';

  // 회원가입 시 default 이미지 받는다.
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
          // 접속하려는 아이디가 이미 접속자 아이디에 없을 경우 로그인됨
          if(!server.users.find(name => name === req.body.id)) {
            // if user is found and password is right create a token
            sess.name = req.body.id;
            server.users.push(req.body.id);
            res.json({success: true, session: sess.name});
          } else {
            // 중복 로그인에 걸리는 경우
            res.send({success: false, msg: 'Authentication failed. already logged in.'});
          }
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
        server.users.splice(server.users.indexOf(sess.name), 1);
        res.json({result: true});
      }
    });
  } else {
    res.redirect({result: true});
  }
});

// 로그인 유저의 정보 반환
router.get('/me', (req, res) => {
  // console.log('req.session : ', req.session);
  // console.log('req.session.name : ', req.session.name);
  if(req.session.name) {
      User.findOne({
        id: req.session.name
      }, (err, user) => {
        console.log(user.id);
        res.json(user);
      });
  } else {
    res.json({result :'failed'});
  }
});

router.get('/check', (req, res) => {
  // console.log(req.session);
  if(typeof(req.session.name) != 'undefined') {
    // 유저가 접속해있으면
    if(typeof(server.users.find(name => name === req.session.name)) =='undefined') {
      res.json({result :'failed'});
    } else {
      User.findOne({
        id: req.session.name
      }, (err, user) => {
        server.users.push(user.id);
        res.json(user);
      });
    }
  } else {
    res.json({result :'failed'});
  }
});




router.get('/:id/findUser',(req,res)=>{

   User.findOne({
    id: req.params.id
  }, (err, user) => {
    res.json(user);
  });

});


router.put('/:id',(req,res) => {
  console.log('server part update');
  User.update({id: req.params.id}, {image: req.body.image}, function (err, doc) {
    if (err) {
      console.log(err);
    }
    console.log('update success');
    res.send(doc);
  })
});


module.exports = router;
