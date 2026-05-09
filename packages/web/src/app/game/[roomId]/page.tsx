"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { GameCanvas } from "@/components/game/GameCanvas";
import { ConnectionStatus } from "@/components/game/ConnectionStatus";
import { useRealTime } from "@/hooks/useRealTime";

export default function GamePage() {
  const params = useParams();
  const roomId = typeof params.roomId === "string" ? params.roomId : "test-room";
  const [playerName] = useState(() => `プレイヤー${Math.floor(Math.random() * 100)}`);

  const { isConnected, players, playerId, sendMove, sendHide } = useRealTime({ roomId, playerName });

  return (
    <main className="h-dvh overflow-hidden">
      <GameCanvas players={players} myPlayerId={playerId} onMove={sendMove} onHide={sendHide} />
      <ConnectionStatus isConnected={isConnected} playerCount={players.size + 1} />
    </main>
  );
}
