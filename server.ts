import index from "./index.html";
import { Board, Player, isDraw, winner } from "./src/game";
import { pickJevMove, pickRandomMove } from "./src/jev-move";

type MoveRequest = {
  board: Board;
  computer?: Player;
};

function isValidBoard(board: unknown): board is Board {
  return (
    Array.isArray(board) &&
    board.length === 9 &&
    board.every((cell) => cell === "" || cell === "X" || cell === "O")
  );
}

const server = Bun.serve({
  port: Number(process.env.PORT ?? 3000),
  routes: {
    "/": index,
    "/api/move": {
      async POST(req) {
        if (!process.env.TYPESAFE_API_KEY?.trim()) {
          return Response.json(
            { error: "Set TYPESAFE_API_KEY in .env" },
            { status: 500 },
          );
        }

        let body: MoveRequest;
        try {
          body = await req.json();
        } catch {
          return Response.json({ error: "Invalid JSON body" }, { status: 400 });
        }

        if (!isValidBoard(body.board)) {
          return Response.json({ error: "Board must be 9 cells (X, O, or empty)" }, { status: 400 });
        }

        const computer: Player = body.computer === "X" ? "X" : "O";

        if (winner(body.board) || isDraw(body.board)) {
          return Response.json({ error: "Game already finished" }, { status: 400 });
        }

        try {
          const result = await pickJevMove(body.board, computer);
          return Response.json({
            cell: result.cell,
            source: "jev",
            confidence: result.confidence,
            probabilities: result.probabilities,
          });
        } catch (error) {
          const cell = pickRandomMove(body.board);
          return Response.json({
            cell,
            source: "fallback",
            error: error instanceof Error ? error.message : "Jev move failed",
          });
        }
      },
    },
  },
  development: {
    hmr: true,
    console: true,
  },
});

console.log(`X/O vs Jev → http://localhost:${server.port}`);
