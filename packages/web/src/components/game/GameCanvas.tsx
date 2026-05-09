"use client";

import { type FC, useRef, useEffect, useCallback } from "react";
import { GAME_CONFIG, HIDING_SPOTS } from "@kakurenbo/shared";
import type { Position, HidingSpot } from "@kakurenbo/shared";
import type { RemotePlayer } from "@/hooks/useRealTime";

const { PLAYER_SPEED, PLAYER_RADIUS, TILE_SIZE } = GAME_CONFIG;

const REMOTE_COLORS = ["#E8A838", "#5C4033", "#97BC62", "#6B7B6E", "#D4E8C2"];

function hashColor(id: string): string {
  let hash = 0;
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffff;
  return REMOTE_COLORS[hash % REMOTE_COLORS.length];
}

function drawHidingSpot(ctx: CanvasRenderingContext2D, spot: HidingSpot) {
  const cx = spot.x + spot.width / 2;
  const cy = spot.y + spot.height / 2;

  if (spot.type === "rock") {
    ctx.fillStyle = "#888888";
    ctx.beginPath();
    ctx.ellipse(cx, cy, spot.width / 2, spot.height / 2, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (spot.type === "bush") {
    ctx.fillStyle = "#2D5F2C";
    ctx.beginPath();
    ctx.arc(cx, cy, spot.width / 2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // tree: 幹（下）+ 葉（上）
    const trunkW = 20;
    const trunkH = Math.floor(spot.height * 0.35);
    ctx.fillStyle = "#5C4033";
    ctx.fillRect(cx - trunkW / 2, spot.y + spot.height - trunkH, trunkW, trunkH);
    ctx.fillStyle = "#3A7D32";
    ctx.beginPath();
    ctx.arc(cx, spot.y + (spot.height - trunkH) / 2, spot.width / 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPlayer(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  name: string,
) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, PLAYER_RADIUS, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#333333";
  ctx.font = "12px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(name, x, y - PLAYER_RADIUS - 4);
}

interface GameCanvasProps {
  players: Map<string, RemotePlayer>;
  myPlayerId: string | null;
  onMove: (position: Position) => void;
}

export const GameCanvas: FC<GameCanvasProps> = ({ players, myPlayerId, onMove }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const posRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);
  const playersRef = useRef(players);
  const onMoveRef = useRef(onMove);
  const remoteRenderRef = useRef<Map<string, { x: number; y: number }>>(new Map());

  useEffect(() => { playersRef.current = players; }, [players]);
  useEffect(() => { onMoveRef.current = onMove; }, [onMove]);

  const handlePointer = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const target = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    targetRef.current = target;
    onMoveRef.current(target);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let initialized = false;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if (!initialized) {
        initialized = true;
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        posRef.current = { x: cx, y: cy };
        targetRef.current = { x: cx, y: cy };
      }
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const { width, height } = canvas;
      const currentPlayers = playersRef.current;

      ctx.fillStyle = "#D4E8C2";
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = "rgba(0,0,0,0.1)";
      ctx.lineWidth = 1;
      for (let x = 0; x <= width; x += TILE_SIZE) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
      }
      for (let y = 0; y <= height; y += TILE_SIZE) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
      }

      // 隠れ場所
      for (const spot of HIDING_SPOTS) drawHidingSpot(ctx, spot);

      // 自キャラ移動
      const pos = posRef.current;
      const target = targetRef.current;
      const dx = target.x - pos.x;
      const dy = target.y - pos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > PLAYER_SPEED) {
        pos.x += (dx / dist) * PLAYER_SPEED;
        pos.y += (dy / dist) * PLAYER_SPEED;
      } else {
        pos.x = target.x;
        pos.y = target.y;
      }

      // 退出したプレイヤーの補間状態を削除
      const renderMap = remoteRenderRef.current;
      for (const id of renderMap.keys()) {
        if (!currentPlayers.has(id)) renderMap.delete(id);
      }

      // リモートプレイヤー描画（受信位置へ向かって補間移動）
      for (const [id, player] of currentPlayers) {
        let rp = renderMap.get(id);
        if (!rp) {
          rp = { x: player.position.x, y: player.position.y };
          renderMap.set(id, rp);
        }

        const rdx = player.position.x - rp.x;
        const rdy = player.position.y - rp.y;
        const rdist = Math.sqrt(rdx * rdx + rdy * rdy);
        if (rdist > PLAYER_SPEED) {
          rp.x += (rdx / rdist) * PLAYER_SPEED;
          rp.y += (rdy / rdist) * PLAYER_SPEED;
        } else {
          rp.x = player.position.x;
          rp.y = player.position.y;
        }

        drawPlayer(ctx, rp.x, rp.y, hashColor(id), player.name);
      }

      // 自キャラ（最前面に描画）
      drawPlayer(ctx, pos.x, pos.y, "#2C5F2D", "あなた");

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="block"
      onPointerDown={handlePointer}
    />
  );
};
