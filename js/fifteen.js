

let board;
let firstInitialization = true;

const isPuzzleSolvable = () => {
    let numberOfInversions = 0;
    for (i = 0; i < board.length-1; i++){
        for (j = i+1; j < board.length; j++){
            if (board[i] > board[j]) numberOfInversions++;
        }
    }
    if (numberOfInversions % 2 == 0) return true;    
    return false;
}

const randomizeBoard = () => {
    // for (i = board.length - 1; i > 0; i--) {
    //     const j = Math.floor(Math.random() * (i + 1));
    //     [board[i], board[j]] = [board[j], board[i]];
    // }
    // board = board.sort(() => Math.random() - 0.5);
    board = Array.from({length: 15}, (_, i) => i+1);
    
    do {
        board = board.map((a) => [Math.random(),a]).sort((a,b) => a[0]-b[0]).map((a) => a[1]);
        if (!isPuzzleSolvable()) [board[13], board[14]] = [board[14], board[13]];
    } while(board.some((item, index) => item == index + 1));
    // board = [1,2,3,4,5,6,7,8,9,10,15,11,13,14,12];
    
    board.push(16);
}

const initializeBoard = () => {
    randomizeBoard();

    document.querySelectorAll('.tile').forEach(function(tile){
        let destinationTile = document.querySelectorAll('.tile')[board.indexOf(parseInt(tile.id.replace(/[^0-9]/g,'')))];
        let offsetleft =  destinationTile.offsetLeft - tile.offsetLeft;
        let offsetTop = destinationTile.offsetTop - tile.offsetTop;
        tile.style.pointerEvents = "none";
        if (firstInitialization) tile.addEventListener("click", function() {moveTile(this.id)});
        tile.style.transition = 'all 1s ease-in-out';
        tile.style.transform = `translate(${offsetleft}px, ${offsetTop}px)`;
    });
    firstInitialization = false;
    setTimeout(function() {document.querySelectorAll('.tile').forEach(function(tile, index){
        tile.textContent = board[index];
        tile.id = `tile${board[index]}`;
        tile.style.pointerEvents = "";
        tile.removeAttribute("style")})}, 1000);

}
const wakeUp = id => {
    document.querySelectorAll('.tile').forEach(function(tile){
        tile.style.background = "";
        tile.style.pointerEvents = "";
        // tile.removeAttribute("style");
    });
    document.querySelectorAll('span').forEach(function(char){
        char.style.color = "";
    });
    setTimeout(function() {
        document.querySelectorAll('.tile').forEach(function(tile){
        tile.removeAttribute("style")});
        document.querySelectorAll('span').forEach(function(char){
        char.removeAttribute("style")});
        initializeBoard()}, 2000);
}
const moveTile = id => {

    if (isPuzzleSolved()){
        wakeUp();
        return;
    }
    let clickedTilePosition = board.indexOf(parseInt(id.replace(/[^0-9]/g,'')));
    let emptyTilePosition = board.indexOf(16);
    let movingTilesPositions = getMovingTiles(emptyTilePosition, clickedTilePosition);

    if (movingTilesPositions.length == 0) return;

    let movingTilesElements = [];

    movingTilesPositions.forEach(function(tile, index){
        movingTilesElements[index] = document.querySelector(`#tile${tile}`);
    });
   
    let emptyTileElement = document.querySelector('#tile16');
    let position = 0;
    let step = 4;

    const tileSize = Math.abs(movingTilesElements[0].offsetLeft - emptyTileElement.offsetLeft ||
        movingTilesElements[0].offsetTop - emptyTileElement.offsetTop);

    let direction;
    switch(emptyTilePosition - clickedTilePosition) {
        case 1: case 2: case 3:   
            direction = 'left'; 
            break;
        case -1: case -2: case -3: 
            direction = 'right'; 
            break;
        case 4: case 8: case 12:   
            direction = 'top';
            break;
        case -4: case -8: case -12:   
            direction = 'bottom'; 
            break;
        } 

    let  slidingInterval = setInterval(sliding, 5);
    
    function sliding() {
        if ((position <= -tileSize) || (position >= tileSize)) {     
            clearInterval(slidingInterval);

            movingTilesElements.forEach(function(tile){
                tile.removeAttribute("style");
                emptyTileElement.textContent = tile.textContent;
                emptyTileElement.id = tile.id;
                tile.textContent = 16;
                tile.id = "tile16";
                emptyTileElement = document.querySelector('#tile16');  
            });
        } else {
             //step = tileSize % step ? tileSize % step : step;
            position += step;

            movingTilesElements.forEach(function(tile){
                tile.style.setProperty(direction, position + 'px');
            });
        }
    }
    if (isPuzzleSolved()) finalizeGame();
}

const isPuzzleSolved = () => {

    // for (i = 0; i < board.length - 1; i++) {
    //     if (board[i] > board[i + 1]) {
    //         return false;
    //     }
    // }
    // return true;
    
    return board.every((val, i, arr) => !i || (val >= arr[i - 1]));
}

const finalizeGame = () => {
 
    document.querySelectorAll('.tile').forEach(function(tile){
        tile.style.pointerEvents = "none";
    });

    let  zoomingInterval = setInterval(zooming, 1000);
    let tileNumber = 0;
    function zooming(){
        if (tileNumber == 15){
            document.querySelector(`#tile${tileNumber}`).style.background = "#5F4B32";
            document.querySelector('#tile15').classList.remove("zoom");
            clearInterval(zoomingInterval);
        } else {
            if (tileNumber) {
                document.querySelector(`#tile${tileNumber}`).style.background = "#5F4B32";
                document.querySelector(`#tile${tileNumber}`).classList.remove("zoom");
            }
            document.querySelector(`#tile${tileNumber+1}`).classList.add("zoom");
            document.querySelector(`#tile${tileNumber+1}`).style.transition = 'background 2s ease-in-out';
            // document.querySelector(`#char${Math.floor(tileNumber/2+1)}`).classList.add("brown");


            document.querySelector(`#char${Math.floor(tileNumber/2+1)}`).style.transition = 'color 2s ease-in-out';
            document.querySelector(`#char${Math.floor(tileNumber/2+1)}`).style.color = "#5F4B32";
            tileNumber++;
        }
    }

    setTimeout(function() {document.querySelectorAll('.tile').forEach(function(tile){
        tile.style.pointerEvents = ""})}, 16000);
  
}

const getMovingTiles = (emptyTilePosition, clickedTilePosition) => {

    let movingTiles = [];
    const span =  clickedTilePosition - emptyTilePosition;
    
    switch (Math.abs(span)) {
        
        case 1: case 2: case 3: case 4: case 8: case 12:
            
            if (Math.min(clickedTilePosition, emptyTilePosition) % 4 > Math.max(clickedTilePosition, emptyTilePosition) % 4) break; 
            const numberOfTiles = Math.abs(span) <= 3 ? Math.abs(span) : Math.abs(span/4);

            // for (i = numberOfTiles; i >= 1; i--) 
            Array.from({length: numberOfTiles}, (_, i) => i+1).reverse().forEach(function(){
                nextTileMoving = emptyTilePosition  + span/numberOfTiles;
                movingTiles.push(board[nextTileMoving]);
                [board[emptyTilePosition], board[nextTileMoving]] = [board[nextTileMoving], board[emptyTilePosition]];
                emptyTilePosition = nextTileMoving;
             });
        default:
            break;
    }
    return movingTiles;
}

window.onload = setTimeout(function() {
    // document.querySelectorAll('.tile').forEach(function(tile){
    //     tile.addEventListener("click", function() {moveTile(this.id)});
    // });
    initializeBoard()}, 1000);

