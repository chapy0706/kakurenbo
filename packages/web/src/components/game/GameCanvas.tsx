"use client";

import { type FC, useRef, useEffect, useCallback } from "react";
import { GAME_CONFIG, HIDING_SPOTS } from "@kakurenbo/shared";
import type { Position, HidingSpot } from "@kakurenbo/shared";
import type { RemotePlayer } from "@/hooks/useRealTime";

const { PLAYER_SPEED, PLAYER_RADIUS, TILE_SIZE } = GAME_CONFIG;
const REMOTE_COLORS = ["#E8A838", "#5C4033", "#97BC62", "#6B7B6E", "#D4E8C2"];
const LONG_PRESS_MS = 500;
const MOVE_THRESHOLD = 10;

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
  alpha = 1,
) {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, PLAYER_RADIUS, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#333333";
  ctx.font = "12px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(name, x, y - PLAYER_RADIUS - 4);
  ctx.globalAlpha = 1;
}

interface GameCanvasProps {
  players: Map<string, RemotePlayer>;
  myPlayerId: string | null;
  onMove: (position: Position) => void;
  onHide: () => void;
}

export const GameCanvas: FC<GameCanvasProps> = ({ players, myPlayerId: _myPlayerId, onMove, onHide }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const posRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);
  const playersRef = useRef(players);
  const onMoveRef = useRef(onMove);
  const onHideRef = useRef(onHide);
  const remoteRenderRef = useRef<Map<string, { x: number; y: number }>>(new Map());

  const isHidingRef = useRef(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pressStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => { playersRef.current = players; }, [players]);
  useEffect(() => { onMoveRef.current = onMove; }, [onMove]);
  useEffect(() => { onHideRef.current = onHide; }, [onHide]);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = { x: e.clientX - rect.left, y: e.clientY - rect.top };

    pressStartRef.current = pos;

    // キャンバスのポインターをキャプチャして pointerup/cancel を確実に受け取る
    e.currentTarget.setPointerCapture(e.pointerId);

    // 長押しタイマー開始
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      isHidingRef.current = true;
      targetRef.current = { ...posRef.current }; // 移動停止
      onHideRef.current();
      pressStartRef.current = null;
    }, LONG_PRESS_MS);

    // 即座に移動（レスポンシブ）
    targetRef.current = pos;
    isHidingRef.current = false;
    onMoveRef.current(pos);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!pressStartRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const dx = e.clientX - rect.left - pressStartRef.current.x;
    const dy = e.clientY - rect.top - pressStartRef.current.y;
    if (Math.sqrt(dx * dx + dy * dy) > MOVE_THRESHOLD) {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      pressStartRef.current = null;

      const target = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      targetRef.current = target;
      isHidingRef.current = false;
      onMoveRef.current(target);
    }
  }, []);

  const handlePointerUp = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    pressStartRef.current = null;
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

      // リモートプレイヤー描画
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

        drawPlayer(ctx, rp.x, rp.y, hashColor(id), player.name, player.state === "hiding" ? 0.4 : 1);
        if (player.stamp) {
          ctx.font = "20px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(player.stamp, rp.x, rp.y - PLAYER_RADIUS - 20);
        }
      }

      // 自キャラ（最前面）
      drawPlayer(ctx, pos.x, pos.y, "#2C5F2D", "あなた", isHidingRef.current ? 0.4 : 1);

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="block"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    />
  );
};
