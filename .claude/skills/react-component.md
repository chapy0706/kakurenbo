<!-- .claude/skills/react-component.md -->

# React コンポーネントの作成

Next.js App Router 上の React コンポーネントを作成するときのパターン。

## 配置先

```
packages/web/src/components/{カテゴリ}/{コンポーネント名}.tsx   # 共通コンポーネント
packages/web/src/app/{パス}/page.tsx                           # ページコンポーネント
```

カテゴリ: ui / lobby / game / forest

## コンポーネントのテンプレート

```typescript
"use client";

import { type FC, useState, useCallback } from "react";

interface StampButtonProps {
  onSend: (stampId: string) => void;
  disabled?: boolean;
}

export const StampButton: FC<StampButtonProps> = ({ onSend, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = useCallback(
    (stampId: string) => {
      onSend(stampId);
      setIsOpen(false);
    },
    [onSend],
  );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={disabled}
        className="rounded-full bg-green-600 px-4 py-2 text-white disabled:opacity-50"
      >
        スタンプ
      </button>
      {isOpen && (
        <div className="absolute bottom-12 left-0 rounded-lg bg-white p-2 shadow-lg">
          {/* スタンプ一覧 */}
        </div>
      )}
    </div>
  );
};
```

## ページコンポーネントのテンプレート

```typescript
import { GameCanvas } from "@/components/game/GameCanvas";
import { StampButton } from "@/components/game/StampButton";

export default function GamePage({ params }: { params: { roomId: string } }) {
  return (
    <main className="flex h-dvh flex-col">
      <GameCanvas roomId={params.roomId} />
      <div className="flex items-center justify-center p-4">
        <StampButton onSend={(id) => console.log(id)} />
      </div>
    </main>
  );
}
```

## 守ること

- "use client" は状態・イベントハンドラを使うコンポーネントにのみ付ける
- page.tsx はできるだけ Server Component のままにし、Client Component は切り出す
- Props の型は interface で定義する。FC<Props> で型付けする
- named export を使う（page.tsx の default export のみ例外）
- スタイリングは Tailwind CSS のユーティリティクラスを使う
- ドメインロジックをコンポーネント内に書かない。hooks に委譲する
- h-screen ではなく h-dvh を使う（モバイルのアドレスバー対応）
- button には必ず type 属性を指定する
