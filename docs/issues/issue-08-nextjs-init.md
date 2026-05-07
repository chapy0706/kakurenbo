# Issue #8: Next.js プロジェクトの初期化

前提: #5, #6

## 概要

packages/web に Next.js (App Router) + TypeScript + Tailwind CSS の初期構成を作成する。

## 完了条件

- [ ] `pnpm --filter @kakurenbo/web run dev` で Next.js 開発サーバーがポート 3000 で起動する
- [ ] / にアクセスするとページが表示される（App Router 構成）
- [ ] Tailwind CSS のユーティリティクラスが適用されている
- [ ] @kakurenbo/shared から型を import できる

## 作業ファイル

### 依存追加（packages/web）

- next / react / react-dom
- tailwindcss / @tailwindcss/postcss（v4 系）
- @kakurenbo/shared（workspace:*）

### 新規作成

- `packages/web/next.config.ts` — transpilePackages: ["@kakurenbo/shared"]
- `packages/web/postcss.config.mjs` — Tailwind CSS v4 の設定
- `packages/web/src/app/layout.tsx` — html lang="ja"、viewport meta、Tailwind 読み込み
- `packages/web/src/app/page.tsx` — 仮タイトル画面（「かくれんぼ」+ /game/test-room へのリンク）
- `packages/web/src/app/game/[roomId]/page.tsx` — 空のゲームページ（次 issue で Canvas 実装）
- `packages/web/src/app/globals.css` — @import "tailwindcss"

### 更新

- packages/web/package.json の scripts:
  - `"dev": "next dev"`
  - `"build": "next build"`
  - `"type-check": "tsc --noEmit"`

## 制約

- スタイリングは最小限でOK
- ロビー画面は Phase 1 本実装で対応。モックでは / から /game/test-room に直接遷移
