import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-green-50">
      <h1 className="mb-8 text-6xl font-bold text-green-800">かくれんぼ</h1>
      <p className="mb-12 text-lg text-green-600">
        森の中でかくれんぼをしよう！
      </p>
      <Link
        href="/game/test-room"
        className="rounded-2xl bg-green-600 px-8 py-4 text-xl font-semibold text-white hover:bg-green-700"
      >
        ゲームに参加する
      </Link>
    </main>
  );
}
