/**
 * Created by jaehong on 2017. 11. 27..
 */
const express = require('express');
const server = require('../../server');

const router = express.Router();

// 모든 방 정보
router.get('/', (req,res) => {
  res.json({result: server.rooms});
})
;

router.post('/', (req,res) => {
  server.rooms.push(req.body.data);
res.json({result: 'ok'});
})
;

// 방 정보 가져오기
router.get('/:id', (req, res) => {
  console.log('call room info check test ');
res.json({
  result: server.rooms.find(obj => {
    return obj.name === req.params.id;
})
})
;
})
;


router.post('/:id', (req, res) => {
  const room = server.rooms.find(o => o.name === req.params.id
)
;
// 게임 방에 빈 자리가 있는지?
if (room['userCount'] < room['maxUser']) {
  room['userCount']++;
  room['users'].push(req.body.data);
  res.json({result: true});
} else res.json({result: false});

console.log('router/post/room/:id', room);

})
;

router.put('/', (req, res) => {
  console.log(req.body.room);

server.rooms.find(obj => {
  if(obj.name === req.body.room.name)
{
  obj.password = req.body.room.password;
  obj.type = req.body.room.type;
  obj.gamecnt = req.body.room.gamecnt;
  obj.curcnt = req.body.room.curcnt;
  obj.timeOut = req.body.room.timeOut;
  obj.mode = req.body.room.mode;
  obj.maxUser = req.body.room.maxUser;
  obj.game = req.body.room.game;

}
;
})
console.log('room update test');

});

/**
 *
 *  User.update({id: req.params.id}, {image: req.body.image}, function (err, doc) {
    if (err) {
      console.log(err);
    }
    console.log('update success');
    res.send(doc);
  })


 name: string;
 password: string;
 type: string;
 maxUser: number;
 userCount: number;
 users: string[];
 painter: string;
 mode: boolean; // false : human, true : com
 gamecnt: number; // 이방에서 설정한 게임 수
 curcnt: number; // 현재 게임수는 1부터 카운트해서 올라감 gamecnt가 되면 초기화 시키고 처음 상태로 돌아감
 timeOut: number; // curcnt가 0이면 게임이 시작하지 않은것!
 remainSec: number;
 */
module.exports = router;
