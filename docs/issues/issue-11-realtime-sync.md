# Issue #11: Canvas と WebSocket の接続（リアルタイム同期）

前提: #9, #10

## 概要

GameCanvas と useRealTime を統合し、複数クライアント間でキャラクターの位置がリアルタイムに同期される状態にする。これがモックの最重要ゴール。

## 完了条件

- [ ] 自キャラのタップ移動時に move メッセージがサーバーに送信される
- [ ] 他クライアントのキャラ（別の色の丸）が Canvas 上に表示される
- [ ] 他クライアントの移動がリアルタイムに反映される
- [ ] 新規プレイヤー参加時に Canvas 上にキャラが追加される
- [ ] プレイヤー退出時に Canvas 上からキャラが消える
- [ ] 2つのブラウザタブで /game/test-room を開いて同時に動作確認できる

## 作業ファイル

### 更新

**packages/web/src/app/game/[roomId]/page.tsx**

- useRealTime を呼び出す（roomId はパスパラメータ、playerName は仮の固定値でOK）
- 取得した players, sendMove, playerId を GameCanvas に渡す

**packages/web/src/components/game/GameCanvas.tsx**

Props 追加:
- players: Map<string, RemotePlayer>
- myPlayerId: string | null
- onMove: (position: Position) => void

描画の変更:
- 自キャラに加えて、players 内の全リモートプレイヤーも描画する
- 各キャラの上にプレイヤー名をテキスト描画する

色の割り当て:
- 自キャラ: #2C5F2D（緑）
- 他プレイヤー: ["#E8A838", "#5C4033", "#97BC62", "#6B7B6E", "#D4E8C2"] から playerId のハッシュで選択

移動の連携:
- タップ移動時に onMove(position) を呼び出す
- リモートプレイヤーの位置更新は線形補間で滑らかに表示（受信位置に向かって毎フレーム移動）

## 制約

- 送信頻度の throttle は後続 issue。この issue では毎フレーム送信でOK
- playerName は仮の固定値（"プレイヤー" + ランダム数字）でOK。タイトル画面は後続 issue
