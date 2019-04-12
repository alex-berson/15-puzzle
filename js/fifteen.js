let board = Array.from({length: 15}, (v, i) => i+1);

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
    // for (let i = board.length - 1; i > 0; i--) {
    //     const j = Math.floor(Math.random() * (i + 1));
    //     [board[i], board[j]] = [board[j], board[i]];
    // }
        board = board.map((a) => [Math.random(),a]).sort((a,b) => a[0]-b[0]).map((a) => a[1]);
        // board = board.sort(() => Math.random() - 0.5);
    if (!isPuzzleSolvable()) [board[13], board[14]] = [board[14], board[13]];
    board.push(16);

}

const initializeBoard = () => {
    randomizeBoard();

    document.querySelectorAll('.tile').forEach(function(tile, index){
        tile.addEventListener("click", function() {moveTile(this.id)});
        tile.textContent = board[index];
        tile.id = `tile${board[index]}`;
    });
}

const moveTile = id => {

    let clickedTilePosition = board.indexOf(parseInt(id.replace(/[^0-9]/g,'')));
    let emptyTilePosition = board.indexOf(16);

    let moovingTilesPosition = getMoovingTiles(emptyTilePosition, clickedTilePosition);

    if (moovingTilesPosition.length == 0) return;

    let mooovingTileElements = [];

    moovingTilesPosition.forEach(function(tile, index){

        mooovingTileElements[index] = document.querySelector(`#tile${tile}`);
    });
   
    let emptyTileElement = document.querySelector('#tile16');

    let position = 0;
    let step = 4;

    const tileSize = Math.abs(mooovingTileElements[0].offsetLeft - emptyTileElement.offsetLeft ||
        mooovingTileElements[0].offsetTop - emptyTileElement.offsetTop);

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

            mooovingTileElements.forEach(function(tile){
                tile.style.removeProperty('left');
                tile.style.removeProperty('top');
                tile.style.removeProperty('right');
                tile.style.removeProperty('bottom');

                emptyTileElement.textContent = tile.textContent;
                emptyTileElement.id = tile.id;
                tile.textContent = 16;
                tile.id = "tile16";

                emptyTileElement = document.querySelector('#tile16');
                
            });

        } else {
             //step = tileSize % step ? tileSize % step : step;
            position += step;

            mooovingTileElements.forEach(function(tile){
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
            clearInterval(zoomingInterval);
        } else {
            if (tileNumber) {
                document.querySelector(`#tile${tileNumber}`).style.background = "#5F4B32";
                document.querySelector(`#tile${tileNumber}`).classList.remove("zoom");
            }
            document.querySelector(`#tile${tileNumber+1}`).classList.add("zoom");
            document.querySelector(`#char${Math.floor(tileNumber/2+1)}`).classList.add("brown");

            tileNumber++;
        }
    }
}

const getMoovingTiles = (emptyTilePosition, clickedTilePosition) => {

    let moovingTiles = [];
  
    const span =  clickedTilePosition - emptyTilePosition;
    
    switch (Math.abs(span)) {
        
        case 1: case 2: case 3: case 4: case 8: case 12:
            
            if (Math.min(clickedTilePosition, emptyTilePosition) % 4 > Math.max(clickedTilePosition, emptyTilePosition) % 4) break;
            
            const numberOfTiles = Math.abs(span) <= 3 ? Math.abs(span) : Math.abs(span/4);
               
            for (i = numberOfTiles; i >= 1; i--) {
                
                nextTileMooving = emptyTilePosition  + span/numberOfTiles;
                moovingTiles.push(board[nextTileMooving]);
                
                [board[emptyTilePosition], board[nextTileMooving]] = [board[nextTileMooving], board[emptyTilePosition]];

                emptyTilePosition = nextTileMooving;
            }

            break;
        default:
            break;
    }

    return moovingTiles;
}

window.onload = setTimeout(initializeBoard, 1);

