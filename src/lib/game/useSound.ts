import { useCallback, useEffect, useState } from "react";
import { soundManager } from "@/lib/sounds/SoundManager";
import { SoundType } from "@/lib/sounds/SoundTypes";

interface SoundHook {
  isSoundEnabled: boolean;
  toggleSound: () => void;
  playSound: (type: SoundType) => void;
}

export function useSound(): SoundHook {
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);

  useEffect(() => {
    soundManager.setMuted(!isSoundEnabled);
  }, [isSoundEnabled]);

  const toggleSound = useCallback(() => {
    setIsSoundEnabled((prev) => !prev);
  }, []);

  const playSound = useCallback(
    (type: SoundType) => {
      if (isSoundEnabled) {
        soundManager.play(type);
      }
    },
    [isSoundEnabled]
  );

  return {
    isSoundEnabled,
    toggleSound,
    playSound,
  };
}
