# Issue #10: Socket.io クライアント接続フックの作成

前提: #7, #8

## 概要

Next.js 側から WebSocket サーバーに接続するための React Hook（useRealTime）を作成する。

## 完了条件

- [ ] packages/web/src/hooks/useRealTime.ts が存在する
- [ ] useRealTime フックが Socket.io クライアント接続を管理する
- [ ] join メッセージの送信ができる
- [ ] move メッセージの送信ができる（sendMove 関数）
- [ ] サーバーからの player_moved / player_joined / player_left を受信し状態に反映する
- [ ] コンポーネントのアンマウント時に接続が切断される

## 作業ファイル

### 依存追加（packages/web）

- socket.io-client

### 新規作成

**packages/web/src/hooks/useRealTime.ts**

引数:
```typescript
interface UseRealTimeParams {
  serverUrl: string;   // デフォルト: process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:3001"
  roomId: string;
  playerName: string;
}
```

戻り値:
```typescript
interface UseRealTimeReturn {
  isConnected: boolean;
  playerId: string | null;
  players: Map<string, RemotePlayer>;
  sendMove: (position: Position) => void;
}
```

RemotePlayer 型:
```typescript
interface RemotePlayer {
  id: string;
  name: string;
  position: Position;
}
```

処理フロー:
1. useEffect 内で io(serverUrl) で接続
2. 接続後 `join` メッセージ送信（roomId, playerName）
3. `room_joined` 受信: playerId セット、既存プレイヤーを Map に追加
4. `player_joined` 受信: Map にプレイヤー追加
5. `player_moved` 受信: Map 内の該当プレイヤー position 更新
6. `player_left` 受信: Map から削除
7. アンマウント時: socket.disconnect()

## 制約

- 状態管理は useState で十分（Zustand は Phase 1 本実装で導入）
- 再接続ロジックは省略可
- サーバー URL は環境変数 NEXT_PUBLIC_WS_URL（デフォルト http://localhost:3001）
