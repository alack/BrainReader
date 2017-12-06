/**
 * Created by jaehong on 2017. 11. 27..
 */
const express = require('express');
const server = require('../../server');

const router = express.Router();

// 모든 방 정보
router.get('/', (req, res) => {
  res.json({ result: server.rooms });
});

router.post('/', (req, res) => {
  server.rooms.push(req.body.data);
  res.json({ result: 'ok'});
})

// 방 정보 가져오기
router.get('/:id', (req, res) => {
  res.json({id: req.params.id })
})

router.post('/:id', (req, res) => {
  const room = server.rooms.find(o => o.name === req.params.id);
  // 게임 방에 빈 자리가 있는지?
  if(room['userCount'] < room['maxUser']) {
    room['userCount']++;
    room['users'].push(req.body.data);
    res.json({result: true});
  } else res.json({result: false});

  console.log('router/post/room/:id',room);

})

module.exports = router;