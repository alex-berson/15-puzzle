let board = [];

const showBoard = () => document.body.style.opacity = 1;
                          
const setBoardSize = () => {

    let minSide = screen.height > screen.width ? screen.width : window.innerHeight;
    let cssBoardSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--board-size')) / 100;
    let boardSize = Math.ceil(minSide * cssBoardSize / 4) * 4;

    document.documentElement.style.setProperty('--board-size', boardSize + 'px');
}

const puzzleSolved = () => {

    for (let i = 0; i < board.length - 1; i++) {
        if (board[i] != i + 1) return false;
    }
    
    return true;
}

const shuffle = (array) => {

    for (let i = array.length - 1; i > 0; i--) {

        let j = Math.floor(Math.random() * (i + 1));

        [array[i], array[j]] = [array[j], array[i]]; 
    }
}

const puzzleSolvable = () => {

    let inversions = 0;

    for (let i = 0; i < board.length - 1; i++){
        for (let j = i + 1; j < board.length; j++){
            if (board[i] > board[j]) inversions++;
        }
    }

    return !(inversions % 2);    
}

const randomizeBoard = () => {

    board = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15];

    do {
        shuffle(board);

        if (!puzzleSolvable()) [board[0], board[1]] = [board[1], board[0]];

    } while (board.some((item, i) => item == i + 1));

    board.push(0);
}

const fillBoard = () => {

    let cells = document.querySelectorAll('.cell');
    let tiles = document.querySelectorAll('.tile');

    for (let i = 0; i < tiles.length; i++) {

        let rectTile = tiles[i].getBoundingClientRect();
        let rectCell = cells[i].getBoundingClientRect();
        let offsetLeft =  rectCell.left - rectTile.left;
        let offsetTop =  rectCell.top - rectTile.top;
        
        tiles[i].style.transform = `translate(${offsetLeft}px, ${offsetTop}px)`;
    }
}

const shuffleTiles = () => {

    let n = 0;
    let cells = document.querySelectorAll('.cell');
    let tiles = document.querySelectorAll('.tile');
    
    randomizeBoard();

    for (let i = 0; i < 15; i++) {

        let val = Number(tiles[i].id.substring(1));
        let pos = board.indexOf(val);
        let rectTile = tiles[i].getBoundingClientRect();
        let rectCell = cells[pos].getBoundingClientRect();
        let offsetLeft =  rectCell.left - rectTile.left;
        let offsetTop =  rectCell.top - rectTile.top;
        let style = window.getComputedStyle(tiles[i]);
        let matrix = new DOMMatrix(style.transform);
        
        tiles[i].classList.add('shuffle');
        tiles[i].style.transform = `translate(${matrix.m41 + offsetLeft}px, ${matrix.m42 + offsetTop}px)`;

        tiles[i].addEventListener('transitionend', e => {

            let tile = e.currentTarget;

            tile.classList.remove('shuffle');

            n++;

            if (n >= 15) enableTouch();

        }, {once: true});
    }
}

const moveTles = (e) => {

    let tile = e.currentTarget;
    let pos0 = board.indexOf(0);
    let val = Number(tile.id.substring(1));
    let pos1 = board.indexOf(val);
    let span =  pos1 - pos0;
    let spans = [1,2,3,4,8,12]; 
    let cells = document.querySelectorAll('.cell');
    let tiles = document.querySelectorAll('.tile');

    if (!spans.includes(Math.abs(span))) return;
    if (Math.min(pos0, pos1) % 4 > Math.max(pos0, pos1) % 4) return; 
   
    let nTiles = Math.abs(span) <= 3 ? Math.abs(span) : Math.abs(span / 4);

    for (let i = nTiles; i >= 1; i--) {

        let pos = pos0 + span / nTiles * i;
        let val = board[pos];

        if (tiles[val - 1].classList.contains('move')) return;
    }

    for (let i = nTiles; i >= 1; i--) {

        let pos = pos0 + span / nTiles;
        let val = board[pos];
        let rectTile = tiles[val - 1].getBoundingClientRect();
        let rectCell = cells[pos0].getBoundingClientRect();
        let offsetLeft =  rectCell.left - rectTile.left;
        let offsetTop =  rectCell.top - rectTile.top;
        let style = window.getComputedStyle(tiles[val - 1]);
        let matrix = new DOMMatrix(style.transform);

        tiles[val - 1].classList.add('move');
        tiles[val - 1].style.transition = 'transform 0.15s ease-in-out';
        tiles[val - 1].style.transform = `translate(${matrix.m41 + offsetLeft}px, ${matrix.m42 + offsetTop}px)`;

        tiles[val - 1].addEventListener('transitionend', e => {

            let tile = e.currentTarget;

            tile.classList.remove('move');
            tile.style.removeProperty('transition');

        }, {once: true});

        [board[pos0], board[pos]] = [board[pos], board[pos0]];    
        pos0 = pos;
    }

    if (puzzleSolved()) firework();
}

const newGame = () => {

    let tiles = document.querySelectorAll('.tile');
    let chars = document.querySelectorAll('.char');

    document.querySelector('.board').removeEventListener('touchstart', newGame);
    document.querySelector('.board').removeEventListener('mousedown', newGame);

    chars.forEach(char => char.classList.remove('brown-c'));
    tiles.forEach(tile => tile.classList.remove('zoom', 'brown-t'));

    setTimeout(shuffleTiles, 2000);
}

const firework = () => {

    let n = 0;
    let tiles = document.querySelectorAll('.tile');
    let chars = document.querySelectorAll('.char');

    disableTouch();

    const zoom = () => {

        if (n % 2 == 0) chars[n / 2].classList.add('brown-c');

        tiles[n].classList.add('zoom');
        tiles[n].style.transform += 'scale(1.5)';

        tiles[n].addEventListener('transitionend', e => {

            let tile = e.currentTarget;

            tile.classList.add('brown-t');
            tile.style.transform = tile.style.transform.replace('scale(1.5)', '');

            tile.addEventListener('transitionend', () => {

                if (n == 15) {
                    
                    document.querySelector('.board').addEventListener('touchstart', newGame);
                    document.querySelector('.board').addEventListener('mousedown', newGame);

                    return;
                }

                zoom();
    
            }, {once: true});

        }, {once: true});

        n++;
    }

    setTimeout(zoom, 1000);
}

const enableTouch = () => {

    let tiles = document.querySelectorAll('.tile');

    tiles.forEach(tile => {
        tile.addEventListener('touchstart', moveTles);
        tile.addEventListener('mousedown', moveTles);
    });
}

const disableTouch = () => {

    let tiles = document.querySelectorAll('.tile');

    tiles.forEach(tile => {
        tile.removeEventListener('touchstart', moveTles);
        tile.removeEventListener('mousedown', moveTles);
    });
}

const disableTapZoom = () => {

    const preventDefault = (e) => {e.preventDefault()};

    document.body.addEventListener('touchstart', preventDefault, {passive: false});
    document.body.addEventListener('mousedown', preventDefault, {passive: false});
}

const registerServiceWorker = () => {
   if ('serviceWorker' in navigator) navigator.serviceWorker.register('service-worker.js');
}

const init = () => {

    registerServiceWorker();
    disableTapZoom(); 
    setBoardSize();
    fillBoard();  
    showBoard();

    setTimeout(shuffleTiles, 2000);
}

window.onload = () => document.fonts.ready.then(init);