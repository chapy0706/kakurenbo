import { useState, useEffect, useCallback, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import type { Position, ServerMessage, ClientMessage } from "@kakurenbo/shared";

interface UseRealTimeParams {
  serverUrl?: string;
  roomId: string;
  playerName: string;
}

export interface RemotePlayer {
  id: string;
  name: string;
  position: Position;
}

interface UseRealTimeReturn {
  isConnected: boolean;
  playerId: string | null;
  players: Map<string, RemotePlayer>;
  sendMove: (position: Position) => void;
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
          if (player) next.set(msg.playerId, { ...player, position: msg.position });
          return next;
        });
      } else if (msg.type === "player_left") {
        setPlayers((prev) => {
          const next = new Map(prev);
          next.delete(msg.playerId);
          return next;
        });
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [serverUrl, roomId, playerName]);

  const sendMove = useCallback((position: Position) => {
    socketRef.current?.emit("message", { type: "move", position } satisfies ClientMessage);
  }, []);

  return { isConnected, playerId, players, sendMove };
}
