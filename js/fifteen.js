let board = [];
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
  window.addEventListener('load', () => {
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

const iPhoneXApp = () => {
    if ((document.URL.indexOf('http://') == -1 && document.URL.indexOf('https://') == -1) && 
        (screen.width < 460 || screen.height < 460) && 
        (screen.width/screen.height < 0.5 && screen.height/screen.width > 2)) {
            return true;
    } 
    return false;
}

const enableTouch = () => {
    document.querySelectorAll('.tile').forEach((tile) => {

        if (matchMedia('(hover: none)').matches){
            tile.addEventListener("touchstart", moveTiles);
        } else {
            tile.addEventListener("mousedown", moveTiles);
        }
    });
}

const disableTouch = () => {
    document.querySelectorAll('.tile').forEach((tile) => {

        if (matchMedia('(hover: none)').matches){
            tile.removeEventListener("touchstart", moveTiles);
        } else {
            tile.removeEventListener("mousedown", moveTiles);
        }
    });
}

const initializeBoard = () => {

    randomizeBoard();

    document.querySelectorAll('.tile').forEach((tile) => {
        tile.style.transition = `all ${shufflingDuration/1000}s ease-in-out`;
    });
    document.querySelectorAll('.tile').forEach((tile) => {
        let destinationTile = document.querySelectorAll('.tile')[board.indexOf(parseInt(tile.id.replace(/[^0-9]/g,'')))];
        let offsetLeft =  destinationTile.offsetLeft - tile.offsetLeft;
        let offsetTop = destinationTile.offsetTop - tile.offsetTop;
        tile.style.transform = `translate(${offsetLeft}px, ${offsetTop}px)`;
    });
    setTimeout(() => {document.querySelectorAll('.tile').forEach((tile, index) => {
        tile.textContent = board[index];
        tile.id = `tile${board[index]}`;
        tile.removeAttribute("style")});
        enableTouch()}, shufflingDuration);
}

const wakeUp = () => {

    disableTouch();

    document.querySelectorAll('.tile').forEach((tile) => {
        tile.style.background = "";
    });
    document.querySelectorAll('span').forEach((char) => {
        char.style.color = "";
    });
    setTimeout(() => {
        document.querySelectorAll('.tile').forEach((tile) => {
        tile.removeAttribute("style")});
        document.querySelectorAll('span').forEach((char) => {
        char.removeAttribute("style")});
        initializeBoard()}, wakeUpDuration);
}

const moveTiles = (e) => {

    if (isPuzzleSolved()){
        wakeUp();
        return;
    }
    let id = e.currentTarget.id;
    let clickedTilePosition = board.indexOf(parseInt(id.replace(/[^0-9]/g,'')));
    let emptyTilePosition = board.indexOf(16);
    let movingTilesPositions = getMovingTiles(emptyTilePosition, clickedTilePosition);

    if (movingTilesPositions.length == 0) return;

    disableTouch();

    document.querySelectorAll('.tile').forEach((tile) => {
        tile.style.transition = `all ${slidingDuration/1000}s ease-in-out`;
    });

    let movingTilesElements = [];

    movingTilesPositions.forEach((tile, index) => {
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

    movingTilesElements.forEach((tile) => {
        tile.style.transform = `translate(${offsetLeft}px, ${offsetTop}px)`;
    });

    setTimeout(() => {
        enableTouch()
        document.querySelectorAll('.tile').forEach((tile) => {
            tile.removeAttribute("style")});
        movingTilesElements.forEach((tile) => {
            emptyTileElement.textContent = tile.textContent;
            emptyTileElement.id = tile.id;
            tile.textContent = 16;
            tile.id = "tile16";
            emptyTileElement = document.querySelector('#tile16')});
        if (isPuzzleSolved()) finalizeGame()}, slidingDuration);
}

const finalizeGame = () => {
    const titleLength = document.querySelectorAll('h1 span').length;
    disableTouch();
    let tileNumber = 0;
    const zooming = () => {
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
    
    let  zoomingInterval = setInterval(zooming, zoomingDuration);

    let charNumber = 1;
    const browningTitle = () => {
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

    setTimeout(() => {document.querySelectorAll('.tile').forEach((tile) => {
        tile.style.transition = `background ${wakeUpDuration/1000}s ease-in-out`});
        enableTouch()}, finalizationDuartion);
}
window.onload = () => {
    document.fonts.ready.then(() => {
        if (iPhoneXApp()) {
            document.querySelector("h1").style.marginTop = "-25px";
            document.querySelector("#designed").style.marginBottom = "-25px";
        }
        
        const preventDefault = (e) => e.preventDefault();
        document.body.addEventListener('touchmove', preventDefault, { passive: false });
        document.querySelector("body").style.transition = 'opacity 2s ease';
        document.querySelector("body").style.opacity = 1;
        setTimeout(initializeBoard, initializationDuration);
    }); 
};
