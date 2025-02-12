const canvas = document.getElementById("gameGrid");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 400;

const tileSize = 25;
const rows = canvas.height / tileSize;
const cols = canvas.width / tileSize;

let levelGridData = Array(rows).fill().map(() => Array(cols).fill(0)); // Empty grid
let selectedTool = 0;

function fillSpike(x,y,colour) {
    ctx.beginPath();
    ctx.moveTo(x*tileSize, y*tileSize);
    ctx.lineTo(x*tileSize + tileSize, y*tileSize);
    ctx.lineTo(x*tileSize + tileSize/2, y*tileSize + tileSize);
    ctx.closePath();

    ctx.fillStyle = colour;
    ctx.fill();
}


function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            ctx.strokeStyle = "gray";
            ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
            switch(levelGridData[y][x]) {
                case 1:
                    ctx.fillStyle = "brown";
                    ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
                    break;
                case 2:
                    fillSpike(x,y,"brown");
                    break;

            }
        }
    }
}

drawGrid();


canvas.addEventListener("click", (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const col = Math.floor(x / tileSize);
    const row = Math.floor(y / tileSize);

    levelGridData[row][col] = selectedTool;

    drawGrid();
});

document.getElementById("selectPlatform").onclick = function() {
    selectedTool = 1;
    console.log("switched to platform")
}

document.getElementById("selectSpike").onclick = function() {
    selectedTool = 2;
    console.log("switched to spike")
}

document.getElementById("selectDelete").onclick = function() {
    selectedTool = 0;
    console.log("switched to delete")
}

document.getElementById("selectClear").onclick = function() {
    levelGridData = Array(rows).fill().map(() => Array(cols).fill(0));
    drawGrid();
    console.log("switched to clear")
}