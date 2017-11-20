class Board {

  constructor(obj) {

    // these variables are for the timing of the piece dropping
    this.lastTime = 0;
    this.dropCounter = -1000;
    this.dropInterval = 1000;

    // how long they've been holding an arrow key down for
    this.downFor = 0;

    // define the bottom and right of the board per how many gridSizes
    // value is in pixels
    this.lowerLimit = gridHeight*gridSize;
    this.rightLimit = gridWidth*gridSize;

    this.difficulty = 'Easy';
    this.diffColor = 'green';
    this.gridOn = true;

    // personal best
    let best = getCookie('personal_best');
    if (best) {
      best = best.replace(/[^0-9]/g, '');
    }
    this.best = best;

    // game state variables
    this.score = 5000;
    this.gameStarted = false;
    this.gameOver = false;

    // create a board grid, size (gridHeight) x (gridWidth)
    // boxes in the board are referenced:
    // matrix[row][col]
    // with [0][0] at the top-left
    let empty = new Array(gridHeight);

    for (let j=0; j<empty.length; j++) {
      empty[j] = new Array(gridWidth);

      for (let i=0; i<gridWidth; i++) {
        empty[j][i] = {
          pos:   {x: i, y: j},
          color: {r: 255, g: 255, b: 255},
          value: 0
        };
      }
    }

    this.matrix = empty;
  } // end of constructor()

  deleteRow(row) {
    // go through each row, starting at the full one, up to the top
    while (row > 0) {
      for (let i = 0; i < this.matrix[row].length; i++) {
        // move each row down by changing
        // its attributes to the one above it
        if (this.matrix[row-1][i].value == 1) {
          this.matrix[row][i].value = 1;
          this.matrix[row][i].color = this.matrix[row-1][i].color;
        }
        else {
          this.matrix[row][i].value = 0;
          this.matrix[row][i].color = {r: 255, g: 255, b: 255};
        }
      }
      row--;
    }
  }

  // checks if any rows are full
  checkIfRowsFull() {

    // go through each row
    for (let j=1; j<this.matrix.length; j++) {

      // go through each column
      for (let i=0; i<this.matrix[j].length; i++) {

        if (this.matrix[j][i].value == 0) {
          // go to next row
          break;
        }
        // we are at the last column, all values are 1
        else if (i == this.matrix[j].length-1) {
          // delete row j
          this.deleteRow(j);
          this.checkIfRowsFull();
          return;
        }
      }
    }

    return;

  }

  // add a new piece to the board
  addPiece(piece) {

    for (let j=0; j<piece.matrix.length; j++) {
      for (let i=0; i<piece.matrix[j].length; i++) {
        let value = piece.matrix[j][i];

        // new piece overlaps with board, game over
        if (value == 1
          && this.matrix[j+piece.pos.y][i+piece.pos.x].value == 1) {
          this.gameOver = true;
        }
      }
    }

    if (!this.gameOver) {
      // go through every element in the piece (4x4)
      for (let j=0; j<piece.matrix.length; j++) {
        for (let i=0; i<piece.matrix[j].length; i++) {
          let value = piece.matrix[j][i];

          // if its value is 1, save its state in the (Board)
          if (value == 1) {
            this.matrix[j+piece.pos.y][i+piece.pos.x].value = 1;
            this.matrix[j+piece.pos.y][i+piece.pos.x].color.r = piece.color.r;
            this.matrix[j+piece.pos.y][i+piece.pos.x].color.g = piece.color.g;
            this.matrix[j+piece.pos.y][i+piece.pos.x].color.b = piece.color.b;
          }
        }
      }
      // check if any rows are full
      this.checkIfRowsFull();
    }
  }

  // draw the entire board
  draw() {
    push();

    // draw game borders
    // border color, dark gray
    fill(100);
    noStroke();
    // top
    rect(0, 0, this.rightLimit+gridSize, gridSize);
    // left
    rect(0, 0, gridSize, this.lowerLimit+gridSize);
    // right
    rect(this.rightLimit+gridSize, 0, gridSize, this.lowerLimit+gridSize);
    // bottom
    rect(0, this.lowerLimit+gridSize, this.rightLimit+2*gridSize, gridSize);

    // post current high score
    fill(255);
    textSize(25);
    text('Score: ' + this.score, 80, 26);
    text('Best: ' + this.best, 300, 26);

    // grid color, light gray
    stroke(200);

    // we need to translate because the grid is off by 1 gridSize
    // because of the game border
    translate(gridSize, gridSize);

    // go through every element of the entire board matrix
    // (gridHeight) x (gridWidth)
    for (let j=0; j<this.matrix.length; j++) {
      for (let i=0; i<gridWidth; i++) {
        // if the value is 1, draw the box (gridSize) x (gridSize)
        let box = this.matrix[j][i];
        if (box.value == 1 || this.gridOn) {
          fill(
            box.color.r,
            box.color.g,
            box.color.b
          );
          rect(
            box.pos.x*gridSize,
            box.pos.y*gridSize,
            gridSize,
            gridSize
          );
        }
      }
    }
    pop();
  } // end of draw()

} // end of Board class
