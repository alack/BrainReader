/**
 * Created by jaehong on 2017. 11. 24..
 */
// 필요한 모듈들을 가져온다.
const express = require('express');
const path = require('path');
const http = require('http');
const bodyParser = require('body-parser');
// mongoose
const mongoose = require('mongoose');
// 라우트를 받아온다.
const user = require('./server/routes/user');
const room = require('./server/routes/room');
const word = require('./server/routes/word');
const draw = require('./server/routes/draw');
const app = express();
// express-session
const session = require('express-session');
// mongodb에 연결
const db = mongoose.connection;
db.on('error', console.error);
db.once('open', function() {
  // CONNECTED TO MONGODB SERVER
  console.log("Connected to mongod server");
});

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/web-system-design', { useMongoClient: true });

// POST 데이터 파싱 설정
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));
// ng build 명령 실행시 생성되는 static 리소스 폴더 경로 및 이름 설정
app.use(express.static(path.join(__dirname, 'dist')));
// session 설정
app.use(session({
  secret: 'WEBSYSTEMDESIGN',
  resave: false,
  saveUninitialized: true
}));
// user
app.use('/user', user);
app.use('/word', word);
app.use('/room', room);
app.use('/draw', draw);
// 모든 경로에 대한 라우터 설정 및 반환 파일 경로 설정
app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});


// Port 설정
const port = process.env.PORT || '80';
app.set('port', port);

// HTTP 서버 생성
const server = http.createServer(app);

// 설정된 포트로 서버가 요청 대기
server.listen(port, function () {
  console.log(`Express running on localhost:${port}`);
});

const io = require('socket.io').listen(server);

exports.rooms = [];
exports.truewords = {};

setInterval(function () {
  if(exports.rooms){
    for(let room of exports.rooms) {
      if(room.name === "0") continue;
      console.log('setTimeout::room.curcnt : ', room.curcnt);
      if (room.curcnt) {
        console.log(room.name, ' room.remainSec ', room.remainSec)
        room.remainSec--;
        io.sockets.in(room.name).emit('updatesec', {remainSec: room.remainSec});
        if (!room.remainSec) {
          console.log(room.name, ' remainSec is zero!! ');
          holdPainter(room.name);
        }
      }
    }
  }
}, 1000);

io.sockets.on('connection', socket => {
    // Join Room
  socket.on('joinroom', data => {
    console.log('come join event');
    if ( socket.room ) {
      socket.leave( socket.room );
      getUserList( socket.room );
    }
    if ( data.roomId === '0' || (exports.rooms && exports.rooms.find(o => o.name === data.roomId)) ) {
      socket.room = data.roomId;
      socket.join( socket.room );
      socket.ready = false;
      socket.userName = data.userName;
      console.log('roomjoin::roomid : ', socket['room']);
      console.log('roomjoin::userName : ', socket['userName']);
      // io.sockets.clients(socket.roomname);
      // console.log('my room users : ', io.sockets.clients(socket.roomname));
      io.sockets.in(socket.room).emit('message', {name: socket.userName, msg: socket.userName + ' is coming'});
      getUserList(socket.room);
    }
  });
  // Broadcast to room
  socket.on('send:message', function(data) {
    console.log('send:message:: : ', socket.room,' msg : ', data.message);
    const roomnum = exports.rooms.findIndex(o => o.name === socket.room);
    // 그리는 사람은 어떤 대화를 대화를 쳐도 말을 할 수 없음.
    if (socket.room != '0' && socket.userName === exports.rooms[roomnum].painter && exports.rooms[roomnum].curcnt)
      data.message = '저는 말을 할 수 없습니다.';
    // 메세지를 전송함
    io.sockets.in(socket.room).emit('message', {name: socket.userName, msg: data.message});
    // 방이 가지는 실제 답 단어 목록은 객체라서 방이름으로 접근가능, 실제 답과 현재 메세지가 일치하고
    // 현재 방의 game stage 회수가 1이상이라면 답을 맞춘 것으로 인정하고 후속 동작을 한다.
    if(socket.room != '0' && exports.truewords[socket.room].word === data.message && exports.rooms[roomnum].curcnt) {
      // io.sockets.in(socket.room)으로는 그림 삭제
      const room = exports.rooms.find(o => o.name === socket.room);
      const dangchumUser = room.users[Math.floor(room.userCount * Math.random())];
      console.log('send:message::dangchum : ', dangchumUser);
      io.sockets.in(socket.room).emit('PICremove', {dangchum: dangchumUser});
      // broadcast로는 드로잉 권한 삭제 trigger
      socket.broadcast.emit('drawingauthremove');
      // io.sockets.in('room'...)으로는 정답자 알림
      io.sockets.in(socket.room).emit('message', {name: 'system', msg: socket.userName + '님이 정답을 맞추셨습니다.'});
      // 현재 방안의 단어를 모두 삭제
      io.sockets.in(socket.room).emit('wordremove');
      // 문제를 맞췄으므로 현재 게임수를 하나 증가시킴
      if(++exports.rooms[roomnum].curcnt <= exports.rooms[roomnum].gamecnt) {
        // game이 gamecnt에 도달하지 못했으므로 게임은 계속 된다.
        // socket.emit()으로는 드로잉 권한 부여, 단어 불러오기 트리거 발동
        exports.rooms[roomnum].painter = socket.userName;
        socket.emit('nexthuman', socket.userName);
      } else {
        // game이 gamecnt를 넘었으므로 게임이 종료되고 상태가 초기화 된다.
        io.sockets.in(socket.room).emit('gameend');
        io.in(socket.room).clients((err, clients) => {
          clients.forEach(client => {
            io.sockets.connected[client].ready = false;
          });
        });
        // trueword 지우기
        exports.truewords[socket.room] = '';
        // 시간 초기화
        exports.rooms[roomnum].curcnt = 0;
        exports.rooms[roomnum].painter='';
        exports.rooms[roomnum].remainSec = exports.rooms[roomnum].timeOut;
        getUserList(socket.room);
      }
    }
  });
  socket.on('startline', function (data) {
    // console.log('startline::roomid : ', socket.room);
    // console.log('startline::ab.x: %s, ab.y: %s', data.x, data.y);
    io.sockets.in(socket.room).emit('startpath', data);
  });
  socket.on('moveline', function (data) {
    // console.log('moveline::roomid : ',socket.room);
    // console.log('moveline::ab.x: %s, ab.y: %s',data.x, data.y);
    io.sockets.in(socket.room).emit('movepath', data);
  });
  socket.on('finishline', function (data) {
    // console.log('finishline::roomid : ',socket.room);
    // console.log('finishline::ab.x: %s, ab.y: %s',data.x, data.y);
    io.sockets.in(socket.room).emit('finishpath', data);
  });
  socket.on('clearcanvas', function () {
    io.sockets.in(socket.room).emit('clearcanvas');
  });
  socket.on('getuserlist', function (id) {
    getUserList( id );
  });
  socket.on('serverready', function() {
    // console.log('serverready from room ' + socket.room, ' socket.ready : ', socket.ready);
    socket.ready = !(socket.ready);
    // console.log('serverready from room ' + socket.room, ' socket.ready : ', socket.ready);
    getUserList(socket.room);
  });
  socket.on('sendcolor', data => {
    io.sockets.in(socket.room).emit('getcolor', {color: data})
  });
  socket.on('disconnect', data => {
    // socket.leave
    getUserList();
  });

});
function chkStart(id, roomusers) {
  var chk = true;
  roomusers.forEach(roomuser => {
    if(roomuser.ready == false)
      chk = false;
    // console.log('username : ', roomuser.userName, ' userReady : ', roomuser.ready);
  });
  exports.rooms.findIndex((room, roomidx) => {
    // console.log('chkstart chk result : ', chk, 'room curcnt : ', exports.rooms[roomidx].curcnt);
    if(chk && exports.rooms[roomidx].curcnt === 0) {
      // console.log('gamestart event result : ', chk);
      io.sockets.in(id).emit('gamestart');
      holdPainter(id);
    }
  });
}
// 랜덤으로 그릴사람 정해서 권한 부여하기 (맞춘 사람이 없거나 => 맞춘 사람 없이 시간이 끝난 경우)
function holdPainter(id) {
  console.log('server.js::holdPainter ');
  exports.rooms.find((room) => {
    if( room.name === id ) {
      // canvas 초기화
      io.sockets.in(id).emit('clearcanvas');
      // word 초기화
      io.sockets.in(id).emit('wordremove');
      if(++room.curcnt <= room.gamecnt) {
        // game이 gamecnt에 도달하지 못했으므로 게임은 계속 된다.
        // socket.emit()으로는 드로잉 권한 부여, 단어 불러오기 트리거 발동
        const dangchumUser = room.users[Math.floor(room.userCount * Math.random())];
        room.painter = dangchumUser;
        console.log('after holdPainter result room name : ', id, 'room painter : ', room.painter);
        io.sockets.in(id).emit('nexthuman', dangchumUser);
      } else {
        // game이 gamecnt를 넘었으므로 게임이 종료되고 상태가 초기화 된다. 어떻게 할까. 고민해보자.
        io.sockets.in(id).emit('gameend');
        exports.truewords[id] = '';
        io.in(id).clients((err, clients) => {
          clients.forEach(client => {
              io.sockets.connected[client].ready = false;
          });
        });
        // 시간 초기화
        room.curcnt = 0;
        room.painter = '';
        getUserList(id);
      }
      room.remainSec = room.timeOut;
      // 게임을 시작하거나 새로운 시간을 카운트 하게 될 경우 이 함수가 작동한다. 이때 timeOut을 줘서 max_time을 갱신하게 한다.
      io.sockets.in(room.name).emit('updatesec', { remainSec: room.remainSec, timeOut: room.timeOut });
    }
  });
};
function getUserList(id = 0) {
  const users = [], roomusers = [];
  io.in(id).clients((err, clients) => {
    // console.log(io.sockets.connected[clients[0]]); // an array containing socket ids in 'room3'
    clients.forEach(client => {
      // console.log(io.sockets.connected[client].userName);
      users.push(io.sockets.connected[client].userName);
      roomusers.push({userName: io.sockets.connected[client].userName, ready: io.sockets.connected[client].ready});
    });
    if( !users ) {
      exports.rooms.find((room,roomidx) => {
        if ( !room.userCount )
          exports.rooms.slice(roomidx,1);
      });
    } else {
      if (id == 0) {
        // console.log('getuserlist from room ' + id, users);
        io.sockets.in(id).emit('getuserlist', {users: users});
      } else {
        // console.log('gameroomuserlist from room ' + id, roomusers);
        io.sockets.in(id).emit('gameroomuserlist', {users: roomusers});
        // game start chk trigger
        chkStart(id, roomusers);
      }
    }
  });
}
