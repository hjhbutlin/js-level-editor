document.getElementById("startEditor").addEventListener("click", () => {
    document.getElementById("main-menu").style.display = "none";
    
    document.getElementById("editor").style.display = "block";
    document.getElementById("toolbar").style.display = "block";
    
    console.log("Editor has started!");
});
