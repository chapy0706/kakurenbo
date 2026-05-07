<!-- .claude/skills/websocket-message.md -->

# WebSocket メッセージ型の追加

クライアント・サーバー間のWebSocketメッセージ型を追加するときのパターン。

## 配置先

```
packages/shared/src/types/messages.ts
```

shared パッケージに置くことで、server と web の両方から同じ型を参照する。
型の不一致によるバグを防ぐための最重要ファイル。

## テンプレート

```typescript
// === クライアント -> サーバー ===

export type ClientMessage =
  | { type: "join"; roomId: string; playerName: string }
  | { type: "move"; position: Position }
  | { type: "hide" }
  | { type: "seek"; targetPosition: Position }
  | { type: "stamp"; stampId: string };

// === サーバー -> クライアント ===

export type ServerMessage =
  | { type: "room_joined"; playerId: string; players: PlayerInfo[] }
  | { type: "player_joined"; player: PlayerInfo }
  | { type: "player_left"; playerId: string }
  | { type: "game_start"; role: Role; timeLimit: number }
  | { type: "player_moved"; playerId: string; position: Position }
  | { type: "player_hidden"; playerId: string }
  | { type: "player_found"; seekerId: string; hiderId: string }
  | { type: "stamp_received"; playerId: string; stampId: string }
  | { type: "game_end"; result: GameResult }
  | { type: "error"; code: string; message: string };

// === 共通型 ===

export interface Position {
  x: number;
  y: number;
}

export interface PlayerInfo {
  id: string;
  name: string;
  role: Role;
  state: PlayerState;
}

export type Role = "seeker" | "hider";
export type PlayerState = "waiting" | "moving" | "hiding" | "found";

export interface GameResult {
  winner: "seekers" | "hiders";
  remainingTime: number;
  seekers: PlayerInfo[];
  hiders: PlayerInfo[];
}
```

## Zod スキーマ（boundary用）

サーバー側で受信したメッセージのバリデーションに使う。

```typescript
// packages/server/src/infrastructure/realtime/schemas.ts
import { z } from "zod";

const positionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

export const clientMessageSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("join"), roomId: z.string(), playerName: z.string() }),
  z.object({ type: z.literal("move"), position: positionSchema }),
  z.object({ type: z.literal("hide") }),
  z.object({ type: z.literal("seek"), targetPosition: positionSchema }),
  z.object({ type: z.literal("stamp"), stampId: z.string() }),
]);
```

## 守ること

- メッセージ型は必ず shared パッケージに置く
- Discriminated Union（type フィールドで判別）を使う
- サーバー側の受信処理では必ず Zod でバリデーションする（unknown -> parse）
- 新しいメッセージを追加したら、型定義とZodスキーマの両方を更新する
- Position 等の共通型は再利用する。同じ構造を複数箇所で定義しない
