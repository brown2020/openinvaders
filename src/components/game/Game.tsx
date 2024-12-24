// src/components/game/Game.tsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  GAME_DIMENSIONS,
  GAME_STATES,
  PLAYER,
  ALIEN,
  BARRIER,
} from "@/lib/constants/game";
import { Player } from "@/lib/entities/player";
import { Alien, AlienFormation } from "@/lib/entities/alien";
import { Barrier } from "@/lib/entities/barrier";
import { Projectile } from "@/lib/entities/projectile";
import { Entity } from "@/lib/entities/entity";
import { soundManager } from "@/lib/sounds/SoundManager";
import { SoundType } from "@/lib/sounds/SoundTypes";
import GameCanvas from "./GameCanvas";
import GameOverlay from "./GameOverlay";
import GameControls from "./GameControls";
import { ScoreNotification } from "./GameOverlay";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

type GameState = keyof typeof GAME_STATES;

interface ScoreNotificationInfo {
  id: number;
  score: number;
  position: { x: number; y: number };
}

const Game: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GAME_STATES.MENU);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [wave, setWave] = useState(1);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [scoreNotifications, setScoreNotifications] = useState<
    ScoreNotificationInfo[]
  >([]);

  // Game entities
  const playerRef = useRef<Player | null>(null);
  const aliensRef = useRef<Alien[]>([]);
  const barriersRef = useRef<Barrier[]>([]);
  const projectilesRef = useRef<Projectile[]>([]);

  // Animation frame and timing
  const animationFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const notificationIdRef = useRef(0);

  const addScoreNotification = useCallback(
    (points: number, x: number, y: number) => {
      const id = notificationIdRef.current++;
      setScoreNotifications((prev) => [
        ...prev,
        { id, score: points, position: { x, y } },
      ]);
      setTimeout(() => {
        setScoreNotifications((prev) =>
          prev.filter((notification) => notification.id !== id)
        );
      }, 1000);
    },
    []
  );

  const initializeGame = useCallback(() => {
    // Reset timing
    lastTimeRef.current = 0;

    // Initialize player
    playerRef.current = new Player({
      position: {
        x: GAME_DIMENSIONS.WIDTH / 2 - PLAYER.WIDTH / 2,
        y: PLAYER.Y_POSITION,
      },
      dimensions: {
        width: PLAYER.WIDTH,
        height: PLAYER.HEIGHT,
      },
    });

    // Initialize aliens
    const aliens: Alien[] = [];
    for (let row = 0; row < ALIEN.ROWS; row++) {
      for (let col = 0; col < ALIEN.COLS; col++) {
        const type = row === 0 ? "TOP" : row < 3 ? "MIDDLE" : "BOTTOM";
        const formationPosition = {
          x: col * ALIEN.HORIZONTAL_SPACING + GAME_DIMENSIONS.MARGIN,
          y: row * ALIEN.VERTICAL_SPACING + ALIEN.INITIAL_Y,
        };

        aliens.push(
          new Alien({
            type,
            row,
            column: col,
            formationPosition,
            position: { ...formationPosition },
            dimensions: {
              width: ALIEN.WIDTH,
              height: ALIEN.HEIGHT,
            },
          })
        );
      }
    }
    aliensRef.current = aliens;

    // Initialize barriers
    const barriers: Barrier[] = [];
    const barrierSpacing =
      (GAME_DIMENSIONS.WIDTH - BARRIER.COUNT * BARRIER.WIDTH) /
      (BARRIER.COUNT + 1);

    for (let i = 0; i < BARRIER.COUNT; i++) {
      barriers.push(
        new Barrier({
          position: {
            x: barrierSpacing + (barrierSpacing + BARRIER.WIDTH) * i,
            y: BARRIER.Y_POSITION,
          },
          dimensions: {
            width: BARRIER.WIDTH,
            height: BARRIER.HEIGHT,
          },
        })
      );
    }
    barriersRef.current = barriers;

    // Reset formation
    AlienFormation.reset();

    // Clear projectiles
    projectilesRef.current = [];

    // Reset score for new game, keep score for next wave
    if (gameState === GAME_STATES.MENU || gameState === GAME_STATES.GAME_OVER) {
      setScore(0);
      setWave(1);
    }

    // Start game
    setGameState(GAME_STATES.PLAYING);
    soundManager.setMuted(!isSoundEnabled);
  }, [gameState, isSoundEnabled]);

  const checkCollisions = useCallback(() => {
    if (!playerRef.current) return;

    const player = playerRef.current;

    // Check projectile collisions
    for (const projectile of projectilesRef.current) {
      if (projectile.isPlayerProjectile) {
        // Check alien hits
        for (const alien of aliensRef.current) {
          if (!alien.isDestroyed && projectile.collidesWith(alien)) {
            alien.isDestroyed = true;
            projectile.isActive = false;
            const newScore = score + alien.points;
            setScore(newScore);
            if (newScore > highScore) {
              setHighScore(newScore);
            }
            addScoreNotification(
              alien.points,
              alien.position.x,
              alien.position.y
            );
            soundManager.play(SoundType.ALIEN_KILLED);
            break;
          }
        }
      } else {
        // Alien projectile hits player
        if (projectile.collidesWith(player)) {
          projectile.isActive = false;
          player.lives--;
          soundManager.play(SoundType.PLAYER_HIT);
          if (player.lives <= 0) {
            soundManager.play(SoundType.GAME_OVER);
            setGameState(GAME_STATES.GAME_OVER);
          }
        }
      }

      // Check barrier hits
      for (const barrier of barriersRef.current) {
        if (!barrier.isDestroyed && projectile.collidesWith(barrier)) {
          projectile.isActive = false;
          barrier.damage(projectile.position.x, projectile.position.y);
          soundManager.play(SoundType.EXPLOSION);
          break;
        }
      }
    }

    // Check if aliens reached bottom
    for (const alien of aliensRef.current) {
      if (
        !alien.isDestroyed &&
        alien.position.y + alien.dimensions.height >= PLAYER.Y_POSITION
      ) {
        soundManager.play(SoundType.GAME_OVER);
        setGameState(GAME_STATES.GAME_OVER);
        break;
      }
    }
  }, [score, highScore, addScoreNotification]);

  const updateGame = useCallback(
    (timestamp: number) => {
      if (gameState !== GAME_STATES.PLAYING) return;

      const deltaTime = lastTimeRef.current
        ? Math.min(timestamp - lastTimeRef.current, 32)
        : 16;
      lastTimeRef.current = timestamp;

      // Update player
      if (playerRef.current) {
        playerRef.current.update(deltaTime);
      }

      // Update alien formation
      AlienFormation.update(aliensRef.current, deltaTime);

      // Update individual aliens and handle shooting
      aliensRef.current.forEach((alien) => {
        if (!alien.isDestroyed) {
          alien.update(deltaTime);

          // Alien shooting
          if (
            Math.random() <
              (ALIEN.BASE_SHOOT_CHANCE + ALIEN.WAVE_SHOOT_MULTIPLIER * wave) *
                (deltaTime / 1000) &&
            alien.canShoot(aliensRef.current)
          ) {
            projectilesRef.current.push(alien.shoot());
            soundManager.play(SoundType.SHOOT);
          }
        }
      });

      // Update barriers
      barriersRef.current.forEach((barrier) => {
        if (!barrier.isDestroyed) {
          barrier.update(deltaTime);
        }
      });

      // Update and filter projectiles
      projectilesRef.current = projectilesRef.current.filter((projectile) => {
        projectile.update(deltaTime);
        return projectile.isActive;
      });

      // Check collisions
      checkCollisions();

      // Check win condition
      if (aliensRef.current.every((alien) => alien.isDestroyed)) {
        setWave((prev) => prev + 1);
        initializeGame();
      }

      animationFrameRef.current = requestAnimationFrame(updateGame);
    },
    [gameState, checkCollisions, initializeGame]
  );

  // Game loop effect
  useEffect(() => {
    if (gameState === GAME_STATES.PLAYING) {
      lastTimeRef.current = 0;
      animationFrameRef.current = requestAnimationFrame(updateGame);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState, updateGame]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4">
      <div className="relative">
        <GameCanvas
          entities={[
            ...aliensRef.current,
            ...projectilesRef.current,
            ...barriersRef.current,
            ...(playerRef.current ? [playerRef.current as Entity] : []),
          ]}
          className="border border-green-500"
        />

        <GameOverlay
          gameState={gameState}
          score={score}
          highScore={highScore}
          wave={wave}
          onStart={initializeGame}
          onRestart={initializeGame}
          onResume={() => setGameState(GAME_STATES.PLAYING)}
        />

        {scoreNotifications.map((notification) => (
          <ScoreNotification
            key={notification.id}
            score={notification.score}
            position={notification.position}
          />
        ))}
      </div>

      <GameControls
        gameState={gameState}
        onPause={() => setGameState(GAME_STATES.PAUSED)}
        onResume={() => setGameState(GAME_STATES.PLAYING)}
        onRestart={initializeGame}
        onToggleSound={() => {
          setIsSoundEnabled(!isSoundEnabled);
          soundManager.setMuted(isSoundEnabled);
        }}
        onShowHelp={() => setShowHelp(true)}
        onMoveLeft={(isMoving) => {
          if (playerRef.current) {
            playerRef.current.isMovingLeft = isMoving;
          }
        }}
        onMoveRight={(isMoving) => {
          if (playerRef.current) {
            playerRef.current.isMovingRight = isMoving;
          }
        }}
        onShoot={() => {
          if (playerRef.current && gameState === GAME_STATES.PLAYING) {
            const projectile = playerRef.current.shoot();
            if (projectile) {
              projectilesRef.current.push(projectile);
              soundManager.play(SoundType.SHOOT);
            }
          }
        }}
        isSoundEnabled={isSoundEnabled}
        score={score}
        highScore={highScore}
        lives={playerRef.current?.lives ?? 3}
      />

      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent>
          <DialogTitle className="text-2xl text-green-500 pixel-font">
            HOW TO PLAY
          </DialogTitle>
          <div className="p-4 text-green-500 pixel-font">
            <ul className="space-y-2">
              <li>Use ←/→ or A/D to move</li>
              <li>SPACE to shoot</li>
              <li>P to pause</li>
              <li>ESC to close this help</li>
            </ul>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Game;
