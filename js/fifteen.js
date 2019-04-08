let board = Array.from({length: 15}, (v, i) => i+1);

const isSolvable = () => {
    let numberOfInversions = 0;
    for (i = 0; i < board.length-1; i++){
        for (j = i+1; j < board.length; j++){
            if (board[i] > board[j]) {               
                numberOfInversions += 1;
            }
        }
    }
    if (numberOfInversions % 2 == 0) return true;    
    return false;
}

const randomizeBoard = () => {
    do {
        board = board.map((a) => [Math.random(),a]).sort((a,b) => a[0]-b[0]).map((a) => a[1]);
        // board = board.sort(() => Math.random() - 0.5);
    } while(!isSolvable());
}

const setBoard = () => {
    randomizeBoard();
    for (i = 0; i < board.length; i++){
        if (document.querySelectorAll(`#tile${i+1}`)[1]) {
            document.querySelectorAll(`#tile${i+1}`)[1].addEventListener("click", function() {clicked(this.id)});
            document.querySelectorAll(`#tile${i+1}`)[1].innerHTML = board[i];
            document.querySelectorAll(`#tile${i+1}`)[1].id = `tile${board[i]}`;
        } else {
            document.querySelector(`#tile${i+1}`).addEventListener("click", function() {clicked(this.id)});
            document.querySelector(`#tile${i+1}`).innerHTML = board[i];
            document.querySelector(`#tile${i+1}`).id = `tile${board[i]}`;
        }
    }
    document.querySelector('#tile16').addEventListener("click", function() {clicked(this.id)});

}

const getTilesPosition = (id) => {
    let clickedTilePosition, emptyTilePosition;
    let tiles = document.querySelectorAll('.tile');
    tiles.forEach(function (tile, index) {
        if (tile.id == id) clickedTilePosition = index;
        if (tile.id == "tile16") emptyTilePosition = index;
    });
        return [clickedTilePosition, emptyTilePosition];
}

const clicked = (id) => {
    [clickedTilePosition, emptyTilePosition] = getTilesPosition(id);
    if (isMovePossible(clickedTilePosition, emptyTilePosition)) moveTile(id, clickedTilePosition, emptyTilePosition);

    console.log(clickedTilePosition, emptyTilePosition);
}

const isMovePossible = (clickedTilePosition, emptyTilePosition) => {
    if ((Math.abs(clickedTilePosition - emptyTilePosition) == 1) || (Math.abs(clickedTilePosition - emptyTilePosition) == 4)) return true;
    return false;
}

const moveTile = (id, clickedTilePosition, emptyTilePosition) => {
    [board[clickedTilePosition], board[emptyTilePosition]] = [board[emptyTilePosition], board[clickedTilePosition]];
    let clickedTileElement = document.querySelector(`#${id}`);
    let emptyTileElement = document.querySelector('#tile16');
    clickedTileElement.innerHTML = '';
    clickedTileElement.id = 'tile16';
    emptyTileElement.innerHTML = id.replace(/[^0-9]/g,'');;
    emptyTileElement.id = id;
}

window.onload = setBoard;
