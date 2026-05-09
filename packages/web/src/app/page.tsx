"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

function generateRoomId(): string {
  return Math.random().toString(36).slice(2, 6);
}

export default function HomePage() {
  const router = useRouter();
  const [playerName, setPlayerName] = useState("");
  const [joinRoomId, setJoinRoomId] = useState("");
  const [showJoin, setShowJoin] = useState(false);
  const [error, setError] = useState("");

  const saveName = (): boolean => {
    if (!playerName.trim()) {
      setError("プレイヤー名を入力してください");
      return false;
    }
    sessionStorage.setItem("playerName", playerName.trim());
    return true;
  };

  const handleCreate = () => {
    if (!saveName()) return;
    router.push(`/game/${generateRoomId()}`);
  };

  const handleJoin = (e: FormEvent) => {
    e.preventDefault();
    if (!saveName()) return;
    if (!joinRoomId.trim()) {
      setError("ルームIDを入力してください");
      return;
    }
    router.push(`/game/${joinRoomId.trim()}`);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-green-50 px-4">
      <h1 className="mb-2 text-6xl font-bold text-green-800">かくれんぼ</h1>
      <p className="mb-10 text-lg text-green-600">森の中でかくれんぼをしよう！</p>

      <div className="w-full max-w-xs space-y-4">
        <input
          type="text"
          placeholder="プレイヤー名"
          value={playerName}
          onChange={(e) => { setPlayerName(e.target.value); setError(""); }}
          className="w-full rounded-xl border border-green-300 px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-green-400"
          maxLength={20}
        />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="button"
          onClick={handleCreate}
          className="w-full rounded-xl bg-green-600 px-4 py-3 text-lg font-semibold text-white hover:bg-green-700"
        >
          部屋をつくる
        </button>

        {!showJoin ? (
          <button
            type="button"
            onClick={() => setShowJoin(true)}
            className="w-full rounded-xl border border-green-600 px-4 py-3 text-lg font-semibold text-green-700 hover:bg-green-100"
          >
            部屋に入る
          </button>
        ) : (
          <form onSubmit={handleJoin} className="space-y-2">
            <input
              type="text"
              placeholder="ルームID（4文字）"
              value={joinRoomId}
              onChange={(e) => { setJoinRoomId(e.target.value); setError(""); }}
              className="w-full rounded-xl border border-green-300 px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              maxLength={20}
            />
            <button
              type="submit"
              className="w-full rounded-xl bg-green-600 px-4 py-3 text-lg font-semibold text-white hover:bg-green-700"
            >
              入室する
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
