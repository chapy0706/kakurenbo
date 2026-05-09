export type Position = {
  x: number;
  y: number;
};

export type PlayerInfo = {
  id: string;
  name: string;
  position: Position;
};

export type ClientMessage =
  | { type: "join"; roomId: string; playerName: string }
  | { type: "move"; position: Position };

export type ServerMessage =
  | { type: "room_joined"; playerId: string; players: PlayerInfo[] }
  | { type: "player_joined"; player: PlayerInfo }
  | { type: "player_left"; playerId: string }
  | { type: "player_moved"; playerId: string; position: Position };
