# Issue #21: WebSocket サーバーのデプロイ準備

前提: #7

## 概要

WebSocket サーバーを外部ホスティング（Render 無料プラン想定）にデプロイできるよう、ビルド設定と環境変数対応を行う。

## 完了条件

- [ ] packages/server に build スクリプトが存在し、dist/ に JS ファイルが出力される
- [ ] PORT 環境変数でリッスンポートを変更できる
- [ ] CORS_ORIGIN 環境変数で許可オリジンを指定できる
- [ ] `node dist/index.js` で起動できる

## 作業ファイル

### 新規作成

- `packages/server/tsconfig.build.json` — outDir: dist、declaration: true

### 更新

**packages/server/package.json**

scripts 追加:
- `"build": "tsc -p tsconfig.build.json"`
- `"start": "node dist/index.js"`

**packages/server/src/index.ts**

環境変数対応:
- `const PORT = process.env.PORT ?? 3001`
- `const CORS_ORIGIN = process.env.CORS_ORIGIN ?? "http://localhost:3000"`

**.gitignore**

- packages/server/dist/ を追加

## 制約

- 実際のデプロイ作業（Render の設定）は手動で行う
- Vercel は Next.js（web）用。サーバーは別ホスティング
