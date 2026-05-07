# Issue #18: スタンプ送信機能

前提: #11

## 概要

チームメンバーに感情を伝えるスタンプ機能を実装する。ボタンからスタンプを選んで送信し、他プレイヤーのキャラ上に表示する。

## 完了条件

- [ ] ゲーム画面下部にスタンプボタンが表示される
- [ ] ボタンタップでスタンプ一覧が開く
- [ ] スタンプ選択で同ルームの他プレイヤーに送信される
- [ ] 受信したスタンプが該当プレイヤーのキャラ上に 2秒間 表示される

## 作業ファイル

### 更新

**packages/shared/src/types/messages.ts**

ClientMessage に追加:
- `{ type: "stamp"; stampId: string }`

ServerMessage に追加:
- `{ type: "stamp_received"; playerId: string; stampId: string }`

### 新規作成

**packages/web/src/components/game/StampButton.tsx**

- "use client" コンポーネント
- 画面下部に fixed 配置
- 5種類: smile(😊), surprise(😲), question(❓), exclaim(❗), heart(❤️)
- タップでトグル表示、選択で onSend(stampId) コールバック

### 更新

**packages/web/src/hooks/useRealTime.ts**

- sendStamp(stampId) 関数を追加
- stamp_received 受信時に該当プレイヤーに stamp 情報を付加（2秒後に自動クリア）

**packages/web/src/components/game/GameCanvas.tsx**

- スタンプ付きプレイヤーのキャラ上に絵文字テキストを描画

**packages/server/src/index.ts**

- `stamp` メッセージの受信とルーム内中継

**packages/web/src/app/game/[roomId]/page.tsx**

- StampButton を追加

## 制約

- スタンプは全員に見える（チーム限定は Phase 1 本実装で対応）
- フェードイン・アウトのアニメーションは任意
