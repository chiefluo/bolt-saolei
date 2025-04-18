const BOARD_SIZE = 10;
const NUM_MINES = 10;

let board = [];
let minesLeft = NUM_MINES;
let gameOver = false;

document.addEventListener('DOMContentLoaded', () => {
  createBoard();
  document.getElementById('reset').addEventListener('click', resetGame);
});

function createBoard() {
  const boardElement = document.getElementById('board');
  boardElement.innerHTML = '';
  board = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(0));
  
  // 随机放置地雷
  let minesPlaced = 0;
  while (minesPlaced < NUM_MINES) {
    const x = Math.floor(Math.random() * BOARD_SIZE);
    const y = Math.floor(Math.random() * BOARD_SIZE);
    if (board[x][y] !== -1) {
      board[x][y] = -1;
      minesPlaced++;
    }
  }

  // 计算相邻地雷数
  for (let x = 0; x < BOARD_SIZE; x++) {
    for (let y = 0; y < BOARD_SIZE; y++) {
      if (board[x][y] === -1) continue;
      board[x][y] = countAdjacentMines(x, y);
    }
  }

  // 创建单元格
  for (let x = 0; x < BOARD_SIZE; x++) {
    for (let y = 0; y < BOARD_SIZE; y++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.x = x;
      cell.dataset.y = y;
      
      cell.addEventListener('click', () => handleCellClick(x, y));
      cell.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        handleRightClick(x, y);
      });
      
      boardElement.appendChild(cell);
    }
  }
}

function countAdjacentMines(x, y) {
  let count = 0;
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE && board[nx][ny] === -1) {
        count++;
      }
    }
  }
  return count;
}

function handleCellClick(x, y) {
  if (gameOver) return;
  
  const cell = document.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
  if (cell.classList.contains('revealed') || cell.classList.contains('flagged')) return;
  
  cell.classList.add('revealed');
  
  if (board[x][y] === -1) {
    cell.classList.add('mine');
    gameOver = true;
    revealAllMines();
    document.getElementById('message').textContent = '游戏结束!';
    return;
  }
  
  if (board[x][y] > 0) {
    cell.textContent = board[x][y];
    return;
  }
  
  // 如果是空白格，显示相邻格子
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE) {
        const adjacentCell = document.querySelector(`.cell[data-x="${nx}"][data-y="${ny}"]`);
        if (!adjacentCell.classList.contains('revealed')) {
          handleCellClick(nx, ny);
        }
      }
    }
  }
  
  checkWin();
}

function handleRightClick(x, y) {
  if (gameOver) return;
  
  const cell = document.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
  if (cell.classList.contains('revealed')) return;
  
  if (cell.classList.contains('flagged')) {
    cell.classList.remove('flagged');
    minesLeft++;
  } else {
    cell.classList.add('flagged');
    minesLeft--;
  }
  
  document.getElementById('mines-count').textContent = `剩余地雷: ${minesLeft}`;
}

function revealAllMines() {
  for (let x = 0; x < BOARD_SIZE; x++) {
    for (let y = 0; y < BOARD_SIZE; y++) {
      if (board[x][y] === -1) {
        const cell = document.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
        cell.classList.add('revealed', 'mine');
      }
    }
  }
}

function checkWin() {
  let unrevealedSafeCells = 0;
  for (let x = 0; x < BOARD_SIZE; x++) {
    for (let y = 0; y < BOARD_SIZE; y++) {
      if (board[x][y] !== -1) {
        const cell = document.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
        if (!cell.classList.contains('revealed')) {
          unrevealedSafeCells++;
        }
      }
    }
  }
  
  if (unrevealedSafeCells === 0) {
    gameOver = true;
    document.getElementById('message').textContent = '你赢了!';
  }
}

function resetGame() {
  gameOver = false;
  minesLeft = NUM_MINES;
  document.getElementById('mines-count').textContent = `剩余地雷: ${minesLeft}`;
  document.getElementById('message').textContent = '';
  createBoard();
}
