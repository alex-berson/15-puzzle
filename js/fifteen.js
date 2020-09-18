let board = [];
let firstInitialization = true;
const slidingDuration = 150;
const initializationDuration = 2000;
const shufflingDuration = 1000;
const zoomingDuration = 1000;
const wakeUpDuration = 2000;
const finalizationDuartion = zoomingDuration * 16 + 100;
const darkBrown = getComputedStyle(document.documentElement).getPropertyValue('--darkBrown');
const boardSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--boardSize').replace(/[^0-9]/g,''))/100;

if (window.innerHeight > window.innerWidth) {
    document.documentElement.style.setProperty('--boardSize', 100/window.innerWidth * Math.ceil(window.innerWidth*boardSize/4)*4 + 'vmin');
} else {
    document.documentElement.style.setProperty('--boardSize', 100/window.innerHeight * Math.ceil(window.innerHeight*boardSize/4)*4 + 'vmin');
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('service-worker.js')
      .then(reg => {
        console.log('Service worker registered!', reg);
      })
      .catch(err => {
        console.log('Service worker registration failed: ', err);
      });
  });
}

const isPuzzleSolvable = () => {
    let numberOfInversions = 0;
    for (i = 0; i < board.length-1; i++){
        for (j = i+1; j < board.length; j++){
            if (board[i] > board[j]) numberOfInversions++;
        }
    }
    if (numberOfInversions % 2) return false;    
    return true;
}

const randomizeBoard = () => {
    board = Array.from({length: 15}, (_, i) => i+1);
    do {
        board = board.map((a) => [Math.random(),a]).sort((a,b) => a[0]-b[0]).map((a) => a[1]);
        if (!isPuzzleSolvable()) [board[13], board[14]] = [board[14], board[13]];
    } while(board.some((item, index) => item == index + 1));
    // board = [1,2,3,4,5,6,7,8,9,10,15,11,13,14,12];
    board.push(16);
}

const getMovingTiles = (emptyTilePosition, clickedTilePosition) => {
    let movingTiles = [];
    const span =  clickedTilePosition - emptyTilePosition;
    
    switch (Math.abs(span)) {
        
        case 1: case 2: case 3: case 4: case 8: case 12:
            
            if (Math.min(clickedTilePosition, emptyTilePosition) % 4 > Math.max(clickedTilePosition, emptyTilePosition) % 4) break; 
            const numberOfTiles = Math.abs(span) <= 3 ? Math.abs(span) : Math.abs(span/4);

            for (i = numberOfTiles; i >= 1; i--){
                nextTileMoving = emptyTilePosition  + span/numberOfTiles;
                movingTiles.push(board[nextTileMoving]);
                [board[emptyTilePosition], board[nextTileMoving]] = [board[nextTileMoving], board[emptyTilePosition]];
                emptyTilePosition = nextTileMoving;
            }
    }
    return movingTiles;
}

const isPuzzleSolved = () => { 
    return board.every((val, i, arr) => !i || (val >= arr[i - 1]));
}

const initializeBoard = () => {
    randomizeBoard();
    document.querySelectorAll('.tile').forEach(function(tile){
        let destinationTile = document.querySelectorAll('.tile')[board.indexOf(parseInt(tile.id.replace(/[^0-9]/g,'')))];
        let offsetLeft =  destinationTile.offsetLeft - tile.offsetLeft;
        let offsetTop = destinationTile.offsetTop - tile.offsetTop;
        tile.style.pointerEvents = "none";
        if (firstInitialization) {
            tile.addEventListener("touchstart", function() {moveTiles(this.id)});
            tile.addEventListener("mousedown", function() {moveTiles(this.id)});
        }
        tile.style.transition = `all ${shufflingDuration/1000}s ease-in-out`;
        tile.style.transform = `translate(${offsetLeft}px, ${offsetTop}px)`;
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
        tile.style.pointerEvents = "none";
        tile.style.background = "";
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

const moveTiles = id => {

    if (isPuzzleSolved()){
        wakeUp();
        return;
    }
    let clickedTilePosition = board.indexOf(parseInt(id.replace(/[^0-9]/g,'')));
    let emptyTilePosition = board.indexOf(16);
    let movingTilesPositions = getMovingTiles(emptyTilePosition, clickedTilePosition);

    if (movingTilesPositions.length == 0) return;
    document.querySelectorAll('.tile').forEach(function(tile){
        tile.style.pointerEvents = "none";
        tile.style.transition = `all ${slidingDuration/1000}s ease-in-out`;
    });

    let movingTilesElements = [];

    movingTilesPositions.forEach(function(tile, index){
        movingTilesElements[index] = document.querySelector(`#tile${tile}`);
    });
   
    let emptyTileElement = document.querySelector('#tile16');

    const tileSize = Math.abs(movingTilesElements[0].offsetLeft - emptyTileElement.offsetLeft ||
        movingTilesElements[0].offsetTop - emptyTileElement.offsetTop);

    let offsetLeft = offsetTop = 0;
    
    switch(emptyTilePosition - clickedTilePosition) {
        case 1: case 2: case 3:   
            offsetLeft = tileSize; 
            break;
        case -1: case -2: case -3: 
            offsetLeft = -tileSize;
            break;
        case 4: case 8: case 12:   
            offsetTop = tileSize; 
            break;
        case -4: case -8: case -12: 
            offsetTop = -tileSize;   
            break;
        } 

    movingTilesElements.forEach(function(tile){
        tile.style.transform = `translate(${offsetLeft}px, ${offsetTop}px)`;
    });

    setTimeout(function() {
        document.querySelectorAll('.tile').forEach(function(tile){
            tile.removeAttribute("style")});
        movingTilesElements.forEach(function(tile){
            emptyTileElement.textContent = tile.textContent;
            emptyTileElement.id = tile.id;
            tile.textContent = 16;
            tile.id = "tile16";
            emptyTileElement = document.querySelector('#tile16')});
        if (isPuzzleSolved()) finalizeGame()}, slidingDuration);
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
        tile.style.pointerEvents = ""; 
        tile.style.transition = `background ${wakeUpDuration/1000}s ease-in-out`;})
    }, finalizationDuartion);
}
window.onload = function() {
    document.fonts.ready.then(function() {
        
        function preventDefault(e){
            e.preventDefault();
        }
        
        document.body.addEventListener('touchmove', preventDefault, { passive: false });
        document.querySelector("body").style.transition = 'opacity 2s ease';
        document.querySelector("body").style.opacity = 1;
        setTimeout(initializeBoard, initializationDuration);
    });
    
};

