# Issue #5: pnpm workspace の初期化

前提: なし

## 概要

モノレポの骨格を作成する。ルートの package.json、pnpm-workspace.yaml、各パッケージの package.json を配置し、`pnpm install` が通る状態にする。

## 完了条件

- [ ] ルートに package.json（private: true）が存在する
- [ ] ルートに pnpm-workspace.yaml が存在する（packages: ["packages/*"]）
- [ ] packages/shared/package.json が存在し、name が `@kakurenbo/shared` である
- [ ] packages/server/package.json が存在し、name が `@kakurenbo/server` である
- [ ] packages/web/package.json が存在し、name が `@kakurenbo/web` である
- [ ] 各パッケージに tsconfig.json が存在する（strict: true）
- [ ] `pnpm install` がエラーなく完了する

## 作業ファイル

### 新規作成

- `package.json` — ルート定義。private: true。workspaces は未使用（pnpm-workspace.yaml に委譲）
- `pnpm-workspace.yaml` — packages: ["packages/*"]
- `packages/shared/package.json` — name: @kakurenbo/shared
- `packages/shared/tsconfig.json` — strict: true、target: ES2022、module: ESNext
- `packages/shared/src/index.ts` — 空ファイル（エントリーポイント）
- `packages/server/package.json` — name: @kakurenbo/server
- `packages/server/tsconfig.json` — strict: true、target: ES2022、module: ESNext
- `packages/web/package.json` — name: @kakurenbo/web
- `packages/web/tsconfig.json` — strict: true、Next.js 用の設定

## 制約

- Node.js 20 LTS を前提とする
- この時点では依存パッケージは typescript のみ
- pnpm-workspace.yaml による管理（ルート package.json の workspaces フィールドは不要）
