function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function isValid(board, row, col, num) {
  for (let c = 0; c < 9; c++) {
    if (board[row][c] === num) return false;
  }
  for (let r = 0; r < 9; r++) {
    if (board[r][col] === num) return false;
  }
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (board[r][c] === num) return false;
    }
  }
  return true;
}

function solveBoardBacktrack(board) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        for (const num of nums) {
          if (isValid(board, row, col, num)) {
            board[row][col] = num;
            if (solveBoardBacktrack(board)) return true;
            board[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

export function generatePuzzle(clues = 40) {
  const solution = Array.from({ length: 9 }, () => Array(9).fill(0));
  solveBoardBacktrack(solution);

  const puzzle = solution.map(row => [...row]);
  let removed = 0;
  const target = 81 - clues;
  const positions = shuffle(Array.from({ length: 81 }, (_, i) => i));

  for (const pos of positions) {
    if (removed >= target) break;
    const row = Math.floor(pos / 9);
    const col = pos % 9;
    puzzle[row][col] = 0;
    removed++;
  }

  return { puzzle, solution };
}

export function validateMove(board, row, col, num) {
  for (let c = 0; c < 9; c++) {
    if (c !== col && board[row][c] === num) return false;
  }
  for (let r = 0; r < 9; r++) {
    if (r !== row && board[r][col] === num) return false;
  }
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if ((r !== row || c !== col) && board[r][c] === num) return false;
    }
  }
  return true;
}

function normalizeCell(value) {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'boolean') return NaN;

  const number = typeof value === 'number' ? value : Number(String(value).trim());
  return Number.isInteger(number) && number >= 0 && number <= 9 ? number : NaN;
}

export function normalizeBoard(board) {
  if (!Array.isArray(board) || board.length !== 9) return null;

  const normalized = board.map(row => {
    if (!Array.isArray(row) || row.length !== 9) return null;

    const normalizedRow = row.map(normalizeCell);
    return normalizedRow.some(Number.isNaN) ? null : normalizedRow;
  });

  return normalized.some(row => row === null) ? null : normalized;
}

function hasDigitsOneToNine(values) {
  if (!Array.isArray(values) || values.length !== 9) return false;

  const seen = new Set(values);
  return seen.size === 9 && [1, 2, 3, 4, 5, 6, 7, 8, 9].every(num => seen.has(num));
}

export function isBoardFilled(board) {
  const normalized = normalizeBoard(board);

  return !!normalized && normalized.every(row => row.every(value => value >= 1 && value <= 9));
}

export function isValidCompletedBoard(board) {
  const normalized = normalizeBoard(board);

  if (!normalized || !isBoardFilled(normalized)) return false;

  for (let r = 0; r < 9; r++) {
    if (!hasDigitsOneToNine(normalized[r])) return false;
  }

  for (let c = 0; c < 9; c++) {
    const column = [];
    for (let r = 0; r < 9; r++) {
      column.push(normalized[r][c]);
    }
    if (!hasDigitsOneToNine(column)) return false;
  }

  for (let boxRow = 0; boxRow < 9; boxRow += 3) {
    for (let boxCol = 0; boxCol < 9; boxCol += 3) {
      const box = [];
      for (let r = boxRow; r < boxRow + 3; r++) {
        for (let c = boxCol; c < boxCol + 3; c++) {
          box.push(normalized[r][c]);
        }
      }
      if (!hasDigitsOneToNine(box)) return false;
    }
  }

  return true;
}

export function doesBoardRespectPuzzle(board, puzzle) {
  const normalizedBoard = normalizeBoard(board);
  const normalizedPuzzle = normalizeBoard(puzzle);

  if (!normalizedBoard) return false;
  if (!normalizedPuzzle) return true;

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (normalizedPuzzle[r][c] !== 0 && normalizedBoard[r][c] !== normalizedPuzzle[r][c]) {
        return false;
      }
    }
  }

  return true;
}

export function isBoardComplete(board, solution) {
  const normalizedBoard = normalizeBoard(board);
  const normalizedSolution = normalizeBoard(solution);

  if (!normalizedBoard || !normalizedSolution) return false;

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (normalizedBoard[r][c] !== normalizedSolution[r][c]) return false;
    }
  }
  return true;
}

export function isSudokuAnswerCorrect({ board, puzzle, solution }) {
  if (!isValidCompletedBoard(board) || !doesBoardRespectPuzzle(board, puzzle)) {
    return false;
  }

  if (isValidCompletedBoard(solution) && doesBoardRespectPuzzle(solution, puzzle) && isBoardComplete(board, solution)) {
    return true;
  }

  // The generated puzzles are not guaranteed to be unique, and restored sessions
  // may carry a stale solution. A valid filled grid that preserves givens is correct.
  return true;
}
