// First screen in multiplayer
function enterNameScreen() {

  // draw the grid
  player.emptyBoard.draw();

  // show buttons
  nameInput.style('visibility', 'visible');
  submitNameBtn.style('visibility', 'visible');
  creditsBtn.style('visibility', 'visible');

  // sanitize name and focus the input
  nameInput.value(nameInput.value().replace(/[^a-zA-Z0-9 _-]/g, ''));
  document.getElementById('nameInput').focus();

  push();

  // "Waiting Room"
  stroke(0);
  strokeWeight(2);
  textSize(40);
  text('Tetrix 2', 180, 100);
  strokeWeight(4);
  line(180, 105, 310, 105);

  // "Enter a name to play"
  strokeWeight(1);
  textSize(28);
  text('Enter a name to play:', 80, 150);

  pop();
} // end enterNameScreen()

// Second screen in multiplayer
function chooseOpponentScreen() {

  // draw the grid
  player.emptyBoard.draw();

  // show buttons
  changeNameBtn.style('visibility', 'visible');
  playerList.style('visibility', 'visible');
  creditsBtn.style('visibility', 'visible');

  // show challenge alert
  if (player.challenger) {
    challengeAlert.style('visibility', 'visible');
    set_html(challengeAlert, 'You are being challenged by:<br />'
      + '<h2>' + player.challenger.name + '</h2>'
      + '(Best Score: ' + player.challenger.board.best + ')' + '<br /><br />'
      + '<a id="acceptChallenge" href="#">Accept</a>'
      + '<a id="rejectChallenge" href="#">Reject</a>');
    $('#acceptChallenge').click((e) => player.acceptChallenge(e));
    $('#rejectChallenge').click((e) => player.rejectChallenge(e));
  }

  push();

  // "Welcome / Choose an Opponent"
  fill(0);
  stroke(0);
  strokeWeight(1);
  textSize(20);
  text(player.name, 45, 60);
  text('Choose an Opponent:', 45, 85);

  // "Waiting Room"
  fill(0);
  stroke(0);
  strokeWeight(2);
  textSize(40);
  text('Waiting Room', 120, 129);
  strokeWeight(4);
  line(120, 134, 375, 134);

  // "Name / Best Score"
  fill(0);
  stroke(0);
  textSize(20);
  strokeWeight(1);
  text('Name', 150, 165);
  text('Best Score', 345, 165);
  strokeWeight(2);

  pop();

} // end chooseOpponentScreen()

// Opponent's screen (multiplayer)
function opponentScreen() {

  // draw their board
  player.opponent.board.draw();
  player.opponent.piece.draw();

  // name
  push();
  fill(0);
  stroke(0);
  strokeWeight(1);
  textSize(20);
  text(player.opponent.name, 45, 60);
  pop();


} // end opponentScreen()

// First screen in singleplayer
function startScreen() {

  // High score
  let bestName = getBestName();
  let bestScore = getBestScore();

  if (!bestName || !bestScore) {
    bestName = 'Nobody';
    bestScore = 0;
  }

  // draw the grid
  player.emptyBoard.draw();

  // show buttons
  startGameBtn.style('visibility', 'visible');
  difficultyBtn.style('visibility', 'visible');
  creditsBtn.style('visibility', 'visible');

  if (!player.connected && !player.board.gameStarted) {
    startGameBtn.setParent('screenContainer_Right');
    difficultyBtn.setParent('screenContainer_Right');
  }

  // screen layout
  push();

  // name
  fill(0);
  stroke(0);
  strokeWeight(1);
  textSize(20);
  text('' + player.name, 45, 60);

  // high score
  fill(0);
  stroke(0);
  strokeWeight(1);
  textSize(35);
  textFont('Monospace');
  text('High Score:', 145, 253);
  let nameTextCount = bestName.length;
  let scoreTextCount = bestScore.toString().length;
  text(bestName + '\n', 230-(nameTextCount*9), 309);
  text(bestScore, 230-(scoreTextCount*9), 365);
  textFont('Arial');

  pop();
} // end of startScreen()

// Game Over Screen in singleplayer
function gameOverScreen() {

  let canPressEasy = (player.board.difficulty != 'Easy');
  let canPressMed = (player.board.difficulty != 'Med.');
  let canPressHard = (player.board.difficulty != 'Hard');

  // High score
  let bestName = getBestName();
  let bestScore = getBestScore();

  if (!bestName || !bestScore) {
    bestName = 'Nobody';
    bestScore = 0;
  }

  // Did player beat the all time high score?
  let newBestScore = isBestScore();
  let scoreDiff = (bestScore - player.board.score);

  // draw the board
  player.board.draw();

  // show butons
  playAgainBtn.style('visibility', 'visible');

  if (!player.connected && player.board.gameOver) {
    creditsBtn.style('visibility', 'visible');
    playAgainBtn.setParent('screenContainer_Right');
    easyBtn.setParent('screenContainer_Right');
    medBtn.setParent('screenContainer_Right');
    hardBtn.setParent('screenContainer_Right');
  }

  // game over screen
  push();

  // name
  fill(0);
  stroke(0);
  strokeWeight(1);
  textSize(20);
  text('' + player.name, 45, 60);

  // high score box
  strokeWeight(9);
  stroke(150);
  fill(40);
  rect(55, 220, 380, 250);

  // player beat the high score!
  if (newBestScore) {

    if (!player.submittedHighScore) {
      addBestScore(player.name, player.board.score);
      player.submittedHighScore = true;
    }

    // "congratulations"
    noStroke();
    fill(150);
    textSize(40);
    text('Congratulations!', 100, 280);
    textSize(30);
    text('You beat the High Score!', 80, 420);
    //text('Enter your name:', 80, 350);

    // final score
    fill('cyan');
    strokeWeight(1);
    textSize(50);
    textFont('Monospace');
    let scoreTextCount = player.board.score.toString().length;
    text(player.board.score, 245-(scoreTextCount*14), 360);
    textFont('Arial');

  }
  // player did not beat the high score
  else {
    noStroke();
    fill(150);
    textSize(18);
    text('Your score was:', 80, 270);
    fill('cyan');
    textSize(25);
    text(player.board.score, 220, 273);
    fill(150);
    textSize(18);
    text('That\'s only ' + scoreDiff + ' away from beating', 80, 300);
    text(bestName + '!', 80, 335);
    textSize(18);
    text('Play Medium or Hard to earn points faster!', 80, 365);
    textSize(25);
    strokeWeight(3);
    stroke(150);
    fill(40);

    easyBtn.style('visibility', 'visible');
    easyBtn.style('border', '');
    easyBtn.style('color', '');
    easyBtn.style('top', '');
    easyBtn.style('left', '');
    medBtn.style('visibility', 'visible');
    medBtn.style('border', '');
    medBtn.style('color', '');
    medBtn.style('top', '');
    medBtn.style('left', '');
    hardBtn.style('visibility', 'visible');
    hardBtn.style('border', '');
    hardBtn.style('color', '');
    hardBtn.style('top', '');
    hardBtn.style('left', '');

    // easy button
    if (!canPressEasy) {
      easyBtn.style('border', '3px solid rgb(150, 150, 150)');
      easyBtn.style('color', 'rgb(150, 150, 150)');
      easyBtn.style('top', '391px');
      easyBtn.style('left', '79px');
    }

    // medium button
    if (!canPressMed) {
      medBtn.style('border', '3px solid rgb(150, 150, 150)');
      medBtn.style('color', 'rgb(150, 150, 150)');
      medBtn.style('top', '391px');
      medBtn.style('left', '200px');
    }

    // hard button
    if (!canPressHard) {
      hardBtn.style('border', '3px solid rgb(150, 150, 150)');
      hardBtn.style('color', 'rgb(150, 150, 150)');
      hardBtn.style('top', '391px');
      hardBtn.style('left', '320px');
    }

  }

  pop();
} // end of gameOverScreen()
