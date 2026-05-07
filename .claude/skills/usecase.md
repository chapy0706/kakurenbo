<!-- .claude/skills/usecase.md -->

# ユースケースの作成

Application層のユースケースを作成するときのパターン。

## 配置先

```
packages/server/src/application/usecase/{ユースケース名}.ts
```

## テンプレート

```typescript
import type { RoomRepository } from "../../domain/repository/RoomRepository";
import type { PlayerRepository } from "../../domain/repository/PlayerRepository";
import { Room } from "../../domain/model/room/Room";
import { RoomId } from "../../domain/model/room/RoomId";

export interface CreateRoomInput {
  hostPlayerName: string;
}

export interface CreateRoomOutput {
  roomId: string;
  playerId: string;
}

export class CreateRoom {
  constructor(
    private readonly roomRepository: RoomRepository,
    private readonly playerRepository: PlayerRepository,
  ) {}

  async execute(input: CreateRoomInput): Promise<CreateRoomOutput> {
    const roomId = RoomId.generate();
    const room = Room.create({ id: roomId });

    // ドメインロジックの呼び出し
    const player = room.addPlayer(input.hostPlayerName);

    // 永続化
    await this.roomRepository.save(room);
    await this.playerRepository.save(player);

    return {
      roomId: roomId.value,
      playerId: player.id.value,
    };
  }
}
```

## 守ること

- ユースケースは1クラス1責任。1つのユースケースが1つの操作を表す
- コンストラクタでRepositoryやPortを受け取る（依存性注入）
- 具象クラスではなくインターフェース（Repository / Port）に依存する
- Input / Output の型を明示的に定義する
- ドメインロジックはドメインモデルに委譲する。ユースケース内にビジネスルールを書かない
- infrastructure のモジュールを直接 import しない
- エラーハンドリングはドメイン例外を使う
