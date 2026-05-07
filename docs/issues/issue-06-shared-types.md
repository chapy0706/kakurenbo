# Issue #6: 共有型定義の作成（messages.ts / game-config.ts）

前提: #5

## 概要

クライアントとサーバーが共有する WebSocket メッセージ型とゲーム設定定数を定義する。モック段階では最小限の型のみ。

## 完了条件

- [ ] packages/shared/src/types/messages.ts に ClientMessage / ServerMessage 型が定義されている
- [ ] packages/shared/src/constants/game-config.ts に GAME_CONFIG が定義されている
- [ ] packages/shared/src/index.ts からすべてが re-export されている
- [ ] server / web から `@kakurenbo/shared` として import できる
- [ ] `pnpm -r run type-check` が通る

## 作業ファイル

### 新規作成

**packages/shared/src/types/messages.ts**

ClientMessage（クライアント -> サーバー）:
- `{ type: "join"; roomId: string; playerName: string }`
- `{ type: "move"; position: Position }`

ServerMessage（サーバー -> クライアント）:
- `{ type: "room_joined"; playerId: string; players: PlayerInfo[] }`
- `{ type: "player_joined"; player: PlayerInfo }`
- `{ type: "player_left"; playerId: string }`
- `{ type: "player_moved"; playerId: string; position: Position }`

共通型:
- `Position { x: number; y: number }`
- `PlayerInfo { id: string; name: string; position: Position }`

**packages/shared/src/constants/game-config.ts**

GAME_CONFIG オブジェクト:
- MAP_WIDTH: 800（マップ幅 px）
- MAP_HEIGHT: 600（マップ高さ px）
- PLAYER_SPEED: 3（移動速度 px/frame）
- PLAYER_RADIUS: 16（描画半径 px）
- TILE_SIZE: 40（タイルサイズ px）

### 更新

- packages/shared/src/index.ts — messages.ts と game-config.ts を re-export

## 制約

- Discriminated Union（type フィールドで判別）を使うこと
- Zod スキーマはこの issue では作成しない（サーバー側で後日対応）
- Phase 1 で追加する型（hide, seek, game_start 等）は後続 issue
