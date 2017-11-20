let port = 8080;
let fs = require('fs');
let path = require('path');
let dir = require('node-dir');
let express = require('express');
let serve = require('serve-static');
let rfs = require('rotating-file-stream');
let morgan = require('./morgan.js');
let http = require('http');
let socket_io = require('socket.io');
let repl = require('repl');

let app = express();
let srv = http.createServer(app);
let io = socket_io(srv);
let r = repl.start();

let logging = true;
function console_log(...data) {
  if (logging) {
    console.log(data.join(' '));
  }
}

function setContext(list) {
  for (let el in list) {
    r.context[el] = list[el];
  }
}

// Middleware

// ensure log directory exists
let logDirectory = path.join(__dirname, 'access-logs');
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

// create a rotating write stream
let accessLogStream = rfs('access.log', {
  interval: '1d', // rotate daily
  path: logDirectory
});

// setup the logger
app.use(morgan('csv', {stream: accessLogStream}));
// app.use(morgan(':remote-addr [:date[custom]] :method :url'));

// set static path
app.use(serve(path.join(__dirname, 'public')));


// global vars
app.use(function(req, res, next) {
  res.locals.errors = null;
  next();
});

let globals = {};
globals.users = {};

io.on('connection', function(socket) {

  // a user connected, create a player
  console_log('a user connected:', socket.id);
  // globals.users[socket.id] = new User(socket.id);

  // a user disconnected, delete their instance
  socket.on('disconnect', function() {
    console_log('user disconnected:', socket.id);
    delete globals.users[socket.id];
    io.emit('update:player_list', globals.users);
  });

  socket.on('set:player', function(player) {
    console_log('name set to: ' + player.name);
    console_log('best set to: '+ player.board.best);
    globals.users[socket.id] = player;
    io.emit('update:player_list', globals.users);
  });

  socket.on('send:player:challenge', function(challenge_id) {
    console_log(socket.id + ' challenges ' + challenge_id);
    socket.to(challenge_id).emit('send:player:challenge',
      globals.users[socket.id]);
  });

  socket.on('send:player:accept_challenge', function(challenger_id) {
    console_log(socket.id + ' accepts ' + challenger_id);
    socket.to(challenger_id).emit('send:player:accept_challenge',
      globals.users[socket.id]);
  });

  socket.on('send:player:reject_challenge', function(challenger_id) {
    console_log(socket.id + ' rejects ' + challenger_id);
    socket.to(challenger_id).emit('send:player:reject_challenge',
      globals.users[socket.id]);
  });

  socket.on('get:opponent', function(opponent_id) {
    socket.to(opponent_id).emit('get:player', socket.id);
  });

  socket.on('update:player', function(opponent_id, player) {
    socket.to(opponent_id).emit('update:opponent', player);
  });

  // socket.on('update:player_list', function(data) {
  //   io.emit('update:player_list', globals.users);
  // });

  // socket.on('request:player_list', function(data, fn) {
  //   fn(globals.users);
  // });

});

srv.listen(port, function() {
  console.log('Server started at localhost:' + port);
});

setContext({
  app, srv, io, r, globals
});
