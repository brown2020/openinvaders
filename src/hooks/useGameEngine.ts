import { useEffect, useRef, useCallback, useState } from 'react';
import { EntityManager } from '@/lib/game/EntityManager';
import { CollisionManager } from '@/lib/game/CollisionManager';
import { useGameStore } from '@/lib/store/game-store';
import { soundManager } from '@/lib/sounds/SoundManager';
import { SoundType } from '@/lib/sounds/SoundTypes';
import { Entity } from '@/lib/entities/entity';
import { PROJECTILE } from '@/lib/constants/game';

export const useGameEngine = () => {
  const {
    status,
    wave,
    incrementScore,
    setHighScore,
    setStatus,
    decrementLives,
    setLives,
    score,
    highScore,
    incrementWave,
  } = useGameStore();

  const entityManagerRef = useRef<EntityManager>(new EntityManager());
  const collisionManagerRef = useRef<CollisionManager>(new CollisionManager());
  const lastTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);
  
  // Version to force re-renders when entity list structure changes (add/remove)
  const [entitiesVersion, setEntitiesVersion] = useState(0);
  const bumpVersion = useCallback(() => setEntitiesVersion((v) => v + 1), []);

  // Events/Notifications queue (for UI overlays like "+100")
  const [notifications, setNotifications] = useState<{ id: number; score: number; position: { x: number; y: number } }[]>([]);
  const notificationIdRef = useRef(0);

  const addNotification = useCallback((points: number, x: number, y: number) => {
    const id = notificationIdRef.current++;
    setNotifications((prev) => [...prev, { id, score: points, position: { x, y } }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 1000);
  }, []);

  const resetGame = useCallback((fullReset = false) => {
    entityManagerRef.current.reset(fullReset);
    lastTimeRef.current = 0;
    bumpVersion();
  }, [bumpVersion]);

  const update = useCallback((timestamp: number) => {
    if (status !== 'PLAYING') return;

    const deltaTime = lastTimeRef.current ? Math.min(timestamp - lastTimeRef.current, 32) : 16;
    lastTimeRef.current = timestamp;

    const entityManager = entityManagerRef.current;
    
    // Update Entities
    entityManager.update(deltaTime, timestamp, wave);

    // Check Collisions
    const events = collisionManagerRef.current.checkCollisions(
      entityManager.player,
      entityManager.aliens,
      entityManager.barriers,
      entityManager.projectiles,
      entityManager.ufo
    );

    let needsBump = false;

    events.forEach((event) => {
      switch (event.type) {
        case 'ALIEN_KILLED':
          incrementScore(event.points!);
          addNotification(event.points!, event.position!.x, event.position!.y);
          needsBump = true; // Alien removed
          break;
        case 'UFO_KILLED':
          incrementScore(event.points!);
          addNotification(event.points!, event.position!.x, event.position!.y);
          needsBump = true; // UFO removed
          break;
        case 'PLAYER_HIT':
          setLives(event.payload.lives);
          // needsBump might not be needed unless player sprite changes or respawns logic
          break;
        case 'GAME_OVER':
          setStatus('GAME_OVER');
          break;
        case 'BARRIER_HIT':
          // Barrier damaged, usually visual update handled by render, but if destroyed:
          if (event.payload.barrier.isDestroyed) needsBump = true;
          break;
        case 'ALIEN_LANDED':
             // Handled by GAME_OVER
            break;
      }
    });

    // Check Win Condition
    if (entityManager.aliens.every(a => a.isDestroyed)) {
        incrementWave();
        resetGame(false); // Reset entities but keep score/lives
        // status is still PLAYING
        needsBump = true;
    }

    // Check if new projectiles/UFOs appeared/disappeared (simplistic check or just rely on events)
    // For now, we bump if events happened or if we want to be safe about projectiles (which are added frequently)
    // Projectiles are added/removed often. Bumping every frame is too expensive?
    // GameCanvas renders entities. If the array reference changes, it re-renders.
    // If we only pass a NEW array when structure changes, we save React renders.
    // But GameCanvas needs the entities array to iterate.
    // Since GameCanvas has its own loop, we only need to pass a new array if the LIST of entities changed.
    
    // We can just bump periodically or check lengths.
    // Simplest: bump if projectile count changed or UFO changed.
    // Optimization: Just expose the entityManager and let GameCanvas read from it?
    // But GameCanvas props is `entities: Entity[]`.
    
    // Let's rely on `needsBump` and maybe projectile count check.
    // Actually, `Game.tsx` bumped on shoot.
    // Let's bump if projectiles count changed.
    // But we don't have previous count here easily without ref.
    
    // For smoothness, maybe we just bump every few frames or on specific actions?
    // Let's stick to event-based bumping + shooting.
    
    // Shooting isn't an event returned by CollisionManager.
    // We need to know if shots were fired.
    // EntityManager creates shots.
    // Maybe EntityManager can return "events" too?
    
    // For now, let's bump if `events.length > 0`.
    // And what about shooting?
    // We can verify projectile count or just bump.
    if (events.length > 0) needsBump = true;
    
    // Check if UFO spawned/despawned
    if (entityManager.ufo !== null !== (entityManagerRef.current as any)._lastUfoExists) {
         needsBump = true;
         (entityManagerRef.current as any)._lastUfoExists = entityManager.ufo !== null;
    }
    
    if (needsBump) bumpVersion();
    
    // Loop
    animationFrameRef.current = requestAnimationFrame(update);
  }, [status, wave, incrementScore, setLives, setStatus, incrementWave, resetGame, addNotification, bumpVersion]);

  // Player Actions
  const movePlayer = useCallback((direction: 'left' | 'right', isMoving: boolean) => {
    if (direction === 'left') entityManagerRef.current.player.isMovingLeft = isMoving;
    if (direction === 'right') entityManagerRef.current.player.isMovingRight = isMoving;
  }, []);

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

  // Start/Stop Loop
  useEffect(() => {
    if (status === 'PLAYING') {
      lastTimeRef.current = 0;
      animationFrameRef.current = requestAnimationFrame(update);
    }
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [status, update]);

  // Return values
  const getEntities = useCallback(() => {
      const em = entityManagerRef.current;
      return [
          ...em.aliens,
          ...em.projectiles,
          ...em.barriers,
          ...(em.ufo ? [em.ufo] : []),
          em.player
      ] as Entity[];
  }, []); // Logic depends on mutable ref, so it's stable-ish but returns new array.

  return {
    entities: getEntities(), // This will be called on render.
    entitiesVersion,
    notifications,
    movePlayer,
    shoot,
    resetGame,
  };
};

