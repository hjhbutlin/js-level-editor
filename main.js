let mode = 0; // 0 menu, 1 game, 2 editor
console.log(mode);

// Physics Constants
let ACCEL = 0.1;
let GRAVITY = 0.1;
let maxBaseSpeed = 0.4;
let jumpStrength = 0.7;
let timeScale = 40;
const TERMINAL_V = 0.6;

// Game Constants
const MAX_LEVEL = 2;
let currentLevel = 1;
let totalLevels = 2;
let levelSpawn= [0,0];

const debugMenu = document.getElementById("debugMenu");

// Canvas Constants
const ROWS = 16;
const COLS = 32;
const GLOBAL_SCALE = 50;

// Editor/Game Grid Setup
let levelGridData = Array(ROWS).fill().map(() => Array(COLS).fill(0));
let spawnX = 0;
let spawnY = ROWS-1;
let goalY = ROWS-1;
let goalX = COLS-1;

levelGridData[spawnY][spawnX] = 3;
levelGridData[goalY][goalX] = 4;

let selectedTool = 0;
let mouseDown = false;


class Canvas {

    constructor(canvasID) {

        if (Canvas.instance) {
            return Canvas.instance;
        }

        this.canvas = document.getElementById(canvasID);
        this.ctx = this.canvas.getContext("2d");

        this.scale = window.innerWidth / GLOBAL_SCALE;

        this.canvas.width = this.scale * COLS;
        this.canvas.height = this.scale * ROWS;

        this.tileSize = this.scale;

        this.tileColours = {
            1: "darkred",       // platform
            2: null,          // spike sold separately
            3: "darkcyan",    // spawn
            4: "darkgreen"      // goal
        };
    }

    static GetInstance() {
        return CanvasTool.instance;
    }

    FillSpike(x,y,colour) {
        this.ctx.beginPath();
        this.ctx.moveTo(x * this.tileSize, y * this.tileSize + this.tileSize);
        this.ctx.lineTo(x * this.tileSize + this.tileSize / 2, y * this.tileSize);
        this.ctx.lineTo(x * this.tileSize + this.tileSize, y * this.tileSize + this.tileSize);
        this.ctx.closePath();
        this.ctx.fillStyle = colour;
        this.ctx.fill();
    }

    DrawGrid(mode, gridData) {
        this.canvas.width = this.scale * COLS;
        this.canvas.height = this.scale * ROWS;
        this.tileSize = this.scale;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        gridData[spawnY][spawnX] = 3;
        gridData[goalY][goalX] = 4;
    
        for (let y = 0; y < ROWS; y++) {
    
            for (let x = 0; x < COLS; x++) {
                if (mode === 2) {
                    this.ctx.strokeStyle = "gray";
                    this.ctx.strokeRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
                }
                
                // handle spike case
                if (gridData[y][x] === 2) {
                    Canvas.instance.FillSpike(x, y, "red");
                } else if (this.tileColours[gridData[y][x]]) {
                    this.ctx.fillStyle = this.tileColours[gridData[y][x]];
                    this.ctx.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
                }
            }
        }
        if (mode === 1) {
            this.ctx.fillStyle = "azure";
            this.ctx.fillRect(you.l * this.tileSize, you.t * this.tileSize, this.tileSize, this.tileSize);
        }
    }
}

window.onresize = function() {
    let scale;
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (w > h*2) {
        scale = 2 * h / GLOBAL_SCALE;
    } else {
        scale = w / GLOBAL_SCALE;
    }
    Canvas.canvas.width = scale * COLS;
    Canvas.canvas.height = scale * ROWS;
    Canvas.instance.DrawGrid(mode, levelGridData);
};

class SolidBlock {
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

class Player extends SolidBlock {
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

    checkGoalReached() {
        return (this.l < goalX + 1 && this.r > goalX && this.t < goalY + 1 && this.b > goalY);
    }
}


// Declarationnnn

Canvas.instance = new Canvas("grid");
let blocks = [];
let you = new Player(levelSpawn[0], levelSpawn[1], 1, 1);




// ####### MAIN MENU STUFF #######

document.getElementById("startGame").addEventListener("click", () => {
    mode = 1;
    console.log(mode);

    document.querySelectorAll(".main-menu").forEach(element => {element.style.display = "none"});
    document.querySelectorAll(".game").forEach(element => {element.style.display = "block"});
    console.log("launched game");
    loadGame();
    Canvas.instance.DrawGrid(mode,levelGridData);
});

document.getElementById("startEditor").addEventListener("click", () => {
    mode = 2;
    console.log(mode);
    levelGridData = Array(ROWS).fill().map(() => Array(COLS).fill(0));

    document.querySelectorAll(".main-menu").forEach(element => {element.style.display = "none"});
    document.querySelectorAll(".editor").forEach(element => {element.style.display = "block"});
    console.log("launched editor");

    Canvas.instance.DrawGrid(mode, levelGridData);
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
    const rect = Canvas.instance.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    let col = Math.floor(x / Canvas.instance.tileSize);
    let row = Math.floor(y / Canvas.instance.tileSize);

    try {
        levelGridData[row][col] = selectedTool;
    } catch (error) {
        if (error instanceof TypeError) {
            console.log("rectified index out of range error")
            row = row < 0 ? 0 : row > 15 ? 15 : row;
            col = col < 0 ? 0 : col > 31 ? 31 : col;
        }
    }

    if (selectedTool === 3) {
        levelGridData[spawnY][spawnX] = 0;
        spawnX = col;
        spawnY = row;
    } else if (selectedTool === 4) {
        levelGridData[goalY][goalX] = 0;
        goalX = col;
        goalY = row;
    }

    Canvas.instance.DrawGrid(mode, levelGridData);
}

Canvas.instance.canvas.addEventListener("mousedown", (event) => {
    mouseDown = true;
    fillTile(event);
});

Canvas.instance.canvas.addEventListener("mousemove", (event) => {
    if (mouseDown) {
    fillTile(event);
    }
});

Canvas.instance.canvas.addEventListener("mouseup", (event) => {
    mouseDown = false;
});


document.querySelectorAll(".tool-button").forEach(button => {
    button.addEventListener("click", () => {
        selectedTool = Number(button.dataset.tool);
        
        document.querySelectorAll(".tool-button").forEach(btn => { btn.classList.remove("active")});

        button.classList.add("active");

        console.log(`Switched to ${button.dataset.name}`);
    });
});

document.getElementById("ResetButton").onclick = function() {
    document.querySelectorAll(".tool-button").forEach(btn => btn.classList.remove("active"));
    levelGridData = Array(ROWS).fill().map(() => Array(COLS).fill(0));
    spawnX = 0;
    spawnY = ROWS-1;
    goalY = ROWS-1;
    goalX = COLS-1;
    levelGridData[spawnY][spawnX] = 3;
    levelGridData[goalY][goalX] = 4;
    selectedTool = 0;
    Canvas.instance.DrawGrid(mode, levelGridData);
    console.log("reset grid")
}




// ####### GAME LOADY STUFF #######

 
function convertGridToBlocks(gridData) {
    let output = [];
    let paddedGridData = Array(ROWS+2).fill().map(() => Array(COLS+2).fill(1));

    for (let i = 0; i < ROWS; i++) {
        for (let j = 0; j < COLS; j++) {
            paddedGridData[i + 1][j + 1] = gridData[i][j];
        }
    }

    for (let i=1; i<ROWS+1; i++) {
        for (let j=1; j<COLS+1; j++) {
            if (paddedGridData[i][j] === 1) {

                let s = new SolidBlock(j-1,i-1,1,1)

                if (paddedGridData[i+1][j] === 1) { s.spaceDown = false; }
                if (paddedGridData[i-1][j] === 1) { s.spaceUp = false; }
                if (paddedGridData[i][j+1] === 1) { s.spaceRight = false; }
                if (paddedGridData[i][j-1] === 1) { s.spaceLeft = false; }

                output.push(s);
            }
        }
    }
    
    return output;
}

function loadLevel(level) {
    console.log(`loaded level ${level}`);
    if (level === MAX_LEVEL + 1) {
        return;
    }
    currentLevel = level;

    levelGridData = savedLevels.get(`level${currentLevel}`);
    document.getElementById("levelTitle").innerHTML = `<b>Level ${currentLevel}</b>`

    levelSpawn = findIndex(levelGridData, 3);

    you.setLeft(levelSpawn[1]);
    you.setTop(levelSpawn[0]);

    blocks = convertGridToBlocks(levelGridData);
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

function loadGame() {

    loadLevel(1);

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

    executeKeyboardInputs(dt);

    you.move(dt);

    if (you.vy < TERMINAL_V) {
        you.vy += GRAVITY * dt;
    }

    you.falling = true;

    you.checkAndResolveBoundaryCollision();
    blocks.forEach( block => {you.checkAndResolveBlockCollision(block)});

    if (you.checkGoalReached()) {
        loadLevel(currentLevel + 1);
    }

    //hazardCheck();

    animationFrame = requestAnimationFrame(update);
    Canvas.instance.DrawGrid(mode, levelGridData);

    //Canvas.instance.ctx.fillStyle = "green";
    //blocks.forEach(block => {Canvas.instance.ctx.fillRect(block.l*Canvas.instance.tileSize ,block.t*Canvas.instance.tileSize,3,3);});

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