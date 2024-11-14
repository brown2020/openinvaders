// app/page.tsx
"use client";

import dynamic from "next/dynamic";

// Dynamically import the Game component to avoid canvas-related SSR issues
const Game = dynamic(() => import("@/components/game/Game"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="text-green-500 text-2xl animate-pulse">
        Loading Space Invaders...
      </div>
    </div>
  ),
});

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black p-4">
      <h1 className="text-4xl font-bold text-green-500 mb-8 pixel-font">
        SPACE INVADERS
      </h1>
      <Game />
    </main>
  );
}
