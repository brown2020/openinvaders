// app/page.tsx
"use client";

import dynamic from "next/dynamic";

// Dynamically import Game component to avoid SSR issues with canvas
const Game = dynamic(() => import("@/components/game/Game"), {
  ssr: false,
  loading: () => <LoadingScreen />,
});

function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="relative">
        {/* Animated loading container */}
        <div className="flex flex-col items-center gap-6">
          {/* Logo */}
          <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-green-400 to-cyan-400 pixel-font animate-pulse">
            SPACE INVADERS
          </h1>

          {/* Loading bar */}
          <div className="w-64 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-500 to-green-500 rounded-full animate-loading-bar" />
          </div>

          {/* Loading text */}
          <p className="text-cyan-400/70 pixel-font text-sm animate-pulse">
            INITIALIZING...
          </p>
        </div>

        {/* Decorative elements */}
        <div className="absolute -inset-20 opacity-20">
          <div
            className="absolute top-0 left-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-float"
            style={{ animationDelay: "0s" }}
          />
          <div
            className="absolute top-1/4 right-0 w-1 h-1 bg-green-400 rounded-full animate-float"
            style={{ animationDelay: "0.5s" }}
          />
          <div
            className="absolute bottom-1/4 left-0 w-1.5 h-1.5 bg-pink-400 rounded-full animate-float"
            style={{ animationDelay: "1s" }}
          />
          <div
            className="absolute bottom-0 right-1/4 w-1 h-1 bg-yellow-400 rounded-full animate-float"
            style={{ animationDelay: "1.5s" }}
          />
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return <Game />;
}
