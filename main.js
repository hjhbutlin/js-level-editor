let mode = 0; // 0 menu, 1 game, 2 editor
console.log(mode);

// CANVAS

const canvas = document.getElementById("grid");
const ctx = canvas.getContext("2d");

const rows = 16;
const cols = 32;
const globalScale = 50;

let scale = window.innerWidth / globalScale;

canvas.width = scale * cols;
canvas.height = scale * rows;
let tileSize = scale;

const tileColours = {
    1: "darkred",       // platform
    2: null,          // spike sold separately
    3: "darkcyan",    // spawn
    4: "darkgreen"      // goal
};

let levelGridData = Array(rows).fill().map(() => Array(cols).fill(0));
let spawnX = 0;
let spawnY = rows-1;
let goalY = rows-1;
let goalX = cols-1;

levelGridData[spawnY][spawnX] = 3;
levelGridData[goalY][goalX] = 4;

let selectedTool = 0;
let mouseDown = false;

function fillSpike(x,y,colour) {
    ctx.beginPath();
    ctx.moveTo(x * tileSize, y * tileSize + tileSize);
    ctx.lineTo(x * tileSize + tileSize / 2, y * tileSize);
    ctx.lineTo(x * tileSize + tileSize, y * tileSize + tileSize);
    ctx.closePath();
    ctx.fillStyle = colour;
    ctx.fill();
}


function drawGrid(mode) {
    canvas.width = scale * cols;
    canvas.height = scale * rows;
    let tileSize = scale;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    levelGridData[spawnY][spawnX] = 3;
    levelGridData[goalY][goalX] = 4;

    for (let y = 0; y < rows; y++) {

        for (let x = 0; x < cols; x++) {
            if (mode === 2) {
                ctx.strokeStyle = "gray";
                ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
            }
            
            // handle spike case
            if (levelGridData[y][x] === 2) {
                fillSpike(x, y, "red");
            } else if (tileColours[levelGridData[y][x]]) {
                ctx.fillStyle = tileColours[levelGridData[y][x]];
                ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
            }
        }
    }
    if (mode === 1) {
        ctx.fillStyle = "azure";
        ctx.fillRect(you.x * tileSize, you.y * tileSize, tileSize, tileSize);
    }
}


window.onresize = function() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (w > h*2) {
        scale = 2 * h / globalScale;
    } else {
        scale = w / globalScale;
    }
    canvas.width = scale * cols;
    canvas.height = scale * rows;
    tileSize = scale;
    drawGrid(mode);
};



// MAIN MENU

document.getElementById("startGame").addEventListener("click", () => {
    mode = 1;
    console.log(mode);

    document.querySelectorAll(".main-menu").forEach(element => {element.style.display = "none"});
    document.querySelectorAll(".game").forEach(element => {element.style.display = "block"});
    console.log("launched game");
    loadGame();
    drawGrid(mode);
});

document.getElementById("startEditor").addEventListener("click", () => {
    mode = 2;
    console.log(mode);
    levelGridData = Array(rows).fill().map(() => Array(cols).fill(0));

    document.querySelectorAll(".main-menu").forEach(element => {element.style.display = "none"});
    document.querySelectorAll(".editor").forEach(element => {element.style.display = "block"});
    console.log("launched editor");

    drawGrid(mode);
});


// BACK TO MENU

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