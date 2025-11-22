import React, { useEffect, useRef } from 'react';
import { useCompletion } from '@ai-sdk/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TacticalAdvisorProps {
  score: number;
  wave: number;
  lives: number;
  gameStatus: string;
}

const TacticalAdvisor: React.FC<TacticalAdvisorProps> = ({ score, wave, lives, gameStatus }) => {
  const { completion, complete, isLoading, error } = useCompletion({
    api: '/api/completion',
    onError: (err) => console.error("AI Advisor Error:", err),
  });

  const lastTriggerRef = useRef<{ wave: number; lives: number; status: string }>({
    wave,
    lives,
    status: gameStatus
  });

  useEffect(() => {
    // Check for significant changes
    const prev = lastTriggerRef.current;
    let shouldTrigger = false;
    let context = "";

    if (gameStatus === 'PLAYING' && prev.status !== 'PLAYING') {
      shouldTrigger = true;
      context = "Game started. Give initial advice.";
    } else if (wave > prev.wave) {
      shouldTrigger = true;
      context = `Wave ${wave} started. Score: ${score}.`;
    } else if (lives < prev.lives) {
      shouldTrigger = true;
      context = `Player lost a life! Lives remaining: ${lives}. Score: ${score}.`;
    }

    if (shouldTrigger && !isLoading) {
      complete(context);
      lastTriggerRef.current = { wave, lives, status: gameStatus };
    }
  }, [score, wave, lives, gameStatus, complete, isLoading]);

  // Handle manual trigger
  const handleAsk = () => {
    if (!isLoading) {
      complete(`Current status: Wave ${wave}, Lives ${lives}, Score ${score}. I need immediate tactical advice!`);
    }
  };

  if (error) return null; // Hide on error

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-xs pointer-events-none">
      <AnimatePresence>
        {(completion || isLoading) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-black/80 border border-blue-500 rounded-lg p-4 mb-2 backdrop-blur-sm pointer-events-auto"
          >
             <div className="flex items-start gap-3">
                <div className="bg-blue-500/20 p-2 rounded-full">
                    <Bot className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1">
                    <h4 className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
                        Tactical Command
                        {isLoading && <Sparkles className="w-3 h-3 animate-pulse" />}
                    </h4>
                    <p className="text-blue-100 text-sm leading-relaxed font-mono">
                        {completion || "Analyzing combat data..."}
                    </p>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Optional: Manual Trigger Button (only visible if not playing to avoid distraction, or small) */}
      <div className="flex justify-end pointer-events-auto">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-blue-500 hover:text-blue-400 hover:bg-blue-500/10"
            onClick={handleAsk}
            disabled={isLoading}
          >
             <Bot className="w-4 h-4 mr-2" />
             Ask Command
          </Button>
      </div>
    </div>
  );
};

export default TacticalAdvisor;

