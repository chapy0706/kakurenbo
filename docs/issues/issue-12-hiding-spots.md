# Issue #12: マップ上の隠れ場所の配置

前提: #9

## 概要

固定マップ上に隠れ場所（岩・茂み・大きな木）を配置し、Canvas に描画する。「少ない隠れ場所による心理戦」というゲームデザインの核を視覚化する。

## 完了条件

- [ ] マップ上に 4〜6 個の隠れ場所が固定配置されている
- [ ] 隠れ場所が Canvas 上で視覚的に区別できる形で描画されている
- [ ] 隠れ場所のデータが shared パッケージの定数として定義されている

## 作業ファイル

### 更新

**packages/shared/src/constants/game-config.ts**

HIDING_SPOTS 配列を追加:
- 各要素: { id: string, type: "rock" | "bush" | "tree", x: number, y: number, width: number, height: number }
- 4〜6 個をマップ全体にバランスよく配置

**packages/web/src/components/game/GameCanvas.tsx**

描画ループに隠れ場所の描画を追加。

描画順序:
1. 背景（地面）
2. グリッド線
3. 隠れ場所
4. プレイヤー
5. プレイヤー名

描画スタイル:
- rock: 灰色（#888）の楕円
- bush: 濃い緑（#2D5F2C）の丸
- tree: 茶色（#5C4033）の幹（rect） + 緑（#3A7D32）の丸い葉（arc）

## 制約

- 当たり判定（隠れ場所に重なっているか）は後続 issue
- 隠れ場所の配置は固定値。まったりモードでの動的配置は Phase 2
- Canvas の基本図形（arc, rect, ellipse）で表現する。画像は使わない
