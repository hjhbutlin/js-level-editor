// ####### SETUP #######

// constants, but I may modify with new game elements so using let
let ACCEL = 0.1;
let GRAVITY = 0.1;
let maxBaseSpeed = 0.4;
let jumpStrength = 0.7;

let currentLevel = 1;
let totalLevels = 2;
let levelSpawn= [0,0];

const debugMenu = document.getElementById("debugMenu");

class player {
    constructor(x,y,vx,vy) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.falling = false;
    }

    move() {
        this.x += this.vx;
        this.y += this.vy;
    }
}



// ####### GAME LOADY STUFF #######

let you = new player(levelSpawn[0], levelSpawn[1], 0, 0);

function nextLevel() {
    currentLevel += 1;
    document.getElementById("levelTitle").innerHTML = `<b>Level ${currentLevel}</b>`
}

function findIndex(arr, targetNum) {
    for (let i=0; i<rows ;i++) {
        let j = arr[i].indexOf(targetNum);
        if (j !== -1) {
            return [i,j];
        }
    }
    throw `failed to find ${targetNum} in level data`;
}

function loadGame() {
    levelGridData = savedLevels.get("level1");
    levelSpawn = findIndex(levelGridData, 3);
    you.x = levelSpawn[1];
    you.y = levelSpawn[0];
    console.log(you.y);

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



// ####### GAMEPLAY STUFF #######

let isKeyDown = {a:false,d:false};
let animationFrame;

function executeKeyboardInputs() {
    if (!isKeyDown.a && !isKeyDown.d) {
        if (Math.abs(you.vx) > ACCEL) {
            you.vx -= Math.sign(you.vx) * ACCEL;
        } else {
            you.vx = 0;
        }
    }

    if (isKeyDown.a && you.vx > -maxBaseSpeed) {
        you.vx -= ACCEL;
    }
    if (isKeyDown.d && you.vx < maxBaseSpeed) {
        you.vx += ACCEL;
    }
}

function boundaryCheckAndResolve() {
    if (you.x + you.vx <= 0) {
        you.x = 0;
        you.vx = 0;
    } else if (you.x + you.vx >= cols-1) {
        you.x = cols - 1;
        you.vx = 0;
    }

    if (you.y + you.vy <= 0) {
        you.y = 0;
        you.vy = 0;
    } else if (you.y + you.vy >= rows-1) {
        you.y = rows - 1;
        you.vy = 0;
        you.falling = false;
    }
}

function updateDebugMenu() {
    document.getElementById("debugMenu").innerHTML = `x: ${you.x.toFixed(3)}<br>y: ${you.y.toFixed(3)}<br>vx: ${you.vx.toFixed(3)}<br>vy: ${you.vy.toFixed(3)}<br>falling: ${you.falling}`
}


function update() {

    you.vy += GRAVITY;

    executeKeyboardInputs();

    boundaryCheckAndResolve();

    //platformCheckAndResolve();

    //hazardCheck();

    you.move();

    animationFrame = requestAnimationFrame(update);
    drawGrid(mode);

    updateDebugMenu();
}

document.addEventListener("keydown", (KeyboardEvent) => {
    if (mode === 1) {
        switch (KeyboardEvent.key) {
            case "d":
                isKeyDown.d = true;
                break;

            case "a":
                isKeyDown.a = true;
                break;

            case " ":
                you.vy = -jumpStrength;
                you.falling = true;
                break;
            
            case "/":
                toggleDebugMenu();

            default:
                break;
        }
    }
});

document.addEventListener("keyup", (KeyboardEvent) => {
    if (mode === 1) {
        if (KeyboardEvent.key === "a") {
            isKeyDown.a = false;
        }
        if (KeyboardEvent.key === "d") {
            isKeyDown.d = false;
        }
    }
});

animationFrame = requestAnimationFrame(update);