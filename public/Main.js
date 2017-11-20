// the size of 1 block
let gridSize = 35;

// how many blocks wide/high is the grid
let gridWidth = 12;
let gridHeight = 15;

let socket;
let player;

let mainCanvas;
let nameInput;
let playerList;
let challengeAlert;
let startGameBtn;
let difficultyBtn;
let changeNameBtn;
let submitNameBtn;
let playAgainBtn;
let easyBtn;
let medBtn;
let hardBtn;
let creditsBtn;

var getBestName;
var getBestScore;

let logging = true;
function console_log(...data) {
  if (logging) {
    console.log(data.join(' '));
  }
}

function submitNameForm() {
  let name = nameInput.value();
  if (name) {
    player.name = nameInput.value();
    setCookie('player_name', name, 365*100);
    socket.emit('set:player', player);
  }
  else {
    alert('Enter a name to join the game!');
  }
}

function set_html(obj, value) {
  let value_html = $('<div>' + value + '</div>').html();
  let obj_html = $('<div>' + obj.html() + '</div>').html();
  if (value_html != obj_html) {
    obj.html(value);
  }
}

p5.Element.prototype.setParent = function(value) {
  if (this.parent().id != value) {
    this.parent(value);
  }
  return this;
};

function spaces(n) {
  str = '';
  for (let i = 0; i < n; i++) {
    str += ' ';
  }
  return str;
}

function setup() {

  socket = io();

  socket.on('connect', () => {

    player.id = socket.id;

    // console_log(socket.id);
    // socket.emit('sid', 'dong');

    socket.emit('set:player', player);

    // socket.emit('request:player_list', '', function(data) {
    //   console_log(data);
    // });

    socket.on('update:player_list', function(data) {
      console.log('updating player list');

      player.users = data;
      $('#playerList').empty();

      for (let id in data) {

        let name = data[id].name;
        let best = data[id].board.best;
        if (name && id != socket.id) {

          if (player.challenger && id == player.challenger.id) {
            console.log(player.challenger);
            player.challenger = data[id];
          }
          // if (player.opponent && id == player.opponent.id) {
          //   player.opponent = data[id];
          // }

          name = name.replace(/[^a-zA-Z0-9 _-]/g, '');
          best = best.toString().replace(/[^0-9]/g, '');
          console_log(id, name, best);
          $('#playerList')
            .append($('<p></p>').addClass('playerListItem')
              .append($('<a></a>').addClass('playerListLink')
                .attr('href', '#').attr('id', id + '-link')
                .css('padding', '5px 0 5px 0')
                .text(name).click((e) => player.challenge(e, id)))
              .append($('<span></span>')
                .text(spaces(27-name.length-best.toString().length) + best)));
          let linkPos = $('#'+id+'-link').position();
          if (player.challengeStatus[id] === undefined) {
            player.challengeStatus[id] = {value: '', color: 'black'};
          }
          $('#playerList')
            .append($('<div>' + player.challengeStatus[id].value + '</div>')
              .css('color', player.challengeStatus[id].color)
              .css('left', (linkPos.left
                + (14*$('#'+id+'-link').html().length)) + 'px')
              .css('top', (linkPos.top+(10)) + 'px')
              .addClass('playerListStatus')
              .attr('id', id + '-status'));
        }
      }
    });

    socket.on('send:player:challenge', function(data) {
      console_log(data.name + ' challenges you!!!!!');
      if (!player.board.gameStarted && !player.connected && player.name) {
        player.challenger = data;
      }
    });

    socket.on('send:player:accept_challenge', function(data) {
      console_log(data.name + ' accepted your challenge');
      player.setChallengeStatus(data.id, '', 'black');
      player.connected = true;
      player.challenger = null;
      player.opponent = Object.create(data);
      player.opponent.board = new Board();
      player.updateOpponentBoard(data.board);
      player.opponent.piece = new Piece(player.opponent.board);
      player.updateOpponentPiece(data.piece);
      player.setOpponentUpdater();
    });

    socket.on('send:player:reject_challenge', function(data) {
      console_log(data.name + ' rejected your challenge');
      player.setChallengeStatus(data.id, '(Rejected)', 'red');
    });

    socket.on('get:player', function(opponent_id) {
      socket.emit('update:player', opponent_id, player);
    });

    socket.on('update:opponent', function(data) {
      player.updateOpponentBoard(data.board);
      player.updateOpponentPiece(data.piece);
    });

    $(window).on('beforeunload', function() {
      // Close all connections
      if (player.opponentUpdater) {
        clearInterval(player.opponentUpdater);
      }
      socket.close();
    });

  });

  initialize();
} // end of setup()

function initialize() {

  player = new Player();
  player.board = new Board();
  player.piece = new Piece(player.board);
  player.emptyBoard = new Board();

  // the canvas
  mainCanvas = createCanvas(
    (player.board.rightLimit+gridSize*2)*2,
    player.board.lowerLimit+gridSize*2)
    .id('mainCanvas').parent('canvasContainer');

  // high score input box
  nameInput = select('#nameInput').value(player.name);
  // list of online players
  playerList = select('#playerList');
  // you are being challenged, alert box
  challengeAlert = select('#challengeAlert');
  // "Start Game!"
  startGameBtn = select('#startGameBtn');
  // "Difficulty: Easy"
  difficultyBtn = select('#difficultyBtn');
  // "Change Name" link
  changeNameBtn = select('#changeNameBtn');
  // enter a name submit button
  submitNameBtn = select('#submitNameBtn');
  // "Play Again" (game over)
  playAgainBtn = select('#playAgainBtn');
  // Easy, Med, Hard buttons (game over)
  easyBtn = select('#easyBtn');
  medBtn = select('#medBtn');
  hardBtn = select('#hardBtn');
  // "addyh.github.io"
  creditsBtn = select('#creditsBtn');

  onClickEvents();

  if (typeof getBestName == 'undefined') {
    getBestName = function() {
      return 'Nobody';
    };
  }

  if (typeof getBestScore == 'undefined') {
    getBestScore = function() {
      return 0;
    };
  }

}

// Main Draw Loop
function draw() {

  // Keep these inputs hidden until needed
  nameInput.style('visibility', 'hidden');
  playerList.style('visibility', 'hidden');
  challengeAlert.style('visibility', 'hidden');
  startGameBtn.style('visibility', 'hidden');
  difficultyBtn.style('visibility', 'hidden');
  changeNameBtn.style('visibility', 'hidden');
  submitNameBtn.style('visibility', 'hidden');
  playAgainBtn.style('visibility', 'hidden');
  easyBtn.style('visibility', 'hidden');
  medBtn.style('visibility', 'hidden');
  hardBtn.style('visibility', 'hidden');
  creditsBtn.style('visibility', 'hidden');

  // clear screen every frame
  background(255);

  // Player's board screens

  // game over screen
  if (player.connected && player.board.gameOver) {
    gameOverScreen();
  }
  // main gameplay screen
  else if (player.connected  && player.board.gameStarted) {
    gameLoop();
  }
  // players are connected
  else if (player.connected) {
    // battleScreen();
    startScreen();
  }
  // waiting room
  else {
    // choose opponent screen
    if (player.name) {
      chooseOpponentScreen();
    }
    // enter name screen
    else {
      enterNameScreen();
    }
  }

  // Opponent board screens

  push();
  translate((player.board.rightLimit+gridSize*2), 0);

  // opponent screen
  if (player.connected && player.board.gameStarted) {
    opponentScreen();
  }
  // game over screen
  else if (!player.connected  && player.board.gameOver) {
    gameOverScreen();
  }
  // main gameplay screen
  else if (!player.connected && player.board.gameStarted) {
    gameLoop();
  }
  // singleplayer start screen
  else if (!player.connected && !player.board.gameStarted) {
    // battleScreen();
    startScreen();
  }

  pop();
} // end of draw() loop

// Main Gameplay Loop
function gameLoop() {

  // draw the game
  player.board.draw();
  player.piece.draw();

  // name
  push();
  fill(0);
  stroke(0);
  strokeWeight(1);
  textSize(20);
  if (player.name) {
    text(player.name, 45, 60);
  }
  pop();

  if (!player.piece.atBottom) {
    player.piece.lower();
  }

  // if they are holding down an arrow key
  // we need to remember how long
  if (keyIsDown(LEFT_ARROW)
        || keyIsDown(RIGHT_ARROW)
        || keyIsDown(DOWN_ARROW)) {
    player.board.downFor++;
  }

  // if it's been held down for 10 frames, and not at the bottom
  // then we can start moving the piece
  if (player.board.downFor > 5 && player.piece.atBottom == false) {
    if (keyIsDown(LEFT_ARROW))  {
      player.piece.move(-1);
    }
    else if (keyIsDown(RIGHT_ARROW)) {
      player.piece.move(1);
    }
    else if (keyIsDown(DOWN_ARROW)) {
      player.piece.goDown();
    }
  }
} // end of gameLoop()

// move by 1 gridSize with a simple arrow press
function keyPressed() {
  if (!player.piece.atBottom) {
    if (keyCode === LEFT_ARROW) {
      player.piece.move(-1);
    }
    else if (keyCode === RIGHT_ARROW) {
      player.piece.move(1);
    }
    else if (keyCode === DOWN_ARROW) {
      player.piece.goDown();
    }
  }
  if (keyCode == 32) {
    player.piece.matrix = player.piece.rotate();
  }
}

// when an arrow key is released,
// reset the down-pressed timer to zero
function keyReleased() {
  if (keyCode === LEFT_ARROW
        || keyCode === RIGHT_ARROW
        || keyCode === DOWN_ARROW) {
    player.board.downFor = 0;
  }
}
