import { choice, TypeSafeClient } from "@typesafe-ai/sdk";
import {
  Board,
  CELL_NAMES,
  Player,
  emptyCells,
  formatBoard,
} from "./game";

const client = new TypeSafeClient();

export type JevMoveResult = {
  cell: number;
  choice: string;
  confidence: number;
  probabilities: Record<string, number>;
};

function buildMoveCriteria(board: Board): Record<string, string> {
  const criteria: Record<string, string> = {};
  for (const index of emptyCells(board)) {
    criteria[String(index)] =
      `Empty cell ${index} (${CELL_NAMES[index]}). Opponent may threaten a line here.`;
  }
  return criteria;
}

export async function pickJevMove(
  board: Board,
  computer: Player,
): Promise<JevMoveResult> {
  const human: Player = computer === "O" ? "X" : "O";
  const available = emptyCells(board);

  if (available.length === 0) {
    throw new Error("No empty cells left");
  }

  if (available.length === 1) {
    const cell = available[0];
    return {
      cell,
      choice: String(cell),
      confidence: 1,
      probabilities: { [String(cell)]: 1 },
    };
  }

  const criteria = buildMoveCriteria(board);
  const response = await client.systemOne({
    state: {
      game: "tic-tac-toe",
      you: computer,
      opponent: human,
      board: formatBoard(board),
      board_grid: [
        [board[0] || "_", board[1] || "_", board[2] || "_"],
        [board[3] || "_", board[4] || "_", board[5] || "_"],
        [board[6] || "_", board[7] || "_", board[8] || "_"],
      ],
      rules:
        "Cells are numbered 0-8 left-to-right, top-to-bottom. Win three in a row. Block opponent wins and take winning lines when possible.",
    },
    questions: {
      move: choice(
        `You play as ${computer}. Pick the best empty cell index to win or force a draw.`,
        criteria,
      ),
    },
  });

  const answer = response.answers.move;
  const cell = Number(answer.choice);

  if (!available.includes(cell)) {
    throw new Error(`Jev chose invalid cell ${answer.choice}`);
  }

  return {
    cell,
    choice: answer.choice,
    confidence: answer.confidence,
    probabilities: answer.probabilities,
  };
}

export function pickRandomMove(board: Board): number {
  const available = emptyCells(board);
  const index = Math.floor(Math.random() * available.length);
  return available[index];
}
