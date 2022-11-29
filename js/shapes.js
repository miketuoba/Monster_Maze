// Mike Wu, 100342872, a great part of this js is done by Saeed Mirjalili

/*jshint esversion: 6 */

// global variables
let ctx, maze, gameCharacter, gameStart;
const MAZE_ROWS = 10;
const MAZE_COLS = 10;
let speed;
let score;
let flag;

function setup() {
    'use strict';

    document.getElementById("music").play();

    flag = false;
    speed = 1000;
    score = 0;
    // setting the event handlers

    // set an event handler for all input boxes and select box (any element that has the class 'inValue')
    document.querySelectorAll('.inValue').forEach(function (item) {
        item.addEventListener('change', gameCharacter.draw);
    });
    // set an event handler for all buttons (any button that has the class 'moveBtn')
    document.querySelectorAll('.moveBtn').forEach(function (item) {
        item.addEventListener('click', moveBtnClick);
    });

    document.getElementById('drawingBox1').addEventListener('keydown', canvasKeyDown);

    ctx = getCanvasContext('drawingBox1');

    function Maze() {
        this.matrix = null;
        this.mazeCellWidth = 0;
        this.mazeCellHeight = 0;
        this.currentMazeCellCol = 0;
        this.currentMazeCellRow = 0;
        this.mazeExitBottom = 0;
        this.mazeExitTop = 0;
        this.generate = function (rows, cols) {
            let row, col, randDir;
            this.matrix = new Array(rows);
            for (let i = 0; i < rows; i++) {
                this.matrix[i] = new Array(cols);
                this.matrix[i].fill(0);
            }
            /*
            this.matrix = [
                [0, 0, 0, 0, 0, 0, 0, 1, 1, 0],
                [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
                [0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 1, 1, 0, 0, 0],
                [0, 0, 0, 1, 1, 1, 0, 0, 0, 0],
                [0, 0, 0, 1, 0, 1, 0, 0, 0, 0],
                [0, 0, 0, 1, 1, 1, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 1, 1, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 1, 1, 1, 0]
            ];
            this.mazeExitBottom = 8;
            */
            row = rows - 1;
            col = Math.floor(Math.random() * cols);
            this.mazeExitBottom = col;
            this.matrix[row][col] = 1;

            do {
                randDir = Math.floor(Math.random() * 5);
                switch (randDir) {
                    case 0:
                        col--;
                        if (col < 0)
                            col = 0;
                        break;
                    case 1:
                        if (row >= 1)
                            this.matrix[row - 1][col] = 1;
                        row--;
                        col--;
                        if (row < 0)
                            row = 0;
                        if (col < 0)
                            col = 0;
                        break;
                    case 2:
                        row--;
                        if (row < 0)
                            row = 0;
                        break;
                    case 3:
                        if (row >= 1)
                            this.matrix[row - 1][col] = 1;
                        row--;
                        col++;
                        if (row < 0)
                            row = 0;
                        if (col >= cols)
                            col = cols - 1;
                        break;
                    case 4:
                        col++;
                        if (col >= cols)
                            col = cols - 1;
                        break;
                }
                this.matrix[row][col] = 1;
            } while (row > 0);

            this.mazeExitTop = col;
        };

        this.generateWithTime = function (rows, cols) {
            let newRow = new Array(rows);
            newRow.fill(0);

            let row, col, randDir;
            row = 1;
            col = this.mazeExitTop;
            newRow[col] = 1;

            do {
                randDir = Math.floor(Math.random() * 3);
                switch (randDir) {
                    case 0:
                        col--;
                        if (col < 0)
                            col = 0;
                        break;
                    case 1:
                        row--;
                        if (row < 0)
                            row = 0;
                        break;
                    case 2:
                        col++;
                        if (col >= cols)
                            col = cols - 1;
                        break;
                }
                newRow[col] = 1;
            } while (row > 0);

            this.mazeExitTop = col;

            this.matrix.pop(this.matrix[rows - 1]);
            this.matrix.unshift(newRow);
        }

        this.draw = function (ctx) {
            const MAZE_BLOCK_COLOR = '#000';
            const MAZE_PATH_COLOR = 'lightcyan';
            let cellColor;

            this.mazeCellWidth = ctx.canvas.width / this.matrix[0].length;
            this.mazeCellHeight = ctx.canvas.height / this.matrix.length;

            for (let row = 0; row < this.matrix.length; row++) {
                for (var col = 0; col < this.matrix[row].length; col++) {
                    // if (this.matrix[row][col] === 1){
                    //     drawRectangle(ctx, col * this.mazeCellWidth, row * this.mazeCellHeight, this.mazeCellWidth, this.mazeCellHeight, MAZE_PATH_COLOR, MAZE_PATH_COLOR, 0);
                    // }
                    cellColor = this.matrix[row][col] === 0 ? MAZE_BLOCK_COLOR : MAZE_PATH_COLOR;
                    drawRectangle(ctx, col * this.mazeCellWidth, row * this.mazeCellHeight, this.mazeCellWidth, this.mazeCellHeight, cellColor, cellColor, 0);
                }
            }
        };
    }

    maze = new Maze();
    maze.generate(MAZE_ROWS, MAZE_COLS);
    maze.draw(ctx);

    let shapeColor = '#aaaaff';
    let w = maze.mazeCellWidth;
    let h = maze.mazeCellHeight;
    let x = maze.mazeExitBottom * w;
    let y = (maze.matrix.length - 1) * maze.mazeCellHeight;
    let theShape = drawHappyMonster;

    function Character(x, y, w, h, theShape, shapeColor) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.shapeColor = shapeColor;
        this.shapeToBeDrawn = theShape;
        this.moveStep = 0;
        this.draw = function (ctx, maze) {
            maze.draw(ctx);
            maze.currentMazeCellCol = Math.round(this.x / maze.mazeCellWidth);
            maze.currentMazeCellRow = Math.round(this.y / maze.mazeCellHeight);
            if (maze.currentMazeCellRow < maze.matrix.length) {
                this.shapeToBeDrawn(ctx, this.x, this.y, this.w, this.h, this.shapeColor);
                ctx.canvas.focus();
            }
        };

        this.move = function (ctx, direction) {
            ctx.clearRect(this.x, this.y, this.w, this.h);
            switch (direction) {
                case 'NW':
                    this.x -= this.moveStep;
                    this.y -= this.moveStep;
                    if (this.x < 0)
                        this.x = 0;
                    if (this.y < 0)
                        this.y = 0;
                    break;
                case 'N':
                    this.y -= this.moveStep;
                    if (this.y < 0)
                        this.y = 0;
                    break;
                case 'NE':
                    this.x += this.moveStep;
                    this.y -= this.moveStep;
                    if (this.x > ctx.canvas.width - this.w)
                        this.x = ctx.canvas.width - this.w;
                    if (this.y < 0)
                        this.y = 0;
                    break;
                case 'W':
                    this.x -= this.moveStep;
                    if (this.x < 0)
                        this.x = 0;
                    break;
                case 'E':
                    this.x += this.moveStep;
                    if (this.x > ctx.canvas.width - this.w)
                        this.x = ctx.canvas.width - this.w;
                    break;
                case 'SW':
                    this.x -= this.moveStep;
                    this.y += this.moveStep;
                    if (this.x < 0)
                        this.x = 0;
                    if (this.y > ctx.canvas.height - this.h)
                        this.y = ctx.canvas.height - this.h;
                    break;
                case 'S':
                    this.y += this.moveStep;
                    if (this.y > ctx.canvas.height - this.h)
                        this.y = ctx.canvas.height - this.h;
                    break;
                case 'SE':
                    this.x += this.moveStep;
                    this.y += this.moveStep;
                    if (this.x > ctx.canvas.width - this.w)
                        this.x = ctx.canvas.width - this.w;
                    if (this.y > ctx.canvas.height - this.h)
                        this.y = ctx.canvas.height - this.h;
                    break;
                case 'C':
                    this.x = (ctx.canvas.width - this.w) / 2;    // setting the x to the center of the canvas horizontally
                    this.y = (ctx.canvas.height - this.h) / 2;   // setting the y to the center of the canvas vertically
                    break;
                default:
                    alert("Undefined direction!");
            }

            this.draw(ctx, maze);
        };
    }

    gameCharacter = new Character(x, y, w, h, theShape, shapeColor);
    gameCharacter.moveStep = maze.mazeCellHeight;
    gameCharacter.draw(ctx, maze);

    document.getElementById("score").innerHTML = "Your Score: " + score;
}

function moveBtnClick(e) {
    let direction = e.currentTarget.id;

    if ((direction === 'N' && maze.matrix[maze.currentMazeCellRow - 1][maze.currentMazeCellCol] === 1) ||
        (direction === 'S' && maze.matrix[maze.currentMazeCellRow + 1][maze.currentMazeCellCol] === 1) ||
        (direction === 'E' && maze.matrix[maze.currentMazeCellRow][maze.currentMazeCellCol + 1] === 1) ||
        (direction === 'W' && maze.matrix[maze.currentMazeCellRow][maze.currentMazeCellCol - 1] === 1) ||
        (direction === 'NW' && maze.matrix[maze.currentMazeCellRow - 1][maze.currentMazeCellCol - 1] === 1) ||
        (direction === 'NE' && maze.matrix[maze.currentMazeCellRow - 1][maze.currentMazeCellCol + 1] === 1) ||
        (direction === 'SE' && maze.matrix[maze.currentMazeCellRow + 1][maze.currentMazeCellCol + 1] === 1) ||
        (direction === 'SW' && maze.matrix[maze.currentMazeCellRow + 1][maze.currentMazeCellCol - 1] === 1)) {

        gameCharacter.move(ctx, direction);
    }
}

function canvasKeyDown(e) {
    'use strict';

    let direction;

    e.preventDefault();

    switch (e.code) {
        case 'ArrowUp':
            if (e.shiftKey)
                direction = 'NW';
            else if (e.ctrlKey)
                direction = 'NE';
            else
                direction = 'N';
            break;
        case 'ArrowDown':
            if (e.shiftKey)
                direction = 'SW';
            else if (e.ctrlKey)
                direction = 'SE';
            else
                direction = 'S';
            break;
        case 'ArrowLeft':
            direction = 'W';
            break;
        case 'ArrowRight':
            direction = 'E';
            break;
        default:
            if (e.shiftKey && e.ctrlKey && e.altKey) {
                direction = 'C';
            }
            break;
    }
    if ((direction === 'N' && maze.matrix[maze.currentMazeCellRow - 1][maze.currentMazeCellCol] === 1) ||
        (direction === 'S' && maze.matrix[maze.currentMazeCellRow + 1][maze.currentMazeCellCol] === 1) ||
        (direction === 'E' && maze.matrix[maze.currentMazeCellRow][maze.currentMazeCellCol + 1] === 1) ||
        (direction === 'W' && maze.matrix[maze.currentMazeCellRow][maze.currentMazeCellCol - 1] === 1) ||
        (direction === 'NW' && maze.matrix[maze.currentMazeCellRow - 1][maze.currentMazeCellCol - 1] === 1) ||
        (direction === 'NE' && maze.matrix[maze.currentMazeCellRow - 1][maze.currentMazeCellCol + 1] === 1) ||
        (direction === 'SE' && maze.matrix[maze.currentMazeCellRow + 1][maze.currentMazeCellCol + 1] === 1) ||
        (direction === 'SW' && maze.matrix[maze.currentMazeCellRow + 1][maze.currentMazeCellCol - 1] === 1)) {

        gameCharacter.move(ctx, direction);
    }

    if (!flag) {
        clearInterval(gameStart);
        gameStart = setInterval(drawNewRow, speed);
        flag = true;
    }
}

function drawNewRow() {
    score += 100;
    document.getElementById("score").innerHTML = "Your Score: " + score;
    maze.generateWithTime(MAZE_ROWS, MAZE_COLS);
    gameCharacter.y += maze.mazeCellHeight;
    //gameCharacter = new Character(x, y + 1, w, h, theShape, shapeColor);

    if ((gameCharacter.y / maze.mazeCellHeight) > 9) {
        clearInterval(gameStart);
        maze.draw(ctx);
        gameCharacter.draw(ctx, maze);
        alert("GAME OVER!");
        setup();
    }
    else {
        maze.draw(ctx);
        gameCharacter.draw(ctx, maze);
        clearInterval(gameStart);
        speed = speed / 1.03 <= 200 ? 200 : speed / 1.03;
        gameStart = setInterval(drawNewRow, speed);
    }
}