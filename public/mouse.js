let xDir;
let yDir;
let lastX;
let lastY;

// global mouse down event
function mousePressed() {
  lastX = mouseX;
  lastY = mouseY;
  xDir = 0;
  yDir = 0;
}

// global mouse dragged event
function mouseDragged() {
  // calculate the direction they are dragging the mouse
  xDir = mouseX - lastX;
  yDir = mouseY - lastY;
}

// global mouse up event
function mouseReleased() {
  if (player.board.gameStarted) {
    // move down
    if (yDir > 50) {
      player.piece.goDown();
    }
    // move right
    else if (xDir > 50) {
      player.piece.move(1);
    }
    // move left
    else if (xDir < -50) {
      player.piece.move(-1);
    }
    // rotate the piece
    else if (xDir >= -50 && xDir <= 50) {
      player.piece.matrix = player.piece.rotate();
    }
  }
}

// global mouse clicked event
// mouse has been fully pressed and released
function mouseClicked() {
  console.log(mouseX, mouseY);
}

function onClickEvents() {

  // submit the form when they press enter
  $('#nameForm').submit(function(e) {
    e.preventDefault();
    submitNameForm();
  });

  $('#submitNameBtn').click(function(e) {
    e.preventDefault();
    submitNameForm();
  });

  $('#changeNameBtn').click(function(e) {
    e.preventDefault();
    player.name = null;
    setCookie('player_name', '', -1);
    socket.emit('set:player:name', player.name);
  });

  $('creditsBtn').click(function(e) {
    e.preventDefault();
    window.location.href = 'https://addyh.github.io';
  });

  $('#startGameBtn').click(function(e) {
    e.preventDefault();
    player.board.gameStarted = true;
  });

  $('#difficultyBtn').click(function(e) {
    e.preventDefault();
    if (player.board.difficulty == 'Easy') {
      player.board.difficulty = 'Med.';
      player.board.diffColor = 'orange';
      player.board.dropInterval = 300;
    }
    else if (player.board.difficulty == 'Med.') {
      player.board.difficulty = 'Hard';
      player.board.diffColor = 'red';
      player.board.dropInterval = 100;
    }
    else if (player.board.difficulty == 'Hard') {
      player.board.difficulty = 'Easy';
      player.board.diffColor = 'green';
      player.board.dropInterval = 1000;
    }
    difficultyBtn.style('color', player.board.diffColor);
    set_html(difficultyBtn, 'Difficulty: ' + player.board.difficulty);
  });

  $('#playAgainBtn').click(function(e) {
    e.preventDefault();
    let oldBoard = player.board;
    player.board = new Board();
    player.piece = new Piece(player.board);
    player.board.gameStarted = true;
    player.board.difficulty = oldBoard.difficulty;
    player.board.diffColor = oldBoard.diffColor;
    player.board.dropInterval = oldBoard.dropInterval;
    player.submittedHighScore = false;
  });

  $('#easyBtn').click(function(e) {
    e.preventDefault();
    player.board.difficulty = 'Easy';
    player.board.diffColor = 'green';
    player.board.dropInterval = 1000;
  });

  $('#medBtn').click(function(e) {
    e.preventDefault();
    player.board.difficulty = 'Med.';
    player.board.diffColor = 'orange';
    player.board.dropInterval = 300;
  });

  $('#hardBtn').click(function(e) {
    e.preventDefault();
    player.board.difficulty = 'Hard';
    player.board.diffColor = 'red';
    player.board.dropInterval = 100;
  });
}

// touch-screen functions
function touchStarted() {
  mousePressed();
  //return false;
}

function touchMoved() {
  mouseDragged();
  //return false;
}

function touchEnded() {
  mouseClicked();
  mouseReleased();
  //return false;
}

function hovering() {
  return false;
}
