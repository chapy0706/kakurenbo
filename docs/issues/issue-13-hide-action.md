# Issue #13: 「隠れる」アクションの実装

前提: #11, #12

## 概要

プレイヤーが長押しで「隠れる」状態になる操作を実装する。キャラの見た目が変化し、状態が WebSocket で同期される。

## 完了条件

- [ ] Canvas 上で長押し（500ms 以上）すると自キャラが「隠れる」状態になる
- [ ] 隠れている状態ではキャラが半透明（globalAlpha = 0.4）で描画される
- [ ] 隠れる状態が WebSocket 経由で他クライアントに同期される
- [ ] 移動すると隠れ状態が解除される

## 作業ファイル

### 更新

**packages/shared/src/types/messages.ts**

ClientMessage に追加:
- `{ type: "hide" }`

ServerMessage に追加:
- `{ type: "player_hidden"; playerId: string }`

PlayerInfo に state フィールドを追加（または PlayerState 型を定義）:
- `"waiting" | "moving" | "hiding"`

**packages/web/src/components/game/GameCanvas.tsx**

長押し検出:
- touchstart / mousedown でタイマー開始（setTimeout 500ms）
- 500ms 経過で「隠れる」を発火
- touchmove / mousemove が 10px 以上あればキャンセル（タップ移動との区別）
- touchend / mouseup でタイマークリア

描画変更:
- state が "hiding" のプレイヤーは globalAlpha = 0.4 で描画

**packages/web/src/hooks/useRealTime.ts**

- sendHide 関数を追加
- player_hidden 受信時に該当プレイヤーの state を "hiding" に更新
- player_moved 受信時に該当プレイヤーの state を "moving" に更新

**packages/server/src/index.ts**

- `hide` メッセージの受信と中継
- プレイヤーの state を "hiding" に更新
- `player_hidden` を他クライアントにブロードキャスト
- `move` 受信時にプレイヤーの state を "moving" に更新

## 制約

- 隠れ場所の近くにいるかの判定は省略（どこでも隠れられる状態でOK）
- 鬼チーム / 隠れるチームの可視性制御は Phase 1 本実装で対応
