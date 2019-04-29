let board;
let firstInitialization = true;
const darkBrown = getComputedStyle(document.documentElement).getPropertyValue('--darkBrown');
const initializationDuration = 1000;
const shufflingDuration = 1000;
const zoomingDuration = 1000;
const wakeUpDuration = 2000;
const gameOverDuartion = zoomingDuration * 16;
document.documentElement.style.setProperty('--boardSize',  100/window.innerWidth * Math.ceil(window.innerWidth*0.85/4)*4 + 'vw');

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
    board = Array.from({length: 15}, (_, i) => i+1);
    
    do {
        board = board.map((a) => [Math.random(),a]).sort((a,b) => a[0]-b[0]).map((a) => a[1]);
        if (!isPuzzleSolvable()) [board[13], board[14]] = [board[14], board[13]];
    } while(board.some((item, index) => item == index + 1));
    // board = [1,2,3,4,5,6,7,8,9,10,15,11,13,14,12];
    // board = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15];
    
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
        tile.style.transition = `all ${shufflingDuration/1000}s ease-in-out`;
        tile.style.transform = `translate(${offsetleft}px, ${offsetTop}px)`;
    });
    firstInitialization = false;
    setTimeout(function() {document.querySelectorAll('.tile').forEach(function(tile, index){
        tile.textContent = board[index];
        tile.id = `tile${board[index]}`;
        tile.style.pointerEvents = "";
        tile.removeAttribute("style")})}, shufflingDuration);
}
const wakeUp = () => {
    document.querySelectorAll('.tile').forEach(function(tile){
        tile.style.background = "";
        tile.style.pointerEvents = "";
    });
    document.querySelectorAll('span').forEach(function(char){
        char.style.color = "";
    });
    setTimeout(function() {
        document.querySelectorAll('.tile').forEach(function(tile){
        tile.removeAttribute("style")});
        document.querySelectorAll('span').forEach(function(char){
        char.removeAttribute("style")});
        initializeBoard()}, wakeUpDuration);
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
        if (position >= tileSize) {     
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
            step = position + step > tileSize ? tileSize % step : step;
            position += step;

            movingTilesElements.forEach(function(tile){
                tile.style.setProperty(direction, position + 'px');
            });
        }
    }
    if (isPuzzleSolved()) finalizeGame();
}

const isPuzzleSolved = () => { 
    return board.every((val, i, arr) => !i || (val >= arr[i - 1]));
}

const finalizeGame = () => {
    const titleLength = document.querySelectorAll('h1 span').length;
    document.querySelectorAll('.tile').forEach(function(tile){
        tile.style.pointerEvents = "none";
    });

    let  zoomingInterval = setInterval(zooming, zoomingDuration);
    let tileNumber = 0;
    function zooming(){
        if (tileNumber == 15){
            document.querySelector(`#tile${tileNumber}`).style.background = darkBrown;
            document.querySelector('#tile15').classList.remove("zoom");
            clearInterval(zoomingInterval);
        } else {
            if (tileNumber) {
                document.querySelector(`#tile${tileNumber}`).style.background = darkBrown;
                document.querySelector(`#tile${tileNumber}`).classList.remove("zoom");
            }
            document.querySelector(`#tile${tileNumber+1}`).classList.add("zoom");
            document.querySelector(`#tile${tileNumber+1}`).style.transition = `background ${wakeUpDuration/1000}s ease-in-out`;
            tileNumber++;
        }
    }

    let charNumber = 1;
    function browningTitle(){
        if (charNumber > titleLength){
            return;
        } else {
            document.querySelector(`#char${charNumber}`).style.transition = `color ${16*zoomingDuration/titleLength/1000}s ease-in-out`;
            document.querySelector(`#char${charNumber}`).style.color = darkBrown;
            charNumber++;
        }
        setTimeout(browningTitle, 16*zoomingDuration/titleLength);
    }
    browningTitle();

    setTimeout(function() {document.querySelectorAll('.tile').forEach(function(tile){
        tile.style.pointerEvents = ""})}, gameOverDuartion);
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
window.onload = setTimeout(initializeBoard, initializationDuration);

