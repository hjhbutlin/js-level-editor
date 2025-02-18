function fillTile(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    let col = Math.floor(x / tileSize);
    let row = Math.floor(y / tileSize);

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

    drawGrid(isEditMode);
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
        
        document.querySelectorAll(".tool-button").forEach(btn => { btn.classList.remove("active")});

        button.classList.add("active");

        console.log(`Switched to ${button.dataset.name}`);
    });
});

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
    drawGrid(isEditMode);
    console.log("reset grid")
}
