class Player {
  constructor() {
    this.id = null;
    this.users = null;
    this.opponent = null;
    this.challenger = null;
    this.name = null;
    this.board = null;
    this.emptyBoard = null;
    this.piece = null;
    this.connected = false;
    this.challengeStatus = {};
    this.opponentUpdater = null;
    this.submittedHighScore = false;

    let name = getCookie('player_name');
    if (name) {
      name = name.replace(/[^a-zA-Z0-9 _-]/g, '');
    }
    this.name = name;

  }

  challenge(e, id) {
    e.preventDefault();
    console_log('sending challenge request');
    socket.emit('send:player:challenge', id);
    this.setChallengeStatus(id, '(Pending)', 'black');
  }

  acceptChallenge(e) {
    e.preventDefault();
    if (this.challenger) {
      console_log('accepting challenge');
      socket.emit('send:player:accept_challenge', this.challenger.id);
      this.opponent = Object.create(this.challenger);
      this.opponent.board = new Board();
      this.updateOpponentBoard(this.challenger.board);
      this.opponent.piece = new Piece(this.opponent.board);
      this.updateOpponentPiece(this.challenger.piece);
      this.setOpponentUpdater();
      this.connected = true;
      this.challenger = null;
    }
  }

  rejectChallenge(e) {
    e.preventDefault();
    if (this.challenger) {
      console_log('rejecting challenge');
      socket.emit('send:player:reject_challenge', this.challenger.id);
      this.challenger = null;
    }
  }

  setChallengeStatus(id, value, color) {
    set_html($('#'+id+'-status'), value);
    $('#'+id+'-status').css('color', color);
    this.challengeStatus[id] = {
      value: value,
      color: color
    };
  }

  setOpponentUpdater() {
    let _this = this;
    this.opponentUpdater = setInterval(function() {
      socket.emit('get:opponent', player.opponent.id, function(data) {
        console.log('updating');
        _this.updateOpponentBoard(data.board);
        _this.updateOpponentPiece(data.piece);
      });
    }, 1000);
  }

  updateOpponentBoard(obj) {
    this.opponent.board.lastTime = obj.lastTime;
    this.opponent.board.dropCounter = obj.dropCounter;
    this.opponent.board.dropInterval = obj.dropInterval;
    this.opponent.board.downFor = obj.downFor;
    this.opponent.board.lowerLimit = obj.lowerLimit;
    this.opponent.board.rightLimit = obj.rightLimit;
    this.opponent.board.difficulty = obj.difficulty;
    this.opponent.board.diffColor = obj.diffColor;
    this.opponent.board.gridOn = obj.gridOn;
    this.opponent.board.best = obj.best;
    this.opponent.board.score = obj.score;
    this.opponent.board.gameStarted = obj.gameStarted;
    this.opponent.board.gameOver = obj.gameOver;
    this.opponent.board.matrix = obj.matrix;
  }

  updateOpponentPiece(obj) {
    this.opponent.piece.shape = obj.shape;
    this.opponent.piece.pos = obj.pos;
    this.opponent.piece.color = obj.color;
    this.opponent.piece.matrix = obj.matrix;
    this.opponent.piece.atBottom = obj.atBottom;
    this.opponent.piece.board = obj.board;
  }

}
