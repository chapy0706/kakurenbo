"use client";

import { type FC } from "react";

interface ConnectionStatusProps {
  isConnected: boolean;
  playerCount: number;
}

export const ConnectionStatus: FC<ConnectionStatusProps> = ({ isConnected, playerCount }) => {
  return (
    <div className="fixed right-3 top-3 z-10 flex items-center gap-2 rounded-full bg-black/50 px-3 py-1.5 text-sm text-white">
      <span
        className={`h-2.5 w-2.5 rounded-full ${isConnected ? "bg-green-400" : "bg-red-500"}`}
      />
      <span>{isConnected ? `${playerCount}人接続中` : "切断中"}</span>
    </div>
  );
};
