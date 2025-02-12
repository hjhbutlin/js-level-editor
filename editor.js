const canvas = document.getElementById("gameGrid");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 400;

const tileSize = 25;
const rows = canvas.height / tileSize;
const cols = canvas.width / tileSize;

const tileColors = {
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


function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    levelGridData[spawnY][spawnX] = 3;
    levelGridData[goalY][goalX] = 4;

    for (let y = 0; y < rows; y++) {

        for (let x = 0; x < cols; x++) {
            ctx.strokeStyle = "gray";
            ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
            
            // handle spike case
            if (levelGridData[y][x] === 2) {
                fillSpike(x, y, "red");
            } else if (tileColors[levelGridData[y][x]]) {
                ctx.fillStyle = tileColors[levelGridData[y][x]];
                ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
            }
        }
    }
}

drawGrid();

function fillTile(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const col = Math.floor(x / tileSize);
    const row = Math.floor(y / tileSize);

    if (selectedTool === 3) {
        levelGridData[spawnY][spawnX] = 0;
        spawnX = col;
        spawnY = row;
    } else if (selectedTool === 4) {
        levelGridData[goalY][goalX] = 0;
        goalX = col;
        goalY = row;
    }

    levelGridData[row][col] = selectedTool;
    

    drawGrid();
}

canvas.addEventListener("mousedown", (event) => {
    mouseDown = true;
    fillTile(event);
});

canvas.addEventListener("mousemove", (event) => {
    if (mouseDown) {
       fillTile(event);
    }
});

canvas.addEventListener("mouseup", (event) => {
    mouseDown = false;
});

document.querySelectorAll(".tool-button").forEach(button => {
    button.addEventListener("click", () => {
        selectedTool = Number(button.dataset.tool);
        
        document.querySelectorAll(".tool-button").forEach(btn => btn.classList.remove("active"));

        button.classList.add("active");

        console.log(`Switched to ${button.dataset.name}`);
    });
});

function saveLevel() {
    const levelDataString = JSON.stringify(levelGridData);
    const levelName = prompt("Enter a name for your level:", "level1.txt");

    if (!levelName) {
        alert("Level name cannot be empty. Using default name: level1.txt");
        levelName = "level1.txt"; // Default name
    }

    const blob = new Blob([levelDataString], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = levelName;
    link.click();
}

document.getElementById('SaveButton').addEventListener('click', saveLevel);

document.getElementById("ResetButton").onclick = function() {
    document.querySelectorAll(".tool-button").forEach(btn => btn.classList.remove("active"));
    levelGridData = Array(rows).fill().map(() => Array(cols).fill(0));
    spawnX = 0;
    spawnY = rows-1;
    goalY = rows-1;
    goalX = cols-1;
    levelGridData[spawnY][spawnX] = 3;
    levelGridData[goalY][goalX] = 4;
    selectedTool = 0;
    drawGrid();
    console.log("reset grid")
}

document.getElementById("backButton").addEventListener("click", () => {
    document.getElementById("main-menu").style.display = "block";
    
    document.getElementById("editor").style.display = "none";
    document.getElementById("toolbar").style.display = "none";
    
    console.log("Editor has started!");
});