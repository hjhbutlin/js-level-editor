// ####### SETUP #######

// constants, but I may modify with new game elements so using let
let ACCEL = 0.1;
let GRAVITY = 0.1;
let maxBaseSpeed = 0.4;
let jumpStrength = 0.7;
let timeScale = 40;

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
    }

    refreshContacts() {
        this.contactLeft = false;
        this.contactRight = false;
        this.contactTop = false;
        this.contactBottom = false;
    }

    move(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
    }
}



// ####### GAME LOADY STUFF #######

let you = new player(levelSpawn[0], levelSpawn[1], 0, 0);
you.refreshContacts();

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
    levelGridData = savedLevels.get("level0");
    levelSpawn = findIndex(levelGridData, 3);
    you.x = levelSpawn[1];
    you.y = levelSpawn[0];
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



// ####### GAMEPLAY STUFF #######

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
        you.contactLeft = false;
    }
    if (isKeyDown.d && you.vx < maxBaseSpeed) {
        you.vx += perfLimitedAccel;
        you.contactRight = false;
    }
    if (isKeyDown.space && you.contactBottom) {
        you.vy = -jumpStrength;
        you.contactBottom = false;
    }
    you.move(dt);

}

function canvasBoundaryCheckAndResolve() {
    
}

function updateDebugMenu() {
    document.getElementById("debugMenu").innerHTML = `x: ${you.x.toFixed(3)}<br>y: ${you.y.toFixed(3)}<br>vx: ${you.vx.toFixed(3)}<br>vy: ${you.vy.toFixed(3)}<br>contacts (LRTB): ${you.contactLeft} ${you.contactRight} ${you.contactTop} ${you.contactBottom}<br>time scale: ${timeScale}`;
}

function boundaryCheckAndResolve(dt) {

    const nextX = you.x + you.vx * dt;
    const nextY = you.y + you.vy * dt;

    function resolveX() {
        you.x = Math.round(nextX);
        you.vx = 0;
    }
    function resolveY() {
        you.y = Math.round(nextY);
        you.vy = 0;
    }
    
    // left wall
    if (nextX <= 0) {
        resolveX();
        you.contactLeft = true;
    } else {
        you.contactLeft = false;
    }
    // right wall
    if (nextX >= cols - 1) {
        resolveX();
        you.contactRight = true;
    } else {
        you.contactRight = false;
    }

    // top wall
    if (nextY <= 0) {
        resolveY();
        you.contactTop= true;
    } else {
        you.contactTop = false;
    }
    // bottom wall
    if (nextY >= rows - 1) {
        resolveY();
        you.contactBottom = true;
    } else {
        you.contactBottom = false;
    }

    try {
        
        // bottom touching surface?
        if (!you.contactBottom) {

            // bottom left |_
            if (!you.contactLeft) {
                if (levelGridData[Math.floor(nextY) + 1][Math.floor(nextX)] === 1) {
                    resolveY();
                    you.contactBottom = true;
                }
            }

            // bottom right _|
            if (!you.contactRight) {
                if (levelGridData[Math.floor(nextY) + 1][Math.floor(nextX) + 1] === 1) {
                    resolveY();
                    you.contactBottom = true
                }
            }
        }

        // top touching surface?
        if (!you.contactTop) {

            // top left
            if (!you.contactLeft) {
                if (levelGridData[Math.floor(nextY)][Math.floor(nextX)] === 1) {
                    resolveY();
                    you.contactTop = true;
                }
            }

            // top right
            else if (!you.contactRight) {
                if (levelGridData[Math.floor(nextY)][Math.floor(nextX) + 1] === 1) {
                    resolveY();
                    you.contactTop = true
                }
            }
        }

        // left touching surface?
        if (!you.contactLeft) {

            // top left
            if (!you.contactTop) {
                if (levelGridData[Math.floor(nextY)][Math.floor(nextX)] === 1) {
                    resolveX();
                    you.contactLeft = true;
                }
            }

            // bottom left
            if (!you.contactBottom) {
                if (levelGridData[Math.floor(nextY) + 1][Math.floor(nextX)] === 1) {
                    resolveX();
                    you.contactLeft = true
                }
            }
        }

        // right touching surface?
        if (!you.contactRight) {
        
            // bottom right
            if (!you.contactBottom) {
                if (levelGridData[Math.floor(nextY) + 1][Math.floor(nextX) + 1 ] === 1) {
                    resolveX();
                    you.contactRight = true;
                }
            }

            // top right
            if (!you.contactTop) {
                if (levelGridData[Math.floor(nextY)][Math.floor(nextX) + 1] === 1) {
                    resolveX();
                    you.contactRight = true
                }
            }
        }
    } catch (error) {
        console.log(nextX, nextY);
        console.log(Math.floor(nextX) + 1)

        throw(error);
    }
}

function update(timestamp) {
    let dt = timeScale * (timestamp - lastTime) / 1000;
    lastTime = timestamp;
    executeKeyboardInputs(dt);

    boundaryCheckAndResolve(dt);

    if (!you.contactBottom) {
        you.vy += GRAVITY * dt;
        you.contactTop = false;
    }

    //hazardCheck();

    animationFrame = requestAnimationFrame(update);
    drawGrid(mode);

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