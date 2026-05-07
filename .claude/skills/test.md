<!-- .claude/skills/test.md -->

# テストの書き方

Vitest を使ったテストを書くときのパターン。

## 配置先

```
packages/server/src/__tests__/{層}/{カテゴリ}/{テスト名}.test.ts
```

ドメインモデルのテスト例:
```
packages/server/src/__tests__/domain/service/HideAndSeekJudge.test.ts
packages/server/src/__tests__/domain/model/player/Player.test.ts
```

## ドメインモデルのテスト

```typescript
import { describe, it, expect } from "vitest";
import { Player } from "../../../domain/model/player/Player";
import { PlayerId } from "../../../domain/model/player/PlayerId";

describe("Player", () => {
  const createPlayer = (overrides?: Partial<{ name: string; x: number; y: number }>) => {
    return Player.create({
      id: PlayerId.create("player-1"),
      name: overrides?.name ?? "テスト猫",
      position: { x: overrides?.x ?? 100, y: overrides?.y ?? 200 },
    });
  };

  describe("create", () => {
    it("初期状態はwaiting", () => {
      const player = createPlayer();
      expect(player.state).toBe("waiting");
    });
  });

  describe("moveTo", () => {
    it("位置が更新されstateがmovingになる", () => {
      const player = createPlayer();
      player.moveTo({ x: 300, y: 400 });

      expect(player.position).toEqual({ x: 300, y: 400 });
      expect(player.state).toBe("moving");
    });

    it("found状態では移動できない", () => {
      const player = createPlayer();
      player.markFound();
      player.moveTo({ x: 300, y: 400 });

      expect(player.position).toEqual({ x: 100, y: 200 });
      expect(player.state).toBe("found");
    });
  });
});
```

## ドメインサービスのテスト

```typescript
import { describe, it, expect } from "vitest";
import { HideAndSeekJudge } from "../../../domain/service/HideAndSeekJudge";

describe("HideAndSeekJudge", () => {
  const judge = new HideAndSeekJudge();

  it("全員発見で鬼チームの勝ち", () => {
    const result = judge.evaluate({
      timeLimit: 180,
      elapsedTime: 120,
      hiders: [
        { id: "h1", state: "found" },
        { id: "h2", state: "found" },
      ],
    });

    expect(result.winner).toBe("seekers");
  });

  it("時間切れで生存者がいれば隠れるチームの勝ち", () => {
    const result = judge.evaluate({
      timeLimit: 180,
      elapsedTime: 180,
      hiders: [
        { id: "h1", state: "found" },
        { id: "h2", state: "hiding" },
      ],
    });

    expect(result.winner).toBe("hiders");
  });
});
```

## ユースケースのテスト

Repository をモックして、ユースケースの振る舞いをテストする。

```typescript
import { describe, it, expect, vi } from "vitest";
import { CreateRoom } from "../../../application/usecase/CreateRoom";

describe("CreateRoom", () => {
  it("ルームを作成しホストプレイヤーを追加する", async () => {
    const mockRoomRepo = { save: vi.fn() };
    const mockPlayerRepo = { save: vi.fn() };

    const usecase = new CreateRoom(mockRoomRepo, mockPlayerRepo);
    const result = await usecase.execute({ hostPlayerName: "テスト猫" });

    expect(result.roomId).toBeDefined();
    expect(result.playerId).toBeDefined();
    expect(mockRoomRepo.save).toHaveBeenCalledOnce();
    expect(mockPlayerRepo.save).toHaveBeenCalledOnce();
  });
});
```

## 守ること

- ドメイン層のテストは必ずテストファーストで書く
- テストは Arrange-Act-Assert パターンで構成する
- ヘルパー関数（createPlayer等）でテストデータの生成を共通化する
- モックは vi.fn() を使う。外部ライブラリのモックツールは不要
- テスト名は日本語で、振る舞いを説明する文にする
- 1テスト1アサーション（関連する複数アサーションはOK）
- infrastructure 層（DB・WebSocket）のテストは統合テストとして別途書く
