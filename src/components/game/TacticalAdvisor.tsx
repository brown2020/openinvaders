// src/components/game/TacticalAdvisor.tsx

import React, { useEffect, useRef, useState } from "react";
import { useCompletion } from "@ai-sdk/react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TacticalAdvisorProps {
  score: number;
  wave: number;
  lives: number;
  gameStatus: string;
}

/**
 * AI-powered tactical advisor that provides gameplay tips
 */
const TacticalAdvisor: React.FC<TacticalAdvisorProps> = ({
  score,
  wave,
  lives,
  gameStatus,
}) => {
  const { completion, complete, isLoading, error } = useCompletion({
    api: "/api/completion",
  });

  const [isMinimized, setIsMinimized] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(true);

  // Track previous values and current score for context messages
  const stateRef = useRef({
    wave,
    lives,
    status: gameStatus,
    score,
  });

  // Keep score updated in ref (doesn't trigger effect)
  stateRef.current.score = score;

  // Check if API is available
  useEffect(() => {
    if (error) {
      setHasApiKey(false);
    }
  }, [error]);

  // Trigger advice on significant events (wave change, life lost, game start)
  useEffect(() => {
    if (!hasApiKey) return;

    const prev = stateRef.current;
    let shouldTrigger = false;
    let context = "";

    if (gameStatus === "PLAYING" && prev.status !== "PLAYING") {
      shouldTrigger = true;
      context = "Game started. Give a brief, encouraging tactical tip.";
    } else if (wave > prev.wave) {
      shouldTrigger = true;
      context = `Wave ${wave} started! Score: ${prev.score}. Give a quick tip for this wave.`;
    } else if (lives < prev.lives && lives > 0) {
      shouldTrigger = true;
      context = `Player lost a life! ${lives} lives remaining. Score: ${prev.score}. Give brief encouragement.`;
    }

    if (shouldTrigger && !isLoading) {
      complete(context);
    }

    // Update tracked state
    stateRef.current = { wave, lives, status: gameStatus, score: prev.score };
  }, [wave, lives, gameStatus, complete, isLoading, hasApiKey]);

  // Don't render if no API key or error
  if (!hasApiKey) return null;

  // Don't show during menu
  if (gameStatus === "MENU") return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-xs pointer-events-none">
      <AnimatePresence>
        {!isMinimized && (completion || isLoading) && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="bg-slate-900/90 border border-blue-500/50 rounded-lg p-3 mb-2 backdrop-blur-sm pointer-events-auto shadow-lg shadow-blue-500/20"
          >
            <div className="flex items-start gap-2">
              <div className="bg-blue-500/20 p-1.5 rounded-full shrink-0">
                <Bot className="w-4 h-4 text-blue-400" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="text-blue-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    Tactical AI
                    {isLoading && (
                      <Sparkles className="w-3 h-3 animate-pulse" />
                    )}
                  </h4>
                  <button
                    onClick={() => setIsMinimized(true)}
                    className="text-blue-400/50 hover:text-blue-400 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-blue-100/90 text-xs leading-relaxed">
                  {completion || "Analyzing battle conditions..."}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Minimized button */}
      {isMinimized && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex justify-end pointer-events-auto"
        >
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-500/70 hover:text-blue-400 hover:bg-blue-500/10 text-xs"
            onClick={() => setIsMinimized(false)}
          >
            <Bot className="w-4 h-4 mr-1" />
            Show AI
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default TacticalAdvisor;
