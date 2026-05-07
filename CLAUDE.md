# CLAUDE.md

このファイルはClaude Codeがプロジェクトを理解するためのエントリーポイントです。
セッション開始時に必ず読んでください。

## プロジェクト概要

かくれんぼ（Kakurenbo）は、ブラウザベースのリアルタイム対戦かくれんぼゲームです。
可愛い動物キャラたちが暮らす平和な森を舞台に、鬼チームと隠れるチームが心理戦を繰り広げます。

現在は Phase 1（最小のかくれんぼ）に集中しています。
固定マップでの2〜4人対戦が動く状態を目指します。

## 技術スタック

- 言語: TypeScript（全パッケージ共通）
- フロントエンド: Next.js (App Router)
- ゲーム描画: Phaser.js
- UIスタイリング: Tailwind CSS
- 状態管理: Zustand
- リアルタイム通信: Socket.io
- ORM: Drizzle ORM
- データベース: PostgreSQL
- パッケージ管理: pnpm (workspaces)
- テスト: Vitest
- デプロイ: Vercel + Cloudflare

## モノレポ構成

pnpm workspacesによるモノレポです。3つのパッケージがあります。

```
packages/
├── shared/    @kakurenbo/shared   型定義・定数（server/web両方から参照）
├── server/    @kakurenbo/server   WebSocketサーバー（Express + Socket.io）
└── web/       @kakurenbo/web      Next.jsフロントエンド
```

パッケージ間の依存:
- shared は何にも依存しない
- server は shared に依存する
- web は shared に依存する
- server と web は互いに依存しない

## アーキテクチャ

Clean Architectureを採用しています。依存の方向を厳守してください。

```
presentation (web) --> application --> domain <-- infrastructure
```

- domain: ビジネスルール。フレームワークやライブラリに依存しない純粋なTypeScript
- application: ユースケース。domainのモデルとrepositoryインターフェースを使う
- infrastructure: 外部技術の実装。domainのインターフェースを実装するアダプター
- presentation: UI。Next.js / Phaser.js / React コンポーネント

domain層は何にも依存してはいけません。
import文でinfrastructure/presentationのモジュールを参照してはいけません。

## コーディングルール

### 全般

- 言語は TypeScript strict mode
- any の使用は禁止。unknown + Zod parseで型を守る
- boundary（API入出力・WebSocketメッセージ受信）では必ずZodでバリデーションする
- 1ファイル1責任。ファイルが200行を超えたら分割を検討する
- エクスポートは named export を使う（default export は page.tsx のみ）

### 命名規則

- ファイル名: PascalCase（クラス・コンポーネント）、camelCase（関数・ユーティリティ）
- ディレクトリ名: kebab-case
- 型・インターフェース: PascalCase、接頭辞Iは付けない
- 定数: UPPER_SNAKE_CASE

### テスト

- ドメイン層はテストファーストで書く
- テストファイルは `__tests__/` ディレクトリに対応する構造で配置する
- テストランナーは Vitest

### Git

- コミットメッセージは日本語OK
- コミット前に `make check` が通ることを確認する
- git push は人間が行う（Claude Codeは実行しない）

## コマンド

```bash
make check        # lint + 型チェック + テスト（CI相当）
make dev          # server + web 同時起動
make dev-server   # WebSocketサーバーのみ
make dev-web      # Next.jsのみ
make lint         # ESLint
make type-check   # tsc --noEmit
make test         # Vitest
make install      # pnpm install
make clean        # node_modules等の削除
```

## ルールファイル

詳細なルールは `.claude/rules/` を参照してください。

- 01-architecture.md: アーキテクチャの制約
- 02-security.md: セキュリティルール
- 03-token.md: トークン節約のルール

## スキルファイル

タスク種別ごとの具体的な実装パターンは `.claude/skills/` を参照してください。

- domain-model.md: ドメインモデル（Entity / Value Object）の作成
- usecase.md: ユースケースの作成
- react-component.md: Reactコンポーネントの作成
- websocket-message.md: WebSocketメッセージ型の追加
- test.md: テストの書き方

## 作業の進め方

1. タスクを受けたら、まず影響範囲を特定する
2. 該当するスキルファイルを読む
3. 既存コードの構造を rg/grep で確認する（大きなファイルを丸読みしない）
4. 変更は小さく。1つのコミットで1つの関心事
5. 変更後は `make check` で確認する
