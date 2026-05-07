# Issue #19: ESLint + Vitest の設定

前提: #7, #8

## 概要

全パッケージ共通の ESLint と Vitest の設定を行い、`make check` が通る状態にする。

## 完了条件

- [ ] `make lint` が全パッケージでエラーなく実行される
- [ ] `make type-check` が全パッケージで型エラーなく通る
- [ ] `make test` が Vitest を実行する（テストファイルがなくてもエラーにならない）
- [ ] `make check`（lint + type-check + test）が正常終了する

## 作業ファイル

### 依存追加（ルート devDependencies）

- eslint / @typescript-eslint/eslint-plugin / @typescript-eslint/parser
- eslint-plugin-react / eslint-plugin-react-hooks
- vitest
- @types/node / @types/react / @types/react-dom

### 新規作成

- `eslint.config.mjs` — flat config 形式。TypeScript + React 対応
- `vitest.workspace.ts` — workspace 対応設定

### 更新

- 各パッケージの package.json に lint / type-check / test スクリプトが揃っていること

## 制約

- ESLint ルールは厳しすぎない設定にする（初心者メンバーが萎縮しないように）
- Prettier は使わない。導入する場合は別 issue で
- テストファイルは後続 issue で追加
