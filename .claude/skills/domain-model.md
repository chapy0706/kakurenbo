<!-- .claude/skills/domain-model.md -->

# ドメインモデルの作成

Entity または Value Object を作成するときのパターン。

## 配置先

```
packages/server/src/domain/model/{集約名}/{モデル名}.ts
```

## Entity のテンプレート

Entity は一意なIDを持ち、ライフサイクルがある。

```typescript
import { PlayerId } from "./PlayerId";

export type PlayerState = "waiting" | "moving" | "hiding" | "found";

export class Player {
  private constructor(
    private readonly _id: PlayerId,
    private _name: string,
    private _state: PlayerState,
    private _position: { x: number; y: number },
  ) {}

  static create(params: {
    id: PlayerId;
    name: string;
    position: { x: number; y: number };
  }): Player {
    return new Player(params.id, params.name, "waiting", params.position);
  }

  get id(): PlayerId {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get state(): PlayerState {
    return this._state;
  }

  get position(): { x: number; y: number } {
    return { ...this._position };
  }

  moveTo(position: { x: number; y: number }): void {
    if (this._state === "found") return;
    this._state = "moving";
    this._position = { ...position };
  }

  hide(): void {
    if (this._state === "found") return;
    this._state = "hiding";
  }

  markFound(): void {
    this._state = "found";
  }
}
```

## Value Object のテンプレート

Value Object は不変で、等価性で比較する。

```typescript
export class PlayerId {
  private constructor(private readonly _value: string) {}

  static create(value: string): PlayerId {
    if (!value || value.trim().length === 0) {
      throw new Error("PlayerId must not be empty");
    }
    return new PlayerId(value);
  }

  get value(): string {
    return this._value;
  }

  equals(other: PlayerId): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
```

## 守ること

- コンストラクタは private にし、static create で生成する
- domain 層のモデルはフレームワーク・ライブラリに依存しない
- import は同じ domain/model 内のみ許可。infrastructure や application を import しない
- 状態変更はメソッド経由で行う。プロパティの直接書き換えは許可しない
- バリデーションは create メソッド内で行う
- 作成したら対応するテストも書く
