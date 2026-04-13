// src/hooks/useGameEngine.ts

import { useCallback, useEffect, useRef, useState } from "react";
import { EntityManager } from "@/lib/game/EntityManager";
import { useGameStore } from "@/lib/store/game-store";
import { soundManager } from "@/lib/sounds/SoundManager";
import { SoundType } from "@/lib/sounds/SoundTypes";
import { PROJECTILE } from "@/lib/constants/game";
import {
  ParticleSystem,
  Starfield,
  ScreenShake,
  CRTEffect,
} from "@/lib/effects";
import { ScoreNotification, CollisionEvent } from "@/types/game";
import { ALIEN_TYPE_COLORS, GAME_COLORS } from "@/lib/constants/colors";
import { SCREEN_SHAKE } from "@/lib/constants/effects";
import { checkCollisions } from "@/lib/game/CollisionManager";
import type { Entity } from "@/lib/entities/entity";

/**
 * Core game engine hook that manages game state, updates, and rendering
 */
export const useGameEngine = () => {
  const { status, wave, incrementScore, setStatus, setLives, incrementWave } =
    useGameStore();

  // Game systems refs (class instances that are mutated by the game loop)
  const entityManagerRef = useRef(new EntityManager());
  const lastTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);

  // Visual effects systems refs
  const particleSystemRef = useRef(new ParticleSystem());
  const starfieldRef = useRef(new Starfield());
  const screenShakeRef = useRef(new ScreenShake());
  const crtEffectRef = useRef(new CRTEffect());

  // State-managed snapshots for render (avoids reading refs during render)
  const [entities, setEntities] = useState<Entity[]>([]);
  const [effectSystems] = useState(() => ({
    particleSystem: new ParticleSystem(),
    starfield: new Starfield(),
    screenShake: new ScreenShake(),
    crtEffect: new CRTEffect(),
  }));

  // Sync effect system state refs with the stable objects passed to render
  useEffect(() => {
    particleSystemRef.current = effectSystems.particleSystem;
    starfieldRef.current = effectSystems.starfield;
    screenShakeRef.current = effectSystems.screenShake;
    crtEffectRef.current = effectSystems.crtEffect;
  }, [effectSystems]);

  // Entity version for triggering re-renders
  const [entitiesVersion, setEntitiesVersion] = useState(0);
  const bumpVersion = useCallback(() => setEntitiesVersion((v) => v + 1), []);

  // Update entities snapshot when version changes
  useEffect(() => {
    setEntities(entityManagerRef.current.getAllEntities());
  }, [entitiesVersion]);

  // Score notifications for floating score popups
  const [notifications, setNotifications] = useState<ScoreNotification[]>([]);
  const notificationIdRef = useRef(0);

  /**
   * Add a score notification popup
   */
  const addNotification = useCallback(
    (points: number, x: number, y: number) => {
      const id = notificationIdRef.current++;
      const notification: ScoreNotification = {
        id,
        score: points,
        position: { x, y },
        timestamp: performance.now(),
      };

      setNotifications((prev) => [...prev, notification]);

      // Remove notification after animation
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, 1000);
    },
    []
  );

  /**
   * Handle collision events with type-safe discriminated union
   */
  const handleCollisionEvents = useCallback(
    (events: CollisionEvent[]) => {
      let needsBump = false;

      for (const event of events) {
        switch (event.type) {
          case "ALIEN_KILLED": {
            incrementScore(event.points);
            addNotification(event.points, event.position.x, event.position.y);

            // Create explosion particles using shared color mapping
            particleSystemRef.current.createExplosion(
              event.position,
              ALIEN_TYPE_COLORS[event.payload.alienType]
            );

            // Screen shake using constants
            screenShakeRef.current.trigger(
              SCREEN_SHAKE.ALIEN_KILL,
              SCREEN_SHAKE.ALIEN_KILL_DURATION
            );
            soundManager.play(SoundType.ALIEN_KILLED);
            needsBump = true;
            break;
          }

          case "UFO_KILLED": {
            incrementScore(event.points);
            addNotification(event.points, event.position.x, event.position.y);

            // Big explosion for UFO
            particleSystemRef.current.createExplosion(
              event.position,
              GAME_COLORS.UFO,
              24
            );
            screenShakeRef.current.trigger(
              SCREEN_SHAKE.UFO_KILL,
              SCREEN_SHAKE.UFO_KILL_DURATION
            );
            // Stop UFO flying sound and play explosion
            soundManager.stop(SoundType.UFO_FLYING);
            soundManager.play(SoundType.UFO_KILLED);
            needsBump = true;
            break;
          }

          case "PLAYER_HIT": {
            setLives(event.payload.lives);

            // Create hit particles
            particleSystemRef.current.createSparkBurst(
              event.position,
              GAME_COLORS.PLAYER,
              16
            );
            screenShakeRef.current.trigger(
              SCREEN_SHAKE.PLAYER_HIT,
              SCREEN_SHAKE.PLAYER_HIT_DURATION
            );
            soundManager.play(SoundType.PLAYER_HIT);
            break;
          }

          case "GAME_OVER": {
            setStatus("GAME_OVER");
            soundManager.stop(SoundType.UFO_FLYING);
            soundManager.play(SoundType.GAME_OVER);
            break;
          }

          case "BARRIER_HIT": {
            particleSystemRef.current.createDebris(event.position, 4);
            soundManager.play(SoundType.EXPLOSION);
            if (event.payload.destroyed) {
              needsBump = true;
            }
            break;
          }

          case "ALIEN_LANDED": {
            // Handled by GAME_OVER event that follows
            break;
          }
        }
      }

      return needsBump;
    },
    [incrementScore, setLives, setStatus, addNotification]
  );

  /**
   * Reset the game
   */
  const resetGame = useCallback(
    (fullReset = false) => {
      entityManagerRef.current.reset(fullReset);
      particleSystemRef.current.clear();
      screenShakeRef.current.reset();
      starfieldRef.current.reset();
      lastTimeRef.current = 0;
      bumpVersion();
    },
    [bumpVersion]
  );

  // Store update loop deps in a ref for stable access from the animation frame callback
  const updateDepsRef = useRef({
    status,
    wave,
    handleCollisionEvents,
    incrementWave,
    resetGame,
    bumpVersion,
  });
  useEffect(() => {
    updateDepsRef.current = {
      status,
      wave,
      handleCollisionEvents,
      incrementWave,
      resetGame,
      bumpVersion,
    };
  });

  /**
   * Move player
   */
  const movePlayer = useCallback(
    (direction: "left" | "right", isMoving: boolean) => {
      if (direction === "left") {
        entityManagerRef.current.player.isMovingLeft = isMoving;
      }
      if (direction === "right") {
        entityManagerRef.current.player.isMovingRight = isMoving;
      }
    },
    []
  );

  /**
   * Shoot projectile
   */
  const shoot = useCallback(() => {
    if (status !== "PLAYING") return;

    const em = entityManagerRef.current;
    const playerShots = em.projectiles.filter(
      (p) => p.isPlayerProjectile
    ).length;

    if (playerShots < PROJECTILE.CAPS.PLAYER_MAX) {
      const projectile = em.player.shoot();
      if (projectile) {
        em.addProjectile(projectile);
        soundManager.play(SoundType.SHOOT);
        bumpVersion();
      }
    }
  }, [status, bumpVersion]);

  // Start/stop game loop based on status
  useEffect(() => {
    if (status !== "PLAYING") return;

    lastTimeRef.current = 0;

    const tick = (timestamp: number) => {
      const deps = updateDepsRef.current;
      if (deps.status !== "PLAYING") return;

      // Calculate delta time with frame rate cap
      const deltaTime = lastTimeRef.current
        ? Math.min(timestamp - lastTimeRef.current, 32)
        : 16;
      lastTimeRef.current = timestamp;

      const em = entityManagerRef.current;

      // Update visual effects
      starfieldRef.current.update(deltaTime);
      particleSystemRef.current.update(deltaTime);

      // Update entities
      em.update(deltaTime, timestamp, deps.wave);

      // Check collisions (pass shot count for deterministic UFO scoring)
      const events = checkCollisions(
        em.player,
        em.aliens,
        em.barriers,
        em.projectiles,
        em.ufo,
        em.shotCount
      );

      // Handle events
      let needsBump: boolean = deps.handleCollisionEvents(events);

      // Check win condition
      if (em.areAllAliensDestroyed()) {
        deps.incrementWave();
        deps.resetGame(false);
        needsBump = true;
      }

      // Bump version if needed to trigger re-render
      if (needsBump || events.length > 0) {
        deps.bumpVersion();
      }

      // Continue loop
      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [status]);

  return {
    entities,
    entitiesVersion,
    notifications,
    particleSystem: effectSystems.particleSystem,
    starfield: effectSystems.starfield,
    screenShake: effectSystems.screenShake,
    crtEffect: effectSystems.crtEffect,
    movePlayer,
    shoot,
    resetGame,
  };
};
