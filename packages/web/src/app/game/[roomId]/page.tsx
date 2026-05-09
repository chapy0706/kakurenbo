type Props = {
  params: Promise<{ roomId: string }>;
};

export default async function GamePage({ params }: Props) {
  const { roomId } = await params;

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-900">
      <p className="text-white">ゲームルーム: {roomId}</p>
    </main>
  );
}
