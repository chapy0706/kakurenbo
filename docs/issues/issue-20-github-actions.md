# Issue #20: GitHub Actions CI の設定

前提: #19

## 概要

staging ブランチへの push 時に自動で lint / 型チェック / テスト を実行する CI を設定する。

## 完了条件

- [ ] .github/workflows/ci.yml が存在する
- [ ] staging への push で CI が実行される
- [ ] lint / type-check / test の3ステップが順に実行される
- [ ] CI が失敗しても push はブロックされない（情報提供のみ）

## 作業ファイル

### 新規作成

**.github/workflows/ci.yml**

```yaml
name: CI
on:
  push:
    branches: [staging]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "pnpm"
      - run: pnpm install --frozen-lockfile
      - run: make lint
      - run: make type-check
      - run: make test
```

## 制約

- pnpm/action-setup で pnpm をインストールする
- --frozen-lockfile で pnpm-lock.yaml の整合性を保証
- ブランチ保護ルール（required checks）は設定しない
