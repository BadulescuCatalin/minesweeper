/*
*
* simple object to keep the data for each square
* of the board
*
*/
class BoardSquare {
    constructor(hasBomb, bombsAround) {
        this.hasBomb = hasBomb;
        this.bombsAround = bombsAround;
    }
}

class Pair {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class GameMode {
    constructor(rows, columns, difficulty, bombProbability) {
        this.rows = rows;
        this.columns = columns;
        this.difficutly = difficulty;
        this.bombProbability = bombProbability;
    }
}


/*
*
* "board" is a matrix that holds data about the
* game board, in a form of BoardSquare objects
*
* openedSquares holds the position of the opened squares
*
* flaggedSquares holds the position of the flagged squares
*
*/
let board = [];
let openedSquares = [];
let flaggedSquares = [];
let bombCount = 0;
let squaresLeft = 0;

let tdElements = [];
let dropdownMenu = document.querySelector("#difficultyDropDownMenu");
let dropdownButton = document.querySelector("#difficultyDropDown");
let easyOption = document.querySelector("#easyOption");
let mediumOption = document.querySelector("#mediumOption");
let hardOption = document.querySelector("#hardOption");
/*
*
* the probability of a bomb in each square depends on the difficulty of the game
* maxProbability is always 100
*
*/
// let bombProbability = 3;
let maxProbability = 100;


function minesweeperGameBootstrapper(game) {

    // hide text
    document.querySelector("#h1_text").style.display = 'none';
    generateBoard(game);
}

function generateBoard(game) {
    board = []
    squaresLeft = game.rows * game.columns;

    /*
    *
    * "generate" an empty matrix
    *
     */
    for (let i = 0; i < game.rows; i++) {
        board[i] = new Array(game.columns);
    }

    /*
    *
    * TODO fill the matrix with "BoardSquare" objects, that are in a pre-initialized state
    *
    */
    for (let i = 0; i < game.rows; ++i) {
        for (let j = 0; j < game.columns; ++j) {
            board[i][j] = new BoardSquare(false, 0);
        }
    }

    /*
    *
    * "place" bombs according to the probabilities declared at the top of the file
    * those could be read from a config file or env variable, but for the
    * simplicity of the solution, I will not do that
    *
    */
    for (let i = 0; i < game.rows; i++) {
        for (let j = 0; j < game.columns; j++) {
            // TODO place the bomb, you can use the following formula: Math.random() * maxProbability < bombProbability
            board[i][j].hasBomb = Math.random() * maxProbability < game.bombProbability;
        }
    }

    /*
    *
    * TODO set the state of the board, with all the squares closed
    * and no flagged squares
    *
    */
    openedSquares = [];
    flaggedSquares = [];

    //BELOW THERE ARE SHOWCASED TWO WAYS OF COUNTING THE VICINITY BOMBS

    /*
    *
    * TODO count the bombs around each square
    * dx, dy = directions (diagonals included)
    */
    let dx = [1, -1, 0, 0, 1, 1, -1, -1];
    let dy = [0, 0, 1, -1, 1, -1, 1, -1];
    for (let i = 0; i < game.rows; ++i) {
        for (let j = 0; j < game.columns; ++j) {
            let bombsAround = 0;
            if (!board[i][j].hasBomb) {
                for (let dir = 0; dir < 8; ++dir) {
                    let newRow = dy[dir] + i;
                    let newColumn = dx[dir] + j;
                    if (0 <= newRow && game.rows > newRow && 0 <= newColumn && game.columns > newColumn && board[newRow][newColumn].hasBomb === true) {
                        bombsAround++;
                    }
                }
            } else {
                --squaresLeft;
            }
            board[i][j].bombCount = bombsAround;
        }
    }

    /*
    *
    * print the board to the console to see the result
    *
    */
    renderBoard();
}

function renderBoard() {
    const table = document.querySelector("#game-table");
    table.innerHTML = "";
    for (let i = 0; i < board.length; ++i) {
        tableData = "";
        tableData += `<tr>`;
        for (let j = 0; j < board[0].length; ++j) {

            tableData += `<td id="i${i}j${j}" onclick='tdclick(id);'><img src="empty.png" alt="empty" height="20vh" width="20vw"></td>`;
        }
        tableData += `</tr>`;
        table.innerHTML += tableData;
    }
    tdElements = document.querySelectorAll("td");
    tdElements.forEach(td => {
        td.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            if (document.querySelector(`#${td.id}`).firstChild.src.toString().includes("flag.png")) {
                document.querySelector(`#${td.id}`).firstChild.src = "empty.png";
                document.querySelector(`#${td.id}`).firstChild.alt = "empty";
                let row = td.id.split('i')[1].split('j')[0];
                let column = td.id.split('i')[1].split('j')[1];
                removeFlagFromRowAndColumn(row, column);
            } else if (document.querySelector(`#${td.id}`).firstChild.src.toString().includes("empty.png")) {
                document.querySelector(`#${td.id}`).firstChild.src = "flag.png";
                document.querySelector(`#${td.id}`).firstChild.alt = "flag";
                let row = td.id.split('i')[1].split('j')[0];
                let column = td.id.split('i')[1].split('j')[1];
                flaggedSquares.push(new Pair(row, column));
            }
        })
    });
}

// for selecting game modes
easyOption.addEventListener("click", (event) => {
    let game = new GameMode(9, 9, "easy", 20);
    minesweeperGameBootstrapper(game);
});

mediumOption.addEventListener("click", (event) => {
    let game = new GameMode(15, 15, "medium", 30);
    minesweeperGameBootstrapper(game);
});

hardOption.addEventListener("click", (event) => {
    let game = new GameMode(21, 21, "hard", 35);
    minesweeperGameBootstrapper(game);
});

/*
* call the function that "handles the game"
* called at the end of the file, because if called at the start,
* all the global variables will appear as undefined / out of scope
*
 */

// TODO create the other required functions such as 'discovering' a tile, and so on (also make sure to handle the win/loss cases)

// function for clicking on a cell
function tdclick(id) {
    let row = Number(id.split('i')[1].split('j')[0]);
    let column = Number(id.split('i')[1].split('j')[1]);
    let numberOfBombs = board[row][column].bombCount;
    if (document.querySelector(`#${id}`).firstChild.src.toString().includes("empty.png")) {
        // if is bomb
        if (board[row][column].hasBomb) {
            document.querySelector(`#${id}`).firstChild.src = "bomb.jpg";
            document.querySelector(`#${id}`).firstChild.alt = "bomb";
            gameOverLost();
        } else if (numberOfBombs == 0) { // if is emoty
            expand(row, column);
            if (squaresLeft == 0) {
                gameOverWon();
            }
        } else { // if has bombs near
            let numberImage = numberOfBombs.toString() + '.png';
            document.querySelector(`#${id}`).firstChild.src = numberImage;
            openedSquares.push(new Pair(row, column));
            --squaresLeft;
            if (squaresLeft == 0) {
                gameOverWon();
            }
        }
    }
}

function removeFlagFromRowAndColumn(row, column) {
    for (let i = 0; i < flaggedSquares.length; ++i) {
        let pair = flaggedSquares[i];
        if (pair.x == row && pair.y == column) {
            flaggedSquares.splice(i, 1);
            break;
        }
    }
}

// display game over! you on!
function gameOverWon() {
    document.querySelector(`#h1_text`).innerHTML = "Game Over!<br></br>You Won!";
    document.querySelector(`#h1_text`).style.display = 'block';
}

// display game over! you lost!
function gameOverLost() {
    document.querySelector(`#h1_text`).innerHTML = "Game Over!<br></br>You Lost!";
    document.querySelector(`#h1_text`).style.display = 'block';
}

// expand empty blocks
function expand(row, column) {
    if (0 > row || 0 > column || row == board.length || column == board[0].length || board[row][column].bombCount != 0) {
        return;
    }
    --squaresLeft;
    board[row][column].bombCount = -1;
    let id = 'i' + row + 'j' + column;
    document.querySelector(`#${id}`).firstChild.src = "grey2.jpg";
    document.querySelector(`#${id}`).firstChild.alt = "grey2";
    let dx = [1, 0, -1, 0];
    let dy = [0, 1, 0, -1];
    for (let dir = 0; dir < 4; ++dir) {
        let newRow = dy[dir] + row;
        let newColumn = dx[dir] + column;
        expand(newRow, newColumn);
    }
}