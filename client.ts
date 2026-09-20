import {
  Board,
  WIN_LINES,
  createBoard,
  isDraw,
  winner,
} from "./src/game";

const boardEl = document.getElementById("board") as HTMLDivElement;
const statusEl = document.getElementById("status") as HTMLDivElement;
const metaEl = document.getElementById("meta") as HTMLDivElement;
const newGameBtn = document.getElementById("new-game") as HTMLButtonElement;

let board: Board = createBoard();
let locked = false;

function winningLine(boardState: Board): number[] | null {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (boardState[a] && boardState[a] === boardState[b] && boardState[b] === boardState[c]) {
      return [...line];
    }
  }
  return null;
}

function render() {
  boardEl.innerHTML = "";
  const highlight = winningLine(board) ?? [];

  board.forEach((cell, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `cell${cell ? ` ${cell.toLowerCase()}` : ""}${highlight.includes(index) ? " winning" : ""}`;
    button.textContent = cell;
    button.disabled = locked || cell !== "" || Boolean(winner(board)) || isDraw(board);
    button.setAttribute("role", "gridcell");
    button.setAttribute("aria-label", `Cell ${index + 1}${cell ? `, ${cell}` : ", empty"}`);
    button.addEventListener("click", () => onHumanMove(index));
    boardEl.appendChild(button);
  });
}

function setStatus(message: string) {
  statusEl.textContent = message;
}

function setMeta(message: string) {
  metaEl.textContent = message;
}

async function onHumanMove(index: number) {
  if (locked || board[index] !== "") return;

  board[index] = "X";
  render();

  const humanWin = winner(board);
  if (humanWin) {
    setStatus("You win!");
    setMeta("");
    return;
  }

  if (isDraw(board)) {
    setStatus("Draw.");
    setMeta("");
    return;
  }

  await jevTurn();
}

async function jevTurn() {
  locked = true;
  newGameBtn.disabled = true;
  setStatus("Jev is thinking…");
  setMeta("");
  render();

  try {
    const response = await fetch("/api/move", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ board, computer: "O" }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error ?? "Move request failed");
    }

    board[data.cell] = "O";

    const jevWin = winner(board);
    if (jevWin) {
      setStatus("Jev wins.");
    } else if (isDraw(board)) {
      setStatus("Draw.");
    } else {
      setStatus("Your turn — pick a square.");
    }

    if (data.source === "jev") {
      const confidence = typeof data.confidence === "number"
        ? ` · ${(data.confidence * 100).toFixed(0)}% confidence`
        : "";
      setMeta(`Jev played cell ${data.cell}${confidence}`);
    } else {
      setMeta(`Fallback random move on cell ${data.cell}`);
    }
  } catch (error) {
    setStatus(error instanceof Error ? error.message : "Jev move failed");
  } finally {
    locked = false;
    newGameBtn.disabled = false;
    render();
  }
}

function resetGame() {
  board = createBoard();
  locked = false;
  setStatus("Your turn — pick a square.");
  setMeta("");
  render();
}

newGameBtn.addEventListener("click", resetGame);
resetGame();
