# Issue #22: モバイル表示の最適化

前提: #9

## 概要

スマートフォンでの操作体験を改善する。Canvas のサイズ調整、タッチイベントの最適化、viewport の設定を行う。

## 完了条件

- [ ] スマートフォンのブラウザで全画面表示される（アドレスバー込みで対応）
- [ ] ピンチズーム・ダブルタップズームが無効化されている
- [ ] タッチ操作時にスクロールが発生しない
- [ ] 画面回転時に Canvas サイズが追従する

## 作業ファイル

### 更新

**packages/web/src/app/layout.tsx**

viewport meta 設定:
- width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover

**packages/web/src/components/game/GameCanvas.tsx**

Canvas サイズ:
- window.visualViewport（利用可能な場合）を使用
- resize / orientationchange イベントで Canvas サイズを再計算

タッチイベント:
- Canvas 要素に CSS touch-action: none を設定
- addEventListener で passive: false を指定
- preventDefault() でブラウザデフォルト動作を防止

CSS:
- h-dvh の使用

## 制約

- iOS Safari + Android Chrome で動作する想定
- PWA 対応（manifest.json 等）は対象外
