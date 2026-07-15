export type Stone = "black" | "white" | null;
export type Player = "black" | "white";

export const BOARD_SIZE = 15;

export function createEmptyBoard(): Stone[][] {
  return Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => null),
  );
}

export function getOpponent(player: Player): Player {
  return player === "black" ? "white" : "black";
}

const DIRECTIONS = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
] as const;

export function checkWinner(
  board: Stone[][],
  row: number,
  col: number,
  player: Player,
): boolean {
  for (const [dRow, dCol] of DIRECTIONS) {
    let count = 1;

    count += countInDirection(board, row, col, dRow, dCol, player);
    count += countInDirection(board, row, col, -dRow, -dCol, player);

    if (count >= 5) {
      return true;
    }
  }

  return false;
}

function countInDirection(
  board: Stone[][],
  row: number,
  col: number,
  dRow: number,
  dCol: number,
  player: Player,
): number {
  let count = 0;
  let r = row + dRow;
  let c = col + dCol;

  while (
    r >= 0 &&
    r < BOARD_SIZE &&
    c >= 0 &&
    c < BOARD_SIZE &&
    board[r][c] === player
  ) {
    count += 1;
    r += dRow;
    c += dCol;
  }

  return count;
}

export function isBoardFull(board: Stone[][]): boolean {
  return board.every((row) => row.every((cell) => cell !== null));
}
