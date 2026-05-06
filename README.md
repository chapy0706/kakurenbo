# かくれんぼ (Kakurenbo)

可愛い動物キャラたちが暮らす平和な森を舞台に、チームで知恵を競うリアルタイム対戦かくれんぼゲーム。
勝ち負けより「一緒にいた記憶」が残ることを目指す。

## コンセプト

鬼チームと隠れるチームに分かれ、制限時間内に心理戦・読み合いを繰り広げるブラウザベースのマルチプレイヤーゲーム。
隠れ場所をあえて少なく設計することで、「どこに隠れるか」ではなく「いかに相手の意表を突くか」がゲームの核になる。

灯台下暗し――最も目立つ場所こそが最強の隠れ場所になる逆説が、このゲームの面白さを生む。

## 技術スタック(案)

| レイヤー         | 技術                              | 用途                                   |
| ---------------- | --------------------------------- | -------------------------------------- |
| フロントエンド   | Next.js (App Router) / TypeScript | ルーティング、UI、ロビー画面           |
| ゲーム描画       | Phaser.js                         | 2Dマップ、キャラクター、アニメーション |
| UIスタイリング   | Tailwind CSS                      | コンポーネントのスタイリング           |
| 状態管理         | Zustand                           | React側のUI状態管理                    |
| リアルタイム通信 | Socket.io                         | WebSocketによるプレイヤー間同期        |
| ORM              | Drizzle ORM                       | 型安全なDB操作                         |
| データベース     | PostgreSQL                        | 森データ、ユーザー、対戦履歴           |
| パッケージ管理   | pnpm (workspaces)                 | モノレポのパッケージ管理               |
| デプロイ         | Vercel + Cloudflare               | staging / prod 自動デプロイ            |

## 設計思想

- Clean Architecture: ドメイン層は外部に依存しない。DB・WebSocket・ゲームエンジンはアダプターとして実装する
- UNIX哲学: 各モジュールは単一の責任を持ち、小さく繋ぐ
- DDD（軽量版）: Entity、Value Object、Repositoryパターンを採用。Aggregate Rootは必要に応じて導入
- TDD: ドメイン層の判定ロジックはテストファーストで実装する

## ディレクトリ構成(案)

```
kakurenbo/
├── README.md
├── package.json                        # pnpm workspaces ルート定義
├── pnpm-workspace.yaml                 # ワークスペース設定
├── Makefile                            # check / dev / lint / test
├── .github/
│   └── workflows/
│       └── ci.yml                      # staging push時の自動CI
│
├── packages/
│   ├── shared/                         # クライアント・サーバー共有パッケージ
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── types/
│   │       │   ├── messages.ts         # WebSocketメッセージ型定義
│   │       │   └── events.ts          # ゲームイベント型定義
│   │       └── constants/
│   │           └── game-config.ts      # マップサイズ、制限時間等の定数
│   │
│   ├── server/                         # WebSocketサーバー
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts                # サーバーエントリーポイント
│   │       ├── domain/
│   │       │   ├── model/
│   │       │   │   ├── player/
│   │       │   │   │   ├── Player.ts
│   │       │   │   │   ├── PlayerId.ts
│   │       │   │   │   └── PlayerState.ts
│   │       │   │   ├── room/
│   │       │   │   │   ├── Room.ts
│   │       │   │   │   ├── RoomId.ts
│   │       │   │   │   └── Team.ts
│   │       │   │   ├── forest/
│   │       │   │   │   ├── Forest.ts
│   │       │   │   │   ├── Tile.ts
│   │       │   │   │   └── HidingSpot.ts
│   │       │   │   └── game/
│   │       │   │       ├── GameSession.ts
│   │       │   │       ├── GameRule.ts
│   │       │   │       └── GameResult.ts
│   │       │   ├── repository/
│   │       │   │   ├── ForestRepository.ts
│   │       │   │   ├── PlayerRepository.ts
│   │       │   │   └── GameSessionRepository.ts
│   │       │   └── service/
│   │       │       ├── HideAndSeekJudge.ts
│   │       │       └── ForestBuilder.ts
│   │       ├── application/
│   │       │   ├── usecase/
│   │       │   │   ├── CreateRoom.ts
│   │       │   │   ├── JoinRoom.ts
│   │       │   │   ├── StartGame.ts
│   │       │   │   ├── MovePlayer.ts
│   │       │   │   ├── HidePlayer.ts
│   │       │   │   └── SeekPlayer.ts
│   │       │   └── port/
│   │       │       └── RealTimePort.ts
│   │       ├── infrastructure/
│   │       │   ├── db/
│   │       │   │   ├── schema/
│   │       │   │   │   ├── forests.ts
│   │       │   │   │   ├── players.ts
│   │       │   │   │   └── game-sessions.ts
│   │       │   │   └── repository/
│   │       │   │       ├── DrizzleForestRepository.ts
│   │       │   │       └── DrizzlePlayerRepository.ts
│   │       │   └── realtime/
│   │       │       ├── SocketIOAdapter.ts
│   │       │       └── RoomManager.ts
│   │       └── __tests__/
│   │           ├── domain/
│   │           │   └── service/
│   │           │       └── HideAndSeekJudge.test.ts
│   │           └── application/
│   │               └── usecase/
│   │
│   └── web/                            # Next.js フロントエンド
│       ├── package.json
│       ├── tsconfig.json
│       ├── next.config.ts
│       ├── tailwind.config.ts
│       └── src/
│           ├── app/
│           │   ├── layout.tsx
│           │   ├── page.tsx            # タイトル画面
│           │   ├── lobby/
│           │   │   └── page.tsx
│           │   ├── game/
│           │   │   └── [roomId]/
│           │   │       └── page.tsx
│           │   └── forest/
│           │       └── [forestId]/
│           │           └── page.tsx
│           ├── components/
│           │   ├── ui/
│           │   ├── lobby/
│           │   ├── game/
│           │   │   └── GameCanvas.tsx
│           │   └── forest/
│           ├── hooks/
│           │   ├── useGameSession.ts
│           │   ├── useForest.ts
│           │   └── useRealTime.ts
│           ├── store/
│           │   ├── lobbyStore.ts
│           │   └── gameUIStore.ts
│           └── infrastructure/
│               ├── renderer/
│               │   └── PhaserGameRenderer.ts
│               └── realtime/
│                   ├── WebSocketAdapter.ts
│                   └── MockWebSocketAdapter.ts
│
└── docs/
    ├── gdd.md                          # Game Design Document
    ├── architecture.md                 # アーキテクチャ設計書
    └── onboarding.md                   # 新メンバー向けガイド
```

### 依存の方向

```
presentation (web) --> application --> domain <-- infrastructure
                          |                          |
                          └──────────────────────────┘
                          (Dependency Inversion)
```

ドメイン層が中心で、何にも依存しない。インフラ層がドメインのインターフェースを実装する。

### パッケージ間の関係

```
@kakurenbo/shared   : 型定義・定数（server / web 両方から参照）
@kakurenbo/server   : WebSocketサーバー（shared に依存）
@kakurenbo/web      : Next.jsフロントエンド（shared に依存）
```

## セットアップ

```bash
# リポジトリのクローン
git clone https://github.com/chapy0706/kakurenbo.git
cd kakurenbo

# 依存のインストール（全パッケージ一括）
pnpm install

# 開発サーバーの起動
make dev
```

`make dev` で WebSocketサーバーとNext.js開発サーバーが同時に起動する。

### pnpm のインストール

pnpm が未インストールの場合は、以下のいずれかでインストールする。

```bash
# Node.js corepack 経由（推奨）
corepack enable
corepack prepare pnpm@latest --activate

# npm 経由
npm install -g pnpm
```

## コマンド一覧(案)

| コマンド          | 内容                                            |
| ----------------- | ----------------------------------------------- |
| `make check`      | lint + 型チェック + テスト（push前に必ず実行）  |
| `make dev`        | 開発サーバー起動（サーバー + フロント同時起動） |
| `make dev-server` | WebSocketサーバーのみ起動                       |
| `make dev-web`    | Next.js開発サーバーのみ起動                     |
| `make lint`       | ESLintの実行                                    |
| `make type-check` | TypeScriptの型チェック                          |
| `make test`       | Vitestでテスト実行                              |
| `make install`    | 全パッケージの依存インストール                  |
| `make clean`      | node_modules / ビルド成果物の削除               |

## ブランチ戦略

| ブランチ  | 用途                                        |
| --------- | ------------------------------------------- |
| `staging` | 開発用。全員がここに直接pushする            |
| `prod`    | 本番用。stagingが安定したらリーダーがマージ |

### ルール

- 原則全員が staging に直接 push する。壊してOK、学んで直す
- push前に `make check` を実行する(最低限の品質保証)
- GitHub Actions が毎push時にCIを実行する（マージブロックなし）
- prod へのマージは staging が安定してからリーダーが実施
- ローカル環境でのAI使用可(ただしAPI等のアクセストークン類は原則記載不可)

## デプロイ

staging / prod ともに Cloudflare 経由で Vercel に自動デプロイされる。
staging へ push するとステージング環境に、prod へマージすると本番環境に自動反映される。

## 開発フェーズ

### Phase 1（現在）: 最小のかくれんぼ

固定マップでの2〜4人対戦に集中する。

- 固定マップ（森づくり機能なし）
- リアルタイム移動同期
- 隠れる・探すのコア操作
- 勝敗判定
- ロビー + ルームシステム
- チームスタンプ機能

### Phase 2（将来）: まったりモード

- 森づくり（タイル配置・隠れ場所配置）
- 一人での森編集
- 森データの永続化

### Phase 3（将来）: 連動と拡張

- まったりモードの森をかくれんぼマップとして使用
- 複数人でのリアルタイム森編集
- 森の訪問機能
- キャラクターカスタマイズ

## チーム(仮)

| 担当         | 担当領域                                     |
| ------------ | -------------------------------------------- |
| リーダー     | バックエンド / インフラ / アーキテクチャ設計 |
| バックエンド | ゲームエンジン / ゲームロジック              |
| フロント     | フロントエンドUI / スタイリング              |

## ライセンス

MIT LICENSE
