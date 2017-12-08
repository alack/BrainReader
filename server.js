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
db.once('open', function(){
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
const port = process.env.PORT || '3000';
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

io.sockets.on('connection', socket => {
    // Join Room
  socket.on('joinroom', data => {
    console.log('come join event');
    if(socket.room) {
      socket.leave(socket.room);
      if(socket.room == 0)
        getUserList();
    }

    socket.room = data.roomId;
    socket.join(socket.room);
    socket.userName = data.userName;
    console.log('roomjoin::roomid : ', socket['room']);
    console.log('roomjoin::userName : ', socket['userName']);
    // io.sockets.clients(socket.roomname);
    // console.log('my room users : ', io.sockets.clients(socket.roomname));
    io.sockets.in(socket.room).emit('message', {name: socket.userName, msg: socket.userName + ' is coming'});
    io.sockets.in(socket.room).emit('person_join', {user: socket.userName});
  });
  // Broadcast to room
  socket.on('send:message', function(data) {
    console.log('send:message:: : ', socket.room,' msg : ', data.message);
    const roomnum = exports.rooms.findIndex(o => o.name === socket.room);
    // 그리는 사람은 어떤 대화를 대화를 쳐도 말을 할 수 없음.
    if (socket.userName === exports.rooms[roomnum].painter)
      data.message = '저는 말을 할 수 없습니다.';
    io.sockets.in(socket.room).emit('message', {name: socket.userName, msg: data.message});
    if(exports.truewords[socket.room].word === data.message) {
      // io.sockets.in('room'...)으로는 그림 삭제, 단어 삭제
      const room = exports.rooms.find(o => o.name === socket.room);
      const dangchumUser = room.users[Math.floor(room.userCount * Math.random())];
      console.log('send:message::dangchum : ', dangchumUser);
      io.sockets.in(socket.room).emit('PICremove', {dangchum: dangchumUser});
      // broadcast로는 드로잉 권한 삭제 trigger
      socket.broadcast.emit('drawingauthremove');
      // io.sockets.in('room'...)으로는 정답자 알림
      io.sockets.in(socket.room).emit('message', {name: 'system', msg: socket.userName + '님이 정답을 맞추셨습니다.'});
      // socket.emit()으로는 드로잉 권한 부여, 단어 불러오기 트리거 발동
      exports.rooms[roomnum].painter = socket.userName;
      socket.emit('nexthuman');
      io.sockets.in(socket.room).emit('wordremove');
    }
  });
  socket.on('startline', function (data) {
    console.log('startline::roomid : ', socket.room);
    console.log('startline::ab.x: %s, ab.y: %s', data.x, data.y);
    io.sockets.in(socket.room).emit('startpath', data);
  });
  socket.on('moveline', function (data) {
    console.log('moveline::roomid : ',socket.room);
    console.log('moveline::ab.x: %s, ab.y: %s',data.x, data.y);
    io.sockets.in(socket.room).emit('movepath', data);
  });
  socket.on('finishline', function (data) {
    console.log('finishline::roomid : ',socket.room);
    console.log('finishline::ab.x: %s, ab.y: %s',data.x, data.y);
    io.sockets.in(socket.room).emit('finishpath', data);
  });

  socket.on('getuserlist', function (id) {
    getUserList(id);
  });
  socket.on('serverready', function(){
    const user = {};
    io.sockets.in(socket.room).emit('ioready',user);
  });
  socket.on('disconnect', data => {
    // socket.leave
    getUserList();
  });
});

function getUserList(id = 0) {
    const users = [];
    io.in(id).clients((err, clients) => {
      // console.log(io.sockets.connected[clients[0]]); // an array containing socket ids in 'room3'
      clients.forEach(client => {
        // console.log(io.sockets.connected[client].userName);
        users.push(io.sockets.connected[client].userName);
      });
      console.log('getuserlist from room ' + id, users);
      io.sockets.in(id).emit('getuserlist', {users: users });
    });
}
