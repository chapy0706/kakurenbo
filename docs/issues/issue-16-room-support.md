# Issue #16: サーバーのルーム分割対応

前提: #7, #15

## 概要

WebSocket サーバーにルーム（部屋）の概念を追加し、同じルーム ID のプレイヤー同士だけがメッセージを送受信できるようにする。

## 完了条件

- [ ] `join` メッセージの roomId に基づいて Socket.io の room に参加する
- [ ] `move` / `hide` メッセージが同じルーム内のプレイヤーにのみ中継される
- [ ] 異なるルーム ID のプレイヤー同士は互いに見えない
- [ ] プレイヤー切断時に同じルーム内にのみ `player_left` が送信される

## 作業ファイル

### 更新

**packages/server/src/index.ts**

変更点:
- `join` 受信時に socket.join(roomId) を呼び出す
- プレイヤー情報の Map に roomId を追加
- ブロードキャストを socket.broadcast.emit → socket.to(roomId).emit に変更
- `room_joined` 返却時に同じルーム内のプレイヤーのみ返す
- 全員退出時にルームデータをクリーンアップ

## 制約

- ルーム上限人数チェックは省略可
- RoomManager クラスへの分離は本実装で対応。モックでは index.ts 内に直書きでOK
