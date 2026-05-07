# Issue #7: WebSocket サーバーの骨格作成

前提: #5, #6

## 概要

Express + Socket.io による最小の WebSocket サーバーを作成する。ルーム管理なし、入力の中継のみ。

## 完了条件

- [ ] packages/server/src/index.ts が存在する
- [ ] `pnpm --filter @kakurenbo/server run dev` でサーバーがポート 3001 で起動する
- [ ] クライアントから `join` を受信し、接続中プレイヤー一覧を `room_joined` で返せる
- [ ] クライアントから `move` を受信し、送信元以外の全クライアントに `player_moved` を中継できる
- [ ] クライアント切断時に他クライアントへ `player_left` を送信できる
- [ ] CORS が http://localhost:3000 を許可している

## 作業ファイル

### 依存追加（packages/server）

- express / @types/express
- socket.io
- tsx（devDependencies）
- @kakurenbo/shared（workspace:*）

### 新規作成

**packages/server/src/index.ts**

処理フロー:
1. Express アプリ作成
2. Socket.io をアタッチ（cors: { origin: "http://localhost:3000" }）
3. インメモリ Map<socketId, { name, position }> でプレイヤー管理
4. connection: Map にエントリ追加
5. `join` 受信: プレイヤー名を記録、`room_joined` で既存プレイヤー一覧を返す、他全員に `player_joined` 送信
6. `move` 受信: Map の position 更新、socket.broadcast.emit で `player_moved` を中継
7. disconnect: Map から削除、他全員に `player_left` 送信
8. ポート 3001 でリッスン

### 更新

- packages/server/package.json の scripts に追加:
  - `"dev": "tsx watch src/index.ts"`
  - `"type-check": "tsc --noEmit"`

## 制約

- この段階ではルーム分割なし（全員が同一空間）
- プレイヤー情報はインメモリ管理（DB 連携は後続 issue）
- メッセージの Zod バリデーションは省略可
