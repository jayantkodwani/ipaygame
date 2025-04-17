let boardSize = 9;
let mineCount = 10;
let board = [];
let revealed = [];
let flagged = [];
let startTime = null;
let timerInterval;
let gameStarted = false;

function generateBoard() {
  board = Array.from({ length: boardSize }, () => Array(boardSize).fill(0));
  revealed = Array.from({ length: boardSize }, () => Array(boardSize).fill(false));
  flagged = Array.from({ length: boardSize }, () => Array(boardSize).fill(false));

  let minesPlaced = 0;
  while (minesPlaced < mineCount) {
    let row = Math.floor(Math.random() * boardSize);
    let col = Math.floor(Math.random() * boardSize);
    if (board[row][col] === 0) {
      board[row][col] = 'M';
      minesPlaced++;
    }
  }

  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      if (board[r][c] !== 'M') {
        board[r][c] = countAdjacentMines(r, c);
      }
    }
  }
}

function countAdjacentMines(r, c) {
  let count = 0;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      let nr = r + i;
      let nc = c + j;
      if (nr >= 0 && nr < boardSize && nc >= 0 && nc < boardSize) {
        if (board[nr][nc] === 'M') count++;
      }
    }
  }
  return count;
}

function renderBoard() {
  const boardDiv = document.getElementById("minesweeper-board");
  boardDiv.innerHTML = '';
  for (let r = 0; r < boardSize; r++) {
    const row = document.createElement('div');
    row.style.display = 'flex';
    for (let c = 0; c < boardSize; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.style.border = '1px solid #000';
      cell.style.width = '50px';
      cell.style.height = '50px';
      cell.style.display = 'flex';
      cell.style.justifyContent = 'center';
      cell.style.alignItems = 'center';
      cell.style.cursor = 'pointer';
      cell.style.backgroundColor = revealed[r][c] ? '#ddd' : '#bbb';
      cell.oncontextmenu = (e) => { e.preventDefault(); flagCell(r, c); };
      cell.onclick = () => {
        if (!gameStarted) {
          gameStarted = true;
          startTime = Date.now();
          timerInterval = setInterval(() => {
            document.getElementById('timer').innerText = Math.floor((Date.now() - startTime) / 1000);
          }, 1000);
        }
        revealCell(r, c);
      };
      if (flagged[r][c]) {
        cell.innerText = "🚩";
         } else if (revealed[r][c]) {
        cell.innerText = board[r][c] === 0 ? '' : board[r][c];
        if (board[r][c] === 'M') {
          cell.innerText = "💣";                         // <-- shows bomb emoji
          cell.style.backgroundColor = 'red';
        }
      }
      row.appendChild(cell);
    }
    boardDiv.appendChild(row);
  }
}

function revealCell(r, c) {
  if (revealed[r][c] || flagged[r][c]) return;
  revealed[r][c] = true;
  if (board[r][c] === 'M') {
    clearInterval(timerInterval);
    alert('💣 Boom! Game Over,  You hit a mine.');
    startGame();  // 🔥 This line resets the game board after alert is dismissed
    return;
  } else {
    if (board[r][c] === 0) {
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          let nr = r + i;
          let nc = c + j;
          if (nr >= 0 && nr < boardSize && nc >= 0 && nc < boardSize) {
            revealCell(nr, nc);
          }
        }
      }
    }
    checkWin();
  }
  renderBoard();
}

function checkWin() {
  let safeCells = boardSize * boardSize - mineCount;
  let revealedCount = 0;
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      if (revealed[r][c] && board[r][c] !== 'M') {
        revealedCount++;
      }
    }
  }
  if (revealedCount === safeCells) {
    clearInterval(timerInterval);
    alert('🎉 Congratulations! You cleared the board!');
    document.getElementById("submitBtn").disabled = false;  // 🔥 Enables the submit button
  }
}

function flagCell(r, c) {
  if (revealed[r][c]) return;
  flagged[r][c] = !flagged[r][c];
  renderBoard();
}

function startGame() {
  gameStarted = false;
  clearInterval(timerInterval);
  document.getElementById('timer').innerText = '0';
  generateBoard();
  renderBoard();
}

function submitScore() {
  const name = document.getElementById('playerName').value.trim();

  if (!gameStarted) {
    alert("You haven't started the game yet!");
    return;
  }
  if (!name) {
    alert("Please enter your name before submitting.");
    return;
  }

  const score = Math.floor((Date.now() - startTime) / 1000);

  fetch('/submit-score', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, score })
  })
  .then(response => response.text())
  .then(data => alert(data))
  .catch(err => alert("Error: " + err));
}

window.onload = startGame;
