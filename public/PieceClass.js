// define a Piece as a 2-d array of blocks
class Piece {

  constructor(board) {
    this.init(board);
  }

  init(board) {
    // set to 1 for testing
    // what is the piece shape
    this.shape = round(random(0,6));

    // position of the piece's top-left corner, not yet scaled by gridSize
    // so every 1 position, translates to X gridSize in (this.draw())
    // (POS) * (GRIDSIZE) = PIXEL
    this.pos = {x: 4, y: -1};       // ****** UNITARY ******
    this.color = {r: random(0,200), g: random(0,200), b: random(0,200)};
    this.matrix = makeMatrix(this.shape);
    this.atBottom = false;
    this.board = board;
  }

  // draw the piece on the board using its (pos) (color) and (matrix)
  // scaled by (gridSize)
  draw() {
    push();
    // bring it down once because of the border
    translate(gridSize, gridSize);
    // grid color, light gray
    stroke(200);

    // loop through every element of the piece matrix (4x4)
    for (let y=0; y<this.matrix.length; y++) {
      let row = this.matrix[y];

      for (let x=0; x<row.length; x++) {
        let value = row[x];

        // draw boxes where the matrix has value 1
        if (value != 0) {
          //noStroke();
          fill(this.color.r, this.color.g, this.color.b);
          rect(
            // we're adding here because:
            // start at the top-left of the piece
            // x and y determine which element of the (matrix)
            // we are on, so add that to the piece's position (pos)
            // to draw that individual box
            // ****************************************************
            // The multiplication here is why everywhere else,
            //     ----------   (pos) is unitary    -----------
            // This is the only place we scale (pos) by (gridSize)
            // Anywhere else, to use pixel positions, we must
            // DIVIDE THE PIXELS BY GRIDSIZE when comparing to (pos)
            // (POS) * (GRIDSIZE) = PIXEL
            // ****************************************************
            this.pos.x*gridSize + x*gridSize,
            this.pos.y*gridSize + y*gridSize,
            gridSize,
            gridSize
          );
        }
      }
    }
    pop();
  } // end of draw()

  // drop the piece by 1 gridSize at an interval
  lower() {
    let time = round(millis());
    let deltaTime = time - this.board.lastTime;
    this.board.lastTime = time;
    this.board.dropCounter += deltaTime;

    // lower the piece by 1 gridSize every (dropInterval) milliseconds
    if (this.board.dropCounter >= this.board.dropInterval
            && this.farBottom() < this.board.lowerLimit
            && this.canGoDown() == true) {

      this.goDown();

    }

    // block has reached the bottom of the board
    if (this.farBottom() == this.board.lowerLimit
      || this.canGoDown() == false) {

      // wait (dropInterval) milliseconds
      if (this.board.dropCounter >= this.board.dropInterval) {
        // this is where lower() will stop being called by the main piece
        this.atBottom = true;
        // add piece to the baord matrix
        this.board.addPiece(this);
        // make a new piece at the top
        this.board.dropCounter = 0;
        this.init(this.board);
      }
    }

    //return this;
  } // end of lower()

  // drop the piece down by 1 block
  goDown() {
    if (this.farBottom() < this.board.lowerLimit
      && this.canGoDown() == true) {

      this.pos.y++;
      this.board.dropCounter = 0;

      // score increases here
      if (this.board.difficulty == 'Easy') {
        this.board.score++;
      }
      else if (this.board.difficulty == 'Med.') {
        this.board.score += 2;
      }
      else if (this.board.difficulty == 'Hard') {
        this.board.score += 5;
      }
      // save personal best cookie
      if (this.board.score > this.board.best) {
        this.board.best = this.board.score;
        setCookie('personal_best', this.board.best, 365*100);
      }
    }
  }

  // this only moves the piece LEFT or RIGHT
  // pass in -1 or 1, and it is scaled by gridSize
  // automatically within the draw function
  move(where) {
    // RIGHT and LEFT limits of the board, respectively
    if (((where > 0 && this.farRight(this.matrix) < this.board.rightLimit)
            || (where < 0 && this.farLeft(this.matrix) > 0))
            && this.canMove(where)) {

      this.pos.x += where;
    }
  }

  rotate() {
    // reset drop counter to allow hovering
    this.board.dropCounter = 0;

    let copy = new Array(this.matrix.length);
    for (let i=0; i<this.matrix.length; i++) {
      copy[i] = new Array(this.matrix[i].length);
      for (let j=0; j<this.matrix[i].length; j++) {
        copy[i][j] = this.matrix[i][j];
      }
    }

    let rotated = rotatedPiece(copy);
    let canRotate = (this.canRotate(rotated));
    let edgeBefore = this.atEdge();

    // try to rotate
    if (canRotate) {
      // keep edge pieces stuck to edge when rotating
      if (edgeBefore != 0) {
        this.matrix = rotated;
        let edgeAfter = this.atEdge();
        if (edgeAfter == 0) {
          if (this.shape == 1 && edgeBefore == 1) {
            // I's on the right edge need to be moved an extra time
            // because they jump 2 spaces when rotated at the right
            this.move(1);
          }
          this.move(edgeBefore);
        }
      }
      return rotated;
    }

    // try to go down
    if (this.canGoDown()) {
      this.pos.y++;
      if (this.canRotate(rotated)) {
        return rotated;
      }
      else {
        // go back up
        this.pos.y--;
      }
    }

    // try to go up
    this.pos.y--;
    if (this.canRotate(rotated)) {
      return rotated;
    }
    else {
      // go back down
      this.pos.y++;
    }

    // try to go left
    if (this.canMove(-1)) {
      this.move(-1);
      if (this.canRotate(rotated)) {
        return rotated;
      }
      else {
        // I's need to go left twice because of right edge case
        if (this.shape == 1) {
          if (this.canMove(-1)) {
            this.move(-1);
            if (this.canRotate(rotated)) {
              return rotated;
            }
            else {
              // go back
              this.move(1);
            }
          }
        }
        // go back
        this.move(1);
      }
    }

    // try to go right
    if (this.canMove(1)) {
      this.move(1);
      if (this.canRotate(rotated)) {
        return rotated;
      }
      else {
        // go back
        this.move(-1);
      }
    }

    // could not rotate
    return copy;

  } // end of rotate()

  // can the piece be rotated?
  canRotate(rotatedMatrix) {
    // go through every element in the piece (4x4)
    for (let j=0; j<rotatedMatrix.length; j++) {

      for (let i=0; i<rotatedMatrix[j].length; i++) {
        let value = rotatedMatrix[j][i];
        if ((value == 1)
          && (!this.board.matrix[j+this.pos.y]
            || !this.board.matrix[j+this.pos.y][i+this.pos.x]
            || this.board.matrix[j+this.pos.y][i+this.pos.x].value == 1)) {
          return false;
        }
      }
    }
    return true;
  }

  // can the piece go down by 1 block?
  canGoDown() {
    // go through every element in the piece (4x4)
    for (let j=0; j<this.matrix.length; j++) {
      for (let i=0; i<this.matrix[j].length; i++) {
        let value = this.matrix[j][i];

        if ((value == 1)
          && (!this.board.matrix[j+this.pos.y+1]
            || this.board.matrix[j+this.pos.y+1][i+this.pos.x].value == 1)) {
          return false;
        }
      }
    }
    return true;
  }

  // can the piece move left/right?
  canMove(where) {
    // go through every element in the piece (4x4)
    for (let j=0; j<this.matrix.length; j++) {
      for (let i=0; i<this.matrix[j].length; i++) {
        let value = this.matrix[j][i];
        let newY = j+this.pos.y;
        let newX = i+this.pos.x+where;

        if (this.pos.y < -1
          || (value == 1
              && (newX < 0 || newX >= gridWidth
                  || newY < 0 || newY >= gridHeight))
          || (value == 1 && this.pos.y >= 0
              && this.board.matrix[newY][newX].value == 1)) {
          return false;
        }
      }
    }
    return true;
  }

  // is this piece at the edge of the board?
  // -1 for left, 1 for right, 0 for no
  atEdge() {
    // go through every element in the piece (4x4)
    for (let j=0; j<this.matrix.length; j++) {
      for (let i=0; i<this.matrix[j].length; i++) {
        let value = this.matrix[j][i];
        let x = i+this.pos.x;
        if (value == 1) {
          if (x-1 < 0) {
            return -1;
          }
          else if (x+1 >= gridWidth) {
            return 1;
          }
        }
      }
    }
    return 0;
  }

  // in pixels
  farRight(matrix) {
    let farRight = 0;
    matrix.forEach(function(row, y) {
      row.forEach(function(value, x) {
        if (value == 1 && farRight < x) {
          farRight = x;
        }
      });
    });
    return (this.pos.x*gridSize + (farRight+1)*gridSize);
  }

  // in pixels
  farLeft(matrix) {
    let farLeft = 100;
    matrix.forEach(function(row, y) {
      row.forEach(function(value, x) {
        if (value == 1 && farLeft > x) {
          farLeft = x;
        }
      });
    });
    return (this.pos.x*gridSize + farLeft*gridSize);
  }

  // in pixels
  farBottom() {
    let farBottom = 0;
    this.matrix.forEach(function(row, y) {
      row.forEach(function(value, x) {
        if (value == 1 && farBottom < y) {
          farBottom = y;
        }
      });
    });
    return (this.pos.y*gridSize + (farBottom+1)*gridSize);
  }

} // end of Piece class
