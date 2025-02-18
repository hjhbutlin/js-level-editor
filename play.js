let currentLevel = 1;
let totalLevels = 2;
let yourCoords = [0,0], levelSpawn= [0,0];

function nextLevel() {
    currentLevel += 1;
    document.getElementById("levelTitle").innerHTML = `<b>Level ${currentLevel}</b>`
}

function findIndex(targetNum) {
    for (let row=0; i<rows ;i++) {
        let j = levelGridData[i].indexOf(targetNum);
        if (j !== -1) {
            return [i,j];
        }
    }
    throw `failed to find ${targetNum} in level data`;
}

function loadGame() {
    levelGridData = savedLevels.get(level1);
}


document.addEventListener("keydown", (KeyboardEvent) => {
    switch (KeyboardEvent.key) {
        case "d":
            yourCoords[0] += 1;
            break;
        case "a":
            yourCoords[0] -= 1;
            break;
        case " ":
            yourCoords[1] -= 1;
            break;
        case "s":
            yourCoords[1] += 1;
            break;

    }
    drawGrid(isEditMode)
});


