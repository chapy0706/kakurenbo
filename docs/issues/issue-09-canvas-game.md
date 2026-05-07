# Issue #9: Canvas によるゲーム画面の描画

前提: #8

## 概要

ゲーム画面に Canvas を配置し、タイルマップの描画と自キャラの表示を実装する。この時点ではサーバー接続なしで、タップした位置にキャラが移動する。

## 完了条件

- [ ] /game/[roomId] にアクセスすると Canvas が全画面表示される
- [ ] Canvas 上にタイルマップ（グリッド線）が描画されている
- [ ] 自キャラ（色付きの丸）が Canvas 中央に表示されている
- [ ] Canvas をタップすると、その位置に向かってキャラがスムーズに移動する
- [ ] モバイル表示に対応している（viewport 全体を Canvas が占める）

## 作業ファイル

### 新規作成

**packages/web/src/components/game/GameCanvas.tsx**

"use client" コンポーネント。

構造:
- useRef で canvas 要素を参照
- useEffect で requestAnimationFrame の描画ループを開始
- Canvas サイズ: window.innerWidth x window.innerHeight

描画内容（毎フレーム）:
1. 背景クリア — 薄い緑（#D4E8C2）
2. グリッド線 — GAME_CONFIG.TILE_SIZE 間隔で薄い線
3. 自キャラ — 緑（#2C5F2D）の丸、半径 GAME_CONFIG.PLAYER_RADIUS

移動ロジック:
- タッチ / クリックイベントで目標位置（targetX, targetY）を取得
- 毎フレーム、現在位置から目標位置に向かって GAME_CONFIG.PLAYER_SPEED で移動
- 線形補間（lerp）で滑らかに移動
- 目標到着判定: 距離が PLAYER_SPEED 以下なら目標位置にスナップ

### 更新

- `packages/web/src/app/game/[roomId]/page.tsx` — GameCanvas を表示

## 制約

- サーバー接続なし。ローカル完結
- Phaser.js は使わない（Canvas API 直書き）
- 隠れ場所の描画は後続 issue
- カメラ（スクロール）は後続 issue。マップは画面に収まるサイズ
