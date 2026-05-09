"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { GameCanvas } from "@/components/game/GameCanvas";
import { ConnectionStatus } from "@/components/game/ConnectionStatus";
import { StampButton } from "@/components/game/StampButton";
import { useRealTime } from "@/hooks/useRealTime";

interface GameRoomProps {
  roomId: string;
  playerName: string;
}

function GameRoom({ roomId, playerName }: GameRoomProps) {
  const { isConnected, players, playerId, sendMove, sendHide, sendStamp } = useRealTime({ roomId, playerName });

  return (
    <main className="h-dvh overflow-hidden">
      <GameCanvas players={players} myPlayerId={playerId} onMove={sendMove} onHide={sendHide} />
      <ConnectionStatus isConnected={isConnected} playerCount={players.size + 1} />
      <StampButton onSend={sendStamp} />
    </main>
  );
}

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const roomId = typeof params.roomId === "string" ? params.roomId : "test-room";
  const [playerName, setPlayerName] = useState<string | null>(null);

  useEffect(() => {
    const name = sessionStorage.getItem("playerName");
    if (!name) {
      router.replace("/");
      return;
    }
    setPlayerName(name);
  }, [router]);

  if (!playerName) return null;

  return <GameRoom roomId={roomId} playerName={playerName} />;
}
