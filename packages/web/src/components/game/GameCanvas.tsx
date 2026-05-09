"use client";

import { type FC, useRef, useEffect, useCallback } from "react";
import { GAME_CONFIG } from "@kakurenbo/shared";

const { PLAYER_SPEED, PLAYER_RADIUS, TILE_SIZE } = GAME_CONFIG;

export const GameCanvas: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const posRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);

  const handlePointer = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    targetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
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

      ctx.fillStyle = "#D4E8C2";
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = "rgba(0,0,0,0.1)";
      ctx.lineWidth = 1;
      for (let x = 0; x <= width; x += TILE_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y <= height; y += TILE_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

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

      ctx.fillStyle = "#2C5F2D";
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, PLAYER_RADIUS, 0, Math.PI * 2);
      ctx.fill();

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
