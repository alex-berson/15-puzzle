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
            document.querySelectorAll(`#tile${i+1}`)[1].innerHTML = board[i];
            document.querySelectorAll(`#tile${i+1}`)[1].id = `tile${board[i]}`;
        } else {
            document.querySelector(`#tile${i+1}`).innerHTML = board[i];
            document.querySelector(`#tile${i+1}`).id = `tile${board[i]}`;
        }
    }
}

