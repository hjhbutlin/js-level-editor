// Modes
const MENU_MODE = 0;
const GAME_MODE = 1;
const EDIT_MODE = 2;

let test = false;

let gamePaused = false;

let mode = MENU_MODE;
console.log(mode);

// Physics Constants
let ACCEL = 0.1;
let GRAVITY = 0.1;
let maxBaseSpeed = 0.3;
let jumpStrength = 0.7;
let timeScale = 40;
const TERMINAL_V = 0.6;

// Game Constants
const MAX_LEVEL = 3;
let currentLevel = 1;
let totalLevels = 2;
let levelSpawn= [0,0];

const debugMenu = document.getElementById("debugMenu");

// Canvas Constants
const ROWS = 16;
const COLS = 32;
const SPAWN_TOOL = 2;
const GOAL_TOOL = 3;
const SELECTION_TOOL = 4;
const SPIKE_BASE_NUMBER = 10;
const GLOBAL_SCALE = 50;
const PREVEIW_SCALE = 2;
let spikeRotation = 0;
const SPIKE_VERTICES = [
    [0,1,0,0,1,0,1,1],
    [1,1,0,1,0,0,1,0],
    [0.5,0,1,0.5,0.5,1,0,0.5]
];
const SSBs = [ // spike solid blocks  left top width height, rotations 10 11 12 13
    [5/12,0,1/6,1/2 , 1,5/12,1/2,1/6 , 5/12,1,1/6,1/2, 0,5/12,1/2,1/6], // top thin
    [1/4,1/2,1/2,3/8 , 1/8,1/4,3/8,1/2 , 1/4,1/8,1/2,3/8 , 1/2,1/4,3/8,1/2], // middle middle
    [0,7/8,1,1/8 , 0,0,1/8,1 , 0,0,1,1/8 , 7/8,0,1/8,1] // bottom fat
];
let fade = 1;

// Editor/Game Grid Setup
let levelGridData = Array(ROWS).fill().map(() => Array(COLS).fill(0));

let spawnX = 0;
let spawnY = ROWS-1;
let goalY = ROWS-1;
let goalX = COLS-1;
levelGridData[spawnY][spawnX] = 2;
levelGridData[goalY][goalX] = 3;



let selectedTool = 0;
let mouseDown = false;


class Canvas {

    constructor(canvasID, cols, rows, canvasScale) {

        this.canvas = document.getElementById(canvasID);
        this.ctx = this.canvas.getContext("2d");

        this.scale = window.innerWidth / canvasScale;
        this.cols = cols;
        this.rows =  rows;

        this.canvas.width = this.scale * cols;
        this.canvas.height = this.scale * rows;

        this.tileSize = this.scale;

        this.tileColours = {
            1: "darkred",       // platform
            2: "darkcyan",      // spawn
            3: "darkgreen",    // goal
        };
    }

    fillSpike(x,y,colour,rotation) {
        this.ctx.beginPath();
        this.ctx.moveTo((x + SPIKE_VERTICES[0][2*rotation]) * this.tileSize, (y + SPIKE_VERTICES[0][2*rotation + 1]) * this.tileSize);
        this.ctx.lineTo((x + SPIKE_VERTICES[1][2*rotation]) * this.tileSize, (y + SPIKE_VERTICES[1][2*rotation + 1]) * this.tileSize);
        this.ctx.lineTo((x + SPIKE_VERTICES[2][2*rotation]) * this.tileSize, (y + SPIKE_VERTICES[2][2*rotation + 1]) * this.tileSize);
        this.ctx.closePath();
        this.ctx.fillStyle = colour;
        this.ctx.fill();
    }

    drawGrid(mode, gridData) {
        this.canvas.width = this.scale * this.cols;
        this.canvas.height = this.scale * this.rows;
        this.tileSize = this.scale;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // gridData[spawnY][spawnX] = 2;
        // gridData[goalY][goalX] = 3;
    
        for (let y = 0; y < this.rows; y++) {
    
            for (let x = 0; x < this.cols; x++) {
                if (mode === 2) {
                    this.ctx.strokeStyle = "gray";
                    this.ctx.strokeRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
                }
                
                // handle spike case
                if (gridData[y][x] >= 10 && gridData[y][x] <= 13) {
                    this.fillSpike(x, y, "red",gridData[y][x]-SPIKE_BASE_NUMBER);
                } else if (this.tileColours[gridData[y][x]]) {
                    this.ctx.fillStyle = this.tileColours[gridData[y][x]];
                    this.ctx.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
                }
            }
        }
        if (mode === 1) {
            this.ctx.fillStyle = `rgba(240,255,255,${fade})`;
            this.ctx.fillRect(you.l * this.tileSize, you.t * this.tileSize, this.tileSize, this.tileSize);
        }
    }
}

window.onresize = function() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (w > h*2) {
        gameCanvas.scale = 2 * h / GLOBAL_SCALE;
        previewCanvas.scale = 2 * h / GLOBAL_SCALE * PREVEIW_SCALE;
    } else {
        gameCanvas.scale = w / GLOBAL_SCALE;
        previewCanvas.scale = w / GLOBAL_SCALE * PREVEIW_SCALE;

    }
    previewCanvas.drawGrid(2, previewArray(selectedTool));
    gameCanvas.drawGrid(mode, levelGridData);
};

class CanvasElement {
    constructor(l, t, w, h) { // (old) left right width height
        this.l = this.ol = l;
        this.r = this.or = l + w;
        this.t = this.ot = t;
        this.b = this.ob = t + h;
        this.w = w;
        this.h = h;
        this.vx = 0;
        this.vy = 0;

        this.spaceLeft = true;
        this.spaceRight = true;
        this.spaceUp = true;
        this.spaceDown = true;
    }

    move(dt) {
        this.or = this.r;
        this.ol = this.l;
        this.ob = this.b;
        this.ot = this.t;

        this.l += this.vx * dt;
        this.t += this.vy * dt;
        this.r = this.l + this.w;
        this.b = this.t + this.h
    }
}

class Player extends CanvasElement {
    constructor(l, t, w, h) { // (old) left right width height
        super(l,t,w,h);

        this.falling = false;
    }

    setLeft(l) { this.l = l; this.r = l + this.w; }
    setRight(r) { this.r = r; this.l = r - this.w; }
    setTop(t) { this.t = t; this.b = t + this.h; }
    setBottom(b) { this.b = b; this.t = b - this.h; }

    checkAndResolveBlockCollision(s) {
        if (this.t >= s.b || this.b <= s.t || this.l >= s.r || this.r <= s.l) {
            return;
        }

        if (this.r > s.l && this.or <= s.l && s.spaceLeft) {
            this.setRight(s.l);
            this.vx = s.vx;
        }

        if (this.l < s.r && this.ol >= s.r && s.spaceRight) {
            this.setLeft(s.r);
            this.vx = s.vx;
        }

        if (this.b > s.t && this.ob <= s.t && s.spaceUp) {
            this.setBottom(s.t);
            this.falling = false;
            this.vy = s.vy;
        }
        
        if (this.t < s.b && this.ot >= s.b && s.spaceDown) {
            this.setTop(s.b);
            this.vy = s.vy;
        }

        return;
    }

    checkAndResolveBoundaryCollision() {
        if (this.b >= ROWS) {
            this.setBottom(ROWS);
            this.vy = 0;
            this.falling = false;
        }

        if (this.t <= 0) {
            this.setTop(0);
            this.vy = 0;
        }

        if (this.l <= 0) {
            this.setLeft(0);
            this.vx = 0;
        }

        if (this.r >= COLS) {
            this.setRight(COLS);
            this.vx = 0;
        }
    }

    checkHazard(s) {
        return (this.l < s.r && this.r > s.l && this.t < s.b && this.b > s.t);
    }

    checkGoalReached() {
        return (this.l < goalX + 1 && this.r > goalX && this.t < goalY + 1 && this.b > goalY);
    }
}




// Declarationnnn

function previewArray(tool) {return [[0,0,0],[0,tool,0],[0,0,0]];}

let gameCanvas = new Canvas("grid",COLS,ROWS,GLOBAL_SCALE);
let blocks = [];
let spikes = [];
let you = new Player(levelSpawn[0], levelSpawn[1], 1, 1);

let previewCanvas = new Canvas("preview",3,3,GLOBAL_SCALE/PREVEIW_SCALE);




// ####### MAIN MENU STUFF #######

document.getElementById("startGame").addEventListener("click", () => {
    mode = 1;
    console.log(mode);

    document.querySelectorAll(".main-menu").forEach(element => {element.style.display = "none"});
    document.querySelectorAll(".game").forEach(element => {element.style.display = "flex"});
    console.log("launched game");
    loadGame(false);
    gameCanvas.drawGrid(mode,levelGridData);
});

document.getElementById("startEditor").addEventListener("click", () => {
    mode = 2;
    console.log(mode);
    levelGridData = Array(ROWS).fill().map(() => Array(COLS).fill(0));

    document.querySelectorAll(".main-menu").forEach(element => {element.style.display = "none"});
    document.querySelectorAll(".editor").forEach(element => {element.style.display = "flex"});
    console.log("launched editor");

    levelGridData[spawnY][spawnX] = 2;
    levelGridData[goalY][goalX] = 3;
    selectedTool = 0;

    gameCanvas.drawGrid(mode, levelGridData);
    previewCanvas.drawGrid(2, previewArray(selectedTool));
});


// Back To Menu

document.querySelectorAll(".back-button").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".main-menu").forEach(element => {element.style.display = "grid"});
        document.querySelectorAll(".game").forEach(element => {element.style.display = "none"});
        document.querySelectorAll(".editor").forEach(element => {element.style.display = "none"});
        mode = 0;
        console.log(mode);
        if (debugMenu.classList.contains("active")) {
            debugMenu.style.display = "none";
            debugMenu.classList.remove("active");
        }

        console.log("relaunched menu");
    });
});





// ###### EDITOR STUFF #######

function fillTile(event) {
    const rect = gameCanvas.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    let col = Math.floor(x / gameCanvas.tileSize);
    let row = Math.floor(y / gameCanvas.tileSize);

    try {
        levelGridData[row][col] = selectedTool + spikeRotation;
    } catch (error) {
        if (error instanceof TypeError) {
            console.log("rectified index out of range error")
            row = row < 0 ? 0 : row > 15 ? 15 : row;
            col = col < 0 ? 0 : col > 31 ? 31 : col;
        }
    }

    if (selectedTool === SPAWN_TOOL) {
        levelGridData[spawnY][spawnX] = 0;
        spawnX = col;
        spawnY = row;
    } else if (selectedTool === GOAL_TOOL) {
        levelGridData[goalY][goalX] = 0;
        goalX = col;
        goalY = row;
    }

    gameCanvas.drawGrid(mode, levelGridData);
}

gameCanvas.canvas.addEventListener("mousedown", (event) => {
    mouseDown = true;
    fillTile(event);
});

gameCanvas.canvas.addEventListener("mousemove", (event) => {
    if (mouseDown) {
    fillTile(event);
    }
});

gameCanvas.canvas.addEventListener("mouseup", (event) => {
    mouseDown = false;
});


document.querySelectorAll(".tool-button").forEach(button => {
    button.addEventListener("click", () => {
        selectedTool = Number(button.dataset.tool);
        previewCanvas.drawGrid(2, previewArray(selectedTool));

        if (selectedTool === 10) {
            document.getElementById("RotateButton").classList.remove("button-disabled");
            document.getElementById("RotateButton").classList.add("button-enabled");
        } else {
            document.getElementById("RotateButton").classList.add("button-disabled");
            document.getElementById("RotateButton").classList.remove("button-enabled");
        }

        spikeRotation = 0;

        document.querySelectorAll(".tool-button").forEach(btn => { btn.classList.remove("active")});

        button.classList.add("active");

        console.log(`Switched to ${button.dataset.name}`);
    });
});

document.getElementById("RotateButton").onclick = function() {
    if (selectedTool === 10) {
        spikeRotation = (spikeRotation + 1 ) % 4;
        previewCanvas.drawGrid(2, previewArray(selectedTool + spikeRotation));
    }
}

document.getElementById("ResetButton").onclick = function() {
    document.querySelectorAll("button").forEach(btn => btn.classList.remove("active"));
    document.querySelectorAll(".side-button").forEach(btn => {btn.classList.remove("button-enabled"); btn.classList.add("button-disabled");});
    levelGridData = Array(ROWS).fill().map(() => Array(COLS).fill(0));
    spawnX = 0;
    spawnY = ROWS-1;
    goalY = ROWS-1;
    goalX = COLS-1;
    levelGridData[spawnY][spawnX] = 2;
    levelGridData[goalY][goalX] = 3;
    selectedTool = 0;
    spikeRotation = 0;
    previewCanvas.drawGrid(2, previewArray(selectedTool));
    gameCanvas.drawGrid(mode, levelGridData);
    console.log("reset grid")
}

document.getElementById("testLevelButton").onclick = function() {
    document.getElementById("toolbar").style.display = "none";
    document.getElementById("secondaryButtons").style.display = "none";
    document.getElementById("previewContainer").style.display = "none";
    document.getElementById("testLevelButton").style.display = "none";
    document.getElementById("endTestButton").style.display = "flex";

    test = true;
    mode = 1;
    loadGame(true);
}

document.getElementById("endTestButton").onclick = function() {
    endTest();
    gameCanvas.drawGrid(mode, levelGridData);
}


// ####### GAME LOADY STUFF #######

 
function convertGridToBlocks(gridData) {
    let paddedGridData = Array(ROWS+2).fill().map(() => Array(COLS+2).fill(1));
    let rotation = 0;

    for (let i = 0; i < ROWS; i++) {
        for (let j = 0; j < COLS; j++) {
            paddedGridData[i + 1][j + 1] = gridData[i][j];
        }
    }

    for (let i=1; i<ROWS+1; i++) {
        for (let j=1; j<COLS+1; j++) {
            if (paddedGridData[i][j] === 1) {

                let s = new CanvasElement(j-1,i-1,1,1)

                s.spaceDown = !(paddedGridData[i+1][j] === 1);
                s.spaceUp = !(paddedGridData[i-1][j] == 1);
                s.spaceRight = !(paddedGridData[i][j+1] == 1);
                s.spaceLeft = !(paddedGridData[i][j-1] == 1);

                blocks.push(s);

            } else if (paddedGridData[i][j] >= 10 && paddedGridData[i][j] <= 13) {
                rotation = paddedGridData[i][j] - 10;

                for (let k=0; k<3; k++) {
                    spikes.push(new CanvasElement(j-1 + SSBs[k][rotation*4], i-1 + SSBs[k][rotation*4 + 1],SSBs[k][rotation*4 + 2],SSBs[k][rotation*4 + 3]))
                }

            }
        }
    }
}

function loadLevel(test, level) {
    if (!test) {
        console.log(`loaded level ${level}`);
        if (level === MAX_LEVEL + 1) {
            return;
        }
        currentLevel = level;

        levelGridData = savedLevels.get(`level${currentLevel}`);
        document.getElementById("levelTitle").innerHTML = `<b>Level ${currentLevel}</b>`
    }
    levelSpawn = findIndex(levelGridData, 2);

    you.setLeft(levelSpawn[1]);
    you.setTop(levelSpawn[0]);

    blocks = [];
    spikes = [];

    convertGridToBlocks(levelGridData);
}

function respawn() {

    gamePaused = true;

    for (let t=100;t<501;t+=50) {
        setTimeout(() => {
            fade -= 0.1;
        },t);
    }
    setTimeout(() => {
        you.setLeft(levelSpawn[1]);
        you.setTop(levelSpawn[0]);
        you.vx = 0;
        you.vy = 0;
    },500);

    for (let t=550;t<1001;t+=50) {
        setTimeout(() => {
            fade += 0.1;
        },t);
    }

    setTimeout(() => {
        gamePaused = false;
        console.log("respawned");
        fade = 1;
    },1000);

    
}

function findIndex(arr, targetNum) {
    for (let i=0; i<ROWS ;i++) {
        let j = arr[i].indexOf(targetNum);
        if (j !== -1) {
            return [i,j];
        }
    }
    throw `failed to find ${targetNum} in level data`;
}

function loadGame(test) {
    if (!test) {
        loadLevel(false, 1);
    } else {
        loadLevel(true, levelGridData);
    }

    lastTime = performance.now();
    animationFrame = requestAnimationFrame(update);
}

function toggleDebugMenu() {
    if (debugMenu.classList.contains("active")) {
        debugMenu.style.display = "none";
        debugMenu.classList.remove("active");
        return;
    }
    debugMenu.style.display = "block";
    debugMenu.classList.add("active");
}

function endTest() {
    cancelAnimationFrame(animationFrame);
    mode = 2;
    test = false;
    document.getElementById("toolbar").style.display = "flex";
    document.getElementById("secondaryButtons").style.display = "flex";
    document.getElementById("previewContainer").style.display = "flex";
    document.getElementById("testLevelButton").style.display = "flex";
    document.getElementById("endTestButton").style.display = "none";

    you.vx = 0;
    you.vy = 0;
}




// ####### GAMEPLAY #######

let isKeyDown = {a:false,d:false,space:false};
let animationFrame;

function executeKeyboardInputs(dt) {
    const perfLimitedAccel = ACCEL * dt;
    if (!isKeyDown.a && !isKeyDown.d) {
        if (Math.abs(you.vx) > ACCEL) {
            you.vx -= Math.sign(you.vx) * perfLimitedAccel;
        } else {
            you.vx = 0;
        }
    }

    if (isKeyDown.a && you.vx > -maxBaseSpeed) {
        you.vx -= perfLimitedAccel;
    }
    if (isKeyDown.d && you.vx < maxBaseSpeed) {
        you.vx += perfLimitedAccel;

    }
    if (isKeyDown.space && !you.falling) {
        you.vy = -jumpStrength;
    }
}

function updateDebugMenu() {
    document.getElementById("debugMenu").innerHTML = `x: ${you.l.toFixed(3)}<br>y: ${you.t.toFixed(3)}<br>vx: ${you.vx.toFixed(3)}<br>vy: ${you.vy.toFixed(3)}<br>time scale: ${timeScale}`;
}

function update(timestamp) {
    let dt = timeScale * (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    if (!gamePaused) {

    executeKeyboardInputs(dt);

    you.move(dt);

    if (you.vy < TERMINAL_V) {
        you.vy += GRAVITY * dt;
    }

    you.falling = true;

    you.checkAndResolveBoundaryCollision();
    blocks.forEach( block => {you.checkAndResolveBlockCollision(block)});

    if (you.checkGoalReached()) {
        if (test) {
            endTest();
        } else {
            loadLevel(false, currentLevel + 1);
        }
    }
    
    // hazard check
    if (spikes.some(spike => { return you.checkHazard(spike)})) {
        respawn();
    }

    }
    if (mode !== 2) {
        animationFrame = requestAnimationFrame(update);
    }
    gameCanvas.drawGrid(mode, levelGridData);

    //gameCanvas.ctx.fillStyle = "green";
    //blocks.forEach(block => {gameCanvas.ctx.fillRect(block.l*gameCanvas.tileSize ,block.t*gameCanvas.tileSize,3,3);});

    updateDebugMenu();
}

document.addEventListener("keydown", (KeyboardEvent) => {
    switch (KeyboardEvent.key) {
        case "d":
            isKeyDown.d = true;
            break;

        case "a":
            isKeyDown.a = true;
            break;

        case " ":
            KeyboardEvent.preventDefault();
            isKeyDown.space = true;
            break;
        
        case "/":
            toggleDebugMenu();
            break;

        case "=":
            timeScale += 4;
            break;

        case "-":
            timeScale -= 4;
            break;
    


        default:
            break;
    }
});

document.addEventListener("keyup", (KeyboardEvent) => {
    switch (KeyboardEvent.key) {
            case "d":
                isKeyDown.d = false;
                break;

            case "a":
                isKeyDown.a = false;
                break;

            case (" "):
                isKeyDown.space = false;
                break;

            default:
                break;
        }
});