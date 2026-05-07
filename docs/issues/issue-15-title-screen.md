# Issue #15: タイトル画面とルーム入室フロー

前提: #8, #11

## 概要

タイトル画面にプレイヤー名入力とルーム ID 入力を実装し、ゲーム画面への遷移フローを作る。

## 完了条件

- [ ] / にアクセスするとタイトル画面が表示される
- [ ] プレイヤー名を入力できる
- [ ] 「部屋をつくる」でランダムなルーム ID が生成され /game/[roomId] に遷移する
- [ ] 「部屋に入る」でルーム ID を入力して /game/[roomId] に遷移する
- [ ] プレイヤー名が /game/[roomId] に引き継がれる

## 作業ファイル

### 更新

**packages/web/src/app/page.tsx**

"use client" コンポーネントに変更:
- タイトル「かくれんぼ」表示
- プレイヤー名入力フィールド
- 「部屋をつくる」ボタン: 4桁ランダム英数字の roomId を生成し router.push
- 「部屋に入る」ボタン + ルーム ID 入力フィールド: 入力した roomId で router.push
- プレイヤー名は sessionStorage に保存

**packages/web/src/app/game/[roomId]/page.tsx**

- sessionStorage からプレイヤー名を取得して useRealTime に渡す
- 名前未設定なら / にリダイレクト

## 制約

- Tailwind CSS で最低限の見た目を整える程度でOK
- バリデーションは空文字チェックのみ
- ロビー画面（待機画面）はこの issue では作らない
