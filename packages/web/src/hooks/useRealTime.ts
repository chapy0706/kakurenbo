import { useState, useEffect, useCallback, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import { GAME_CONFIG } from "@kakurenbo/shared";
import type { Position, PlayerState, ServerMessage, ClientMessage } from "@kakurenbo/shared";

const { SEND_INTERVAL_MS } = GAME_CONFIG;

interface UseRealTimeParams {
  serverUrl?: string;
  roomId: string;
  playerName: string;
}

export interface RemotePlayer {
  id: string;
  name: string;
  position: Position;
  state: PlayerState;
  stamp?: string;
}

interface UseRealTimeReturn {
  isConnected: boolean;
  playerId: string | null;
  players: Map<string, RemotePlayer>;
  sendMove: (position: Position) => void;
  sendHide: () => void;
  sendStamp: (stampId: string) => void;
}

export function useRealTime({
  serverUrl = process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:3001",
  roomId,
  playerName,
}: UseRealTimeParams): UseRealTimeReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [players, setPlayers] = useState<Map<string, RemotePlayer>>(new Map());
  const socketRef = useRef<Socket | null>(null);
  const lastSentAtRef = useRef<number>(0);
  const pendingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPosRef = useRef<Position | null>(null);

  useEffect(() => {
    const socket = io(serverUrl);
    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      const msg: ClientMessage = { type: "join", roomId, playerName };
      socket.emit("message", msg);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("message", (msg: ServerMessage) => {
      if (msg.type === "room_joined") {
        setPlayerId(msg.playerId);
        setPlayers(new Map(msg.players.map((p) => [p.id, p])));
      } else if (msg.type === "player_joined") {
        setPlayers((prev) => new Map(prev).set(msg.player.id, msg.player));
      } else if (msg.type === "player_moved") {
        setPlayers((prev) => {
          const next = new Map(prev);
          const player = next.get(msg.playerId);
          if (player) next.set(msg.playerId, { ...player, position: msg.position, state: "moving" });
          return next;
        });
      } else if (msg.type === "player_hidden") {
        setPlayers((prev) => {
          const next = new Map(prev);
          const player = next.get(msg.playerId);
          if (player) next.set(msg.playerId, { ...player, state: "hiding" });
          return next;
        });
      } else if (msg.type === "player_left") {
        setPlayers((prev) => {
          const next = new Map(prev);
          next.delete(msg.playerId);
          return next;
        });
      } else if (msg.type === "stamp_received") {
        const { playerId: pid, stampId } = msg;
        setPlayers((prev) => {
          const next = new Map(prev);
          const player = next.get(pid);
          if (player) next.set(pid, { ...player, stamp: stampId });
          return next;
        });
        setTimeout(() => {
          setPlayers((prev) => {
            const next = new Map(prev);
            const player = next.get(pid);
            if (player) next.set(pid, { ...player, stamp: undefined });
            return next;
          });
        }, 2000);
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      if (pendingTimerRef.current) clearTimeout(pendingTimerRef.current);
    };
  }, [serverUrl, roomId, playerName]);

  const sendMove = useCallback((position: Position) => {
    lastPosRef.current = position;
    const now = Date.now();
    const elapsed = now - lastSentAtRef.current;

    const emit = (pos: Position) => {
      socketRef.current?.emit("message", { type: "move", position: pos } satisfies ClientMessage);
      lastSentAtRef.current = Date.now();
    };

    if (elapsed >= SEND_INTERVAL_MS) {
      if (pendingTimerRef.current) {
        clearTimeout(pendingTimerRef.current);
        pendingTimerRef.current = null;
      }
      emit(position);
    } else {
      // trailing: 残り時間後に最終位置を送信
      if (pendingTimerRef.current) clearTimeout(pendingTimerRef.current);
      pendingTimerRef.current = setTimeout(() => {
        if (lastPosRef.current) emit(lastPosRef.current);
        pendingTimerRef.current = null;
      }, SEND_INTERVAL_MS - elapsed);
    }
  }, []);

  const sendHide = useCallback(() => {
    socketRef.current?.emit("message", { type: "hide" } satisfies ClientMessage);
  }, []);

  const sendStamp = useCallback((stampId: string) => {
    socketRef.current?.emit("message", { type: "stamp", stampId } satisfies ClientMessage);
  }, []);

  return { isConnected, playerId, players, sendMove, sendHide, sendStamp };
}
