# X/O vs Jev

Tic-tac-toe in the browser. You play **X**. **Jev** plays **O** via [TypeSafe](https://typesafe.ai) Choice (`systemOne`). If the model call fails, the server falls back to a random empty cell.

## Demo

<video src="https://github.com/user-attachments/assets/605d990d-f140-466b-98e8-d67726720ef1" controls width="100%"></video>

## Setup

Needs [Bun](https://bun.sh) and a TypeSafe API key from [console.typesafe.ai](https://console.typesafe.ai).

```bash
git clone git@github.com:ChenReuven/xo-jev.git
cd xo-jev
cp .env.sample .env
```

Put your key in `.env`:

```
TYPESAFE_API_KEY=your_key_here
```

```bash
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000). `bun start` is the same without hot reload.

## How it works

1. Click a square. `client.ts` posts the 9-cell board to `POST /api/move`.
2. `server.ts` calls `pickJevMove` in `src/jev-move.ts`.
3. TypeSafe picks among empty cells. Response includes `source` (`jev` or `fallback`), confidence, and probabilities.
4. Win/draw logic lives in `src/game.ts`.
