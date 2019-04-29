// Tetris!

//timing variables
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;
let playing = false;

// Access Canvas
const canvas = document.getElementById("tetris");
const context = canvas.getContext('2d');

// Increase size of context so it is playable
context.scale(20, 20);

// Full Line
function arenaSweep() {
    let rowCount = 1;

    outer: for (let y = arena.length - 1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }
        // empty row
        const row = arena.splice(y, 1)[0].fill(0);
        // move to top
        arena.unshift(row);
        // offset y
        ++y;

        player.score += rowCount * 10;
        rowCount *= 2;
        successFX();
    }
}

//Collider
function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

// Create Matrix
function createMatrix(w, h) {
    const matrix = [];
    // while h < 0
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

// Create More Pieces
function createPiece(type) {
    if (type === 'T') {
        //  T piece
        return [
            [0, 0, 0],
            [1, 1, 1],
            [0, 1, 0]
        ];
    } else if (type === 'O') {
        //  Box piece
        return [
            [2, 2],
            [2, 2]
        ];
    } else if (type === 'L') {
        //  L piece
        return [
            [0, 3, 0],
            [0, 3, 0],
            [0, 3, 3]
        ];
    } else if (type === 'J') {
        //  J piece
        return [
            [0, 4, 0],
            [0, 4, 0],
            [4, 4, 0]
        ];
    } else if (type === 'I') {
        //  Long piece
        return [
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0]
        ];
    } else if (type === 'S') {
        //  S piece
        return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0],
        ];
    } else if (type === 'Z') {
        //  Z piece
        return [
            [7, 7, 0],
            [0, 7, 7],
            [0, 0, 0],
        ];
    }
}

// General Draw Function
function draw() {

    // Paint Context Background
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawMatrix(arena, {
        x: 0,
        y: 0
    });
    drawMatrix(player.matrix, player.pos);
}

// Draw Piece - Offset allows us to move the piece
function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

// Drop Player
function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
        updateScore();
        landingFX();
    }
    dropCounter = 0;
}

// Copy values from player into arena
function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

// Move player and prevent leaving screen
function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) {
        player.pos.x -= dir;
    }
}

// Random Piece each spawn
function playerReset() {
    const pieces = 'ILJOTSZ';
    player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
    // center new player position
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);

    // End game
    if (collide(arena, player)) {
        arena.forEach(row => row.fill(0));
        player.score = 0;
        updateScore();
    }
}

// Rotate Player
function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);

    // check collision to prevent rotating in walls
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        // moved too much
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos
            return;
        }
    }
}

// Rotate Pieces - Transpose + Reverse = Rotation
function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            // switch tuple
            [
                matrix[x][y],
                matrix[y][x],
            ] = [
                matrix[y][x],
                matrix[x][y],
            ];
        }
    }

    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

// Update positions every 1 second
function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }

    draw();
    requestAnimationFrame(update);
}

// Update Score
function updateScore() {
    document.getElementById("score").innerText = player.score;
}

// Color Map
const colors = [
    null,
    'purple',
    'yellow',
    'orange',
    'blue',
    'aqua',
    'green',
    'red',
]

// Create Level
const arena = createMatrix(12, 20);

// Player Controller
const player = {
    pos: {
        x: 0,
        y: 0,
    },
    matrix: null,
    score: 0,
}

// Control Player with Keyboard input
document.addEventListener('keydown', event => {
    if (event.keyCode === 37) {
        playerMove(-1);
    } else if (event.keyCode === 39) {
        playerMove(1);
    } else if (event.keyCode === 40) {
        playerDrop();
        // } else if (event.keyCode === 81) {
        // playerRotate(-1);
    } else if (event.keyCode === 38) {
        playerRotate(1);
    }
});

function music() {
    let musicButton = document.getElementById('music-btn');
    let music = document.getElementById('music');
    if (playing == false) {
        musicButton.innerHTML = 'Stop Music';
        playing = true;
        music.volume = 0.08;
        music.loop = true;
        music.play();
    } else {
        musicButton.innerHTML = 'Play Music';
        playing = false;
        music.pause();
        music.currentTime = 0;
    }
}

function successFX() {
    let success = document.getElementById('successFX');
    success.play();
}

function landingFX() {
    let landing = document.getElementById('landingFX');
    landing.play();
}

playerReset();
updateScore();
update();