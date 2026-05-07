# Issue #17: 移動メッセージの送信頻度制御

前提: #11

## 概要

タップ移動時の move メッセージ送信に throttle を適用し、サーバーへの過剰な送信を防ぐ。

## 完了条件

- [ ] move メッセージの送信頻度が最大 60ms に 1回（約16fps）に制限される
- [ ] 送信間隔が空いても最後の位置は必ず送信される
- [ ] 体感の滑らかさが損なわれない

## 作業ファイル

### 更新

**packages/shared/src/constants/game-config.ts**

- SEND_INTERVAL_MS: 60 を追加

**packages/web/src/hooks/useRealTime.ts**

sendMove の throttle 実装:
- useRef で最後の送信時刻を保持
- 60ms 以内の連続呼び出しはスキップ
- 移動完了時（目標地点到着）に最終位置を必ず送信

## 制約

- lodash の throttle は使わない。自前で実装する
- パフォーマンスに問題がなければ間隔を短くしてもOK
