export type Player = "X" | "O";
export type Cell = Player | "";
export type Board = Cell[];

export const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
] as const;

export const CELL_NAMES = [
  "top-left",
  "top-center",
  "top-right",
  "middle-left",
  "center",
  "middle-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
] as const;

export function createBoard(): Board {
  return Array.from({ length: 9 }, () => "");
}

export function emptyCells(board: Board): number[] {
  return board.flatMap((cell, index) => (cell === "" ? [index] : []));
}

export function winner(board: Board): Player | null {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[b] === board[c]) {
      return board[a] as Player;
    }
  }
  return null;
}

export function isDraw(board: Board): boolean {
  return winner(board) === null && emptyCells(board).length === 0;
}

export function formatBoard(board: Board): string {
  const symbols = board.map((cell) => cell || ".");
  return [
    `${symbols[0]} ${symbols[1]} ${symbols[2]}`,
    `${symbols[3]} ${symbols[4]} ${symbols[5]}`,
    `${symbols[6]} ${symbols[7]} ${symbols[8]}`,
  ].join("\n");
}

export function boardToGrid(board: Board): string[][] {
  return [
    [board[0], board[1], board[2]],
    [board[3], board[4], board[5]],
    [board[6], board[7], board[8]],
  ];
}
