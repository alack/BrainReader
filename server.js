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
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
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

app.use('/room', room);
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

io.sockets.on('connection', socket => {
    // Join Room
  socket.on('joinroom', data => {
    console.log('come join event');
    if(socket.room)
      socket.leave(socket.room);

    socket.room = data.roomId;
    socket.join('room' + data.roomId);
    socket.userName = data.userName;
    console.log('roomjoin::roomid : ', data['roomId']);
    console.log('roomjoin::userName : ', data['userName']);
    // io.sockets.clients(socket.roomname);
    // console.log('my room users : ', io.sockets.clients(socket.roomname));
    io.sockets.in('room' + data.roomId).emit('message', {name: socket.userName, msg: socket.userName + ' is coming'});
    io.sockets.in('room' + data.roomId).emit('person_join', {user: user});
  });
  // Broadcast to room
  socket.on('send:message', function(data) {
    console.log('send:message:: : ', 'room' + data.roomId,' msg : ', data.message);
     io.sockets.in('room' + data.roomId).emit('message', {name: socket.userName, msg: data.message});
  });
  socket.on('startline', function (data) {
    console.log('startline::roomid : ', 'room' + data.roomId);
    console.log('startline::ab.x: %s, ab.y: %s', data.x, data.y);
    io.sockets.in('room' + data.roomId).emit('startpath', data);
  });
  socket.on('moveline', function (data) {
    console.log('moveline::roomid : ','room' + data.roomId);
    console.log('moveline::ab.x: %s, ab.y: %s',data.x, data.y);
    io.sockets.in('room' + data.roomId).emit('movepath', data);
  });
  socket.on('finishline', function (data) {
    console.log('finishline::roomid : ','room' + data.roomId);
    console.log('finishline::ab.x: %s, ab.y: %s',data.x, data.y);
    io.sockets.in('room' + data.roomId).emit('finishpath', data);
  });
  socket.on('getuserlist', function (id) {
    const users = [];
    io.in('room'+id).clients((err, clients) => {
      // console.log(io.sockets.connected[clients[0]]); // an array containing socket ids in 'room3'
      clients.forEach(client => {
        // console.log(io.sockets.connected[client].userName);
        users.push(io.sockets.connected[client].userName);
      })
      console.log('getuserlist from room' + id, users);
      io.sockets.in('room'+id).emit('getuserlist', {users: users });
    })
  })
  socket.on('disconnect', data => {
    // socket.leave
  });
});
