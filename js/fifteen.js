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

    for (i = 0; i < board.length; i++){
        let tile = document.querySelectorAll(`#tile${i+1}`)[1] || document.querySelector(`#tile${i+1}`);
        tile.addEventListener("click", function() {moveTile(this.id)});

        tile.innerHTML = board[i];
        tile.id = `tile${board[i]}`;
    }
}

const isMovePossible = (clickedTilePosition, emptyTilePosition) => {
    if ((Math.abs(clickedTilePosition - emptyTilePosition) == 1) ||
        (Math.abs(clickedTilePosition - emptyTilePosition) == 4)) return true;
    return false;
}

const moveTile = id => {

    let clickedTilePosition = board.indexOf(parseInt(id.replace(/[^0-9]/g,'')));
    let emptyTilePosition = board.indexOf(16);

    if (!isMovePossible(clickedTilePosition, emptyTilePosition)) return;

    [board[clickedTilePosition], board[emptyTilePosition]] = [board[emptyTilePosition], board[clickedTilePosition]];

    let clickedTileElement = document.querySelector(`#${id}`);
    let emptyTileElement = document.querySelector('#tile16');

    let position = 0;
    let step = 4;

    const tileSize = Math.abs(clickedTileElement.offsetLeft - emptyTileElement.offsetLeft ||
        clickedTileElement.offsetTop - emptyTileElement.offsetTop);

    let direction;
    switch(emptyTilePosition - clickedTilePosition) {
        case 1:   
            direction = 'left'; 
            break;
        case -1: 
            direction = 'right'; 
            break;
        case 4:   
            direction = 'top';
            break;
        case -4:   
            direction = 'bottom'; 
            break;
        } 

    let  slidingInterval = setInterval(sliding, 5);
    
    function sliding() {
        if ((position <= -tileSize) || (position >= tileSize)) {     
            clearInterval(slidingInterval);
            clickedTileElement.innerHTML = '';
            clickedTileElement.id = 'tile16';
            clickedTileElement.style.removeProperty('left');
            clickedTileElement.style.removeProperty('top');
            clickedTileElement.style.removeProperty('right');
            clickedTileElement.style.removeProperty('bottom');

            emptyTileElement.innerHTML = id.replace(/[^0-9]/g,'');
            emptyTileElement.id = id;
        } else {
             //step = tileSize % step ? tileSize % step : step;
            position += step;

            clickedTileElement.style.setProperty(direction, position + 'px');
        }
    }

    if (isPuzzleSolved()) finalizeGame();
}

const isPuzzleSolved = () => {
    console.log(board);

    for (i = 0; i < board.length - 1; i++) {
        if (board[i] > board[i + 1]) {
            return false;
        }
    }
    return true;
}

const finalizeGame = () => {
    for (i = 0; i < board.length; i++){
        document.querySelector(`#tile${i+1}`).style.pointerEvents = "none";
    }

    let  zoomingInterval = setInterval(zooming, 1000);
    let tileNumber = 0;
    function zooming(){
        if (tileNumber == 15){
            clearInterval(zoomingInterval);
        } else {
            document.querySelector(`#tile${tileNumber+1}`).classList.add("zoom");

            if (tileNumber) {
                document.querySelector(`#tile${tileNumber}`).style.background = "#5F4B32";
                document.querySelector(`#tile${tileNumber}`).classList.remove("zoom");

            }
            tileNumber++;
        }
    }
}

window.onload = initializeBoard;
