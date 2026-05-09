export const GAME_CONFIG = {
  MAP_WIDTH: 800,
  MAP_HEIGHT: 600,
  PLAYER_SPEED: 3,
  PLAYER_RADIUS: 16,
  TILE_SIZE: 40,
  SEND_INTERVAL_MS: 60,
} as const;

export type HidingSpotType = "rock" | "bush" | "tree";

export type HidingSpot = {
  id: string;
  type: HidingSpotType;
  x: number;
  y: number;
  width: number;
  height: number;
};

export const HIDING_SPOTS: HidingSpot[] = [
  { id: "rock-1", type: "rock", x: 100,  y:  80, width: 70, height: 50 },
  { id: "bush-1", type: "bush", x: 620,  y: 100, width: 60, height: 60 },
  { id: "tree-1", type: "tree", x:  80,  y: 280, width: 70, height: 90 },
  { id: "rock-2", type: "rock", x: 360,  y: 240, width: 80, height: 55 },
  { id: "bush-2", type: "bush", x: 620,  y: 440, width: 60, height: 60 },
  { id: "tree-2", type: "tree", x: 240,  y: 440, width: 70, height: 90 },
];
