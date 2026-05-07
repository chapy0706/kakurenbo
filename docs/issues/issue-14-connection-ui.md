# Issue #14: 接続状態とプレイヤー数の表示

前提: #11

## 概要

ゲーム画面上に接続状態と現在の接続プレイヤー数を表示する UI を追加する。

## 完了条件

- [ ] 画面右上に接続状態が表示される（緑丸: 接続中、赤丸: 切断中）
- [ ] 現在の接続プレイヤー数が表示される（例:「2人接続中」）
- [ ] Canvas の描画を邪魔しない位置・スタイルである

## 作業ファイル

### 新規作成

**packages/web/src/components/game/ConnectionStatus.tsx**

- "use client" コンポーネント
- Props: isConnected: boolean, playerCount: number
- 画面右上に fixed 配置（z-index で Canvas の上）
- Tailwind CSS でスタイリング

### 更新

- `packages/web/src/app/game/[roomId]/page.tsx` — ConnectionStatus を追加

## 制約

- モック段階の動作確認用 UI。本実装で見た目を調整する
