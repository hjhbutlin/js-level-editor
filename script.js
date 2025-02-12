const canvas = document.getElementById("gameGrid");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 400;

const tileSize = 25;
const rows = canvas.height / tileSize;
const cols = canvas.width / tileSize;

let levelData = Array(rows).fill().map(() => Array(cols).fill(0)); // Empty grid
let selectedTool = 0;





function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            ctx.strokeStyle = "gray";
            ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
            if (levelData[y][x] === 1) {
                ctx.fillStyle = "brown";
                ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
            }
        }
    }
}

levelData[2][9] = 1;

drawGrid();


document.getElementById("selectPlatform").onclick = function() {
    selectedTool = 1;
    console.log("switched to platform")
}

document.getElementById("selectSpike").onclick = function() {
    selectedTool = 2;
    console.log("switched to spike")
}