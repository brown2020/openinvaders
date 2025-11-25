// src/hooks/useGameEngine.ts

import { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import { EntityManager } from '@/lib/game/EntityManager';
import { CollisionManager } from '@/lib/game/CollisionManager';
import { useGameStore } from '@/lib/store/game-store';
import { soundManager } from '@/lib/sounds/SoundManager';
import { SoundType } from '@/lib/sounds/SoundTypes';
import { Entity } from '@/lib/entities/entity';
import { PROJECTILE } from '@/lib/constants/game';
import { ParticleSystem, Starfield, ScreenShake, CRTEffect } from '@/lib/effects';
import { ScoreNotification, CollisionEvent, GAME_COLORS } from '@/types/game';

interface GameEngineState {
  entities: Entity[];
  entitiesVersion: number;
  notifications: ScoreNotification[];
  particleSystem: ParticleSystem;
  starfield: Starfield;
  screenShake: ScreenShake;
  crtEffect: CRTEffect;
}

/**
 * Core game engine hook that manages game state, updates, and rendering
 */
export const useGameEngine = () => {
  const {
    status,
    wave,
    incrementScore,
    setStatus,
    setLives,
    incrementWave,
  } = useGameStore();

  // Game systems refs
  const entityManagerRef = useRef<EntityManager>(new EntityManager());
  const collisionManagerRef = useRef<CollisionManager>(new CollisionManager());
  const lastTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);

  // Visual effects systems
  const particleSystemRef = useRef<ParticleSystem>(new ParticleSystem());
  const starfieldRef = useRef<Starfield>(new Starfield());
  const screenShakeRef = useRef<ScreenShake>(new ScreenShake());
  const crtEffectRef = useRef<CRTEffect>(new CRTEffect());

  // Entity version for triggering re-renders
  const [entitiesVersion, setEntitiesVersion] = useState(0);
  const bumpVersion = useCallback(() => setEntitiesVersion((v) => v + 1), []);

  // Score notifications for floating score popups
  const [notifications, setNotifications] = useState<ScoreNotification[]>([]);
  const notificationIdRef = useRef(0);

  /**
   * Add a score notification popup
   */
  const addNotification = useCallback((points: number, x: number, y: number) => {
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
  }, []);

  /**
   * Handle collision events
   */
  const handleCollisionEvents = useCallback((events: CollisionEvent[]) => {
    let needsBump = false;

    events.forEach((event) => {
      switch (event.type) {
        case 'ALIEN_KILLED':
          incrementScore(event.points!);
          addNotification(event.points!, event.position!.x, event.position!.y);
          
          // Create explosion particles
          const alienColor = event.payload?.alienType === 'TOP' 
            ? GAME_COLORS.ALIEN_TOP 
            : event.payload?.alienType === 'MIDDLE' 
              ? GAME_COLORS.ALIEN_MIDDLE 
              : GAME_COLORS.ALIEN_BOTTOM;
          particleSystemRef.current.createExplosion(event.position!, alienColor);
          
          // Small screen shake
          screenShakeRef.current.trigger(3, 100);
          needsBump = true;
          break;

        case 'UFO_KILLED':
          incrementScore(event.points!);
          addNotification(event.points!, event.position!.x, event.position!.y);
          
          // Big explosion for UFO
          particleSystemRef.current.createExplosion(event.position!, GAME_COLORS.UFO, 24);
          screenShakeRef.current.trigger(8, 200);
          needsBump = true;
          break;

        case 'PLAYER_HIT':
          setLives(event.payload!.lives as number);
          
          // Create hit particles
          if (event.position) {
            particleSystemRef.current.createSparkBurst(event.position, GAME_COLORS.PLAYER, 16);
          }
          screenShakeRef.current.trigger(10, 300);
          break;

        case 'GAME_OVER':
          setStatus('GAME_OVER');
          break;

        case 'BARRIER_HIT':
          if (event.position) {
            particleSystemRef.current.createDebris(event.position, 4);
          }
          if (event.payload?.destroyed) {
            needsBump = true;
          }
          break;

        case 'ALIEN_LANDED':
          // Handled by GAME_OVER
          break;
      }
    });

    return needsBump;
  }, [incrementScore, setLives, setStatus, addNotification]);

  /**
   * Reset the game
   */
  const resetGame = useCallback((fullReset = false) => {
    entityManagerRef.current.reset(fullReset);
    particleSystemRef.current.clear();
    screenShakeRef.current.reset();
    starfieldRef.current.reset();
    lastTimeRef.current = 0;
    bumpVersion();
  }, [bumpVersion]);

  /**
   * Main game update loop
   */
  const update = useCallback((timestamp: number) => {
    if (status !== 'PLAYING') return;

    // Calculate delta time with frame rate cap
    const deltaTime = lastTimeRef.current 
      ? Math.min(timestamp - lastTimeRef.current, 32) 
      : 16;
    lastTimeRef.current = timestamp;

    const entityManager = entityManagerRef.current;

    // Update visual effects
    starfieldRef.current.update(deltaTime);
    particleSystemRef.current.update(deltaTime);

    // Update entities
    entityManager.update(deltaTime, timestamp, wave);

    // Check collisions
    const events = collisionManagerRef.current.checkCollisions(
      entityManager.player,
      entityManager.aliens,
      entityManager.barriers,
      entityManager.projectiles,
      entityManager.ufo
    );

    // Handle events
    let needsBump: boolean = handleCollisionEvents(events);

    // Check win condition
    if (entityManager.areAllAliensDestroyed()) {
      incrementWave();
      resetGame(false);
      needsBump = true;
    }

    // Bump version if needed to trigger re-render
    if (needsBump || events.length > 0) {
      bumpVersion();
    }

    // Continue loop
    animationFrameRef.current = requestAnimationFrame(update);
  }, [status, wave, handleCollisionEvents, incrementWave, resetGame, bumpVersion]);

  /**
   * Move player
   */
  const movePlayer = useCallback((direction: 'left' | 'right', isMoving: boolean) => {
    if (direction === 'left') {
      entityManagerRef.current.player.isMovingLeft = isMoving;
    }
    if (direction === 'right') {
      entityManagerRef.current.player.isMovingRight = isMoving;
    }
  }, []);

  /**
   * Shoot projectile
   */
  const shoot = useCallback(() => {
    if (status !== 'PLAYING') return;

    const em = entityManagerRef.current;
    const playerShots = em.projectiles.filter(p => p.isPlayerProjectile).length;

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
    if (status === 'PLAYING') {
      lastTimeRef.current = 0;
      animationFrameRef.current = requestAnimationFrame(update);
    }
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [status, update]);

  /**
   * Get all entities for rendering
   */
  const getEntities = useCallback(() => {
    return entityManagerRef.current.getAllEntities();
  }, []);

  // Memoize effect systems for stable references
  const effectSystems = useMemo(() => ({
    particleSystem: particleSystemRef.current,
    starfield: starfieldRef.current,
    screenShake: screenShakeRef.current,
    crtEffect: crtEffectRef.current,
  }), []);

  return {
    entities: getEntities(),
    entitiesVersion,
    notifications,
    ...effectSystems,
    movePlayer,
    shoot,
    resetGame,
  };
};
