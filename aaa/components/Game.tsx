
import React, { useRef, useEffect, useCallback } from 'react';
import { GameState, Player, Enemy, Bullet, Particle, PowerUp } from '../types';
import { audio } from '../services/audio';

interface GameProps {
  gameState: GameState;
  onGameOver: (score: number) => void;
  onLevelUp: (level: number) => void;
  onScoreUpdate: (score: number) => void;
}

const Game: React.FC<GameProps> = ({ gameState, onGameOver, onLevelUp, onScoreUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | undefined>(undefined);
  
  const playerRef = useRef<Player>({
    x: 0, y: 0, width: 30, height: 30, color: '#38bdf8', health: 100, score: 0, lastShot: 0, powerUp: null, powerUpTimer: 0
  });
  const enemiesRef = useRef<Enemy[]>([]);
  const bossRef = useRef<Enemy | null>(null);
  const bulletsRef = useRef<Bullet[]>([]);
  const enemyBulletsRef = useRef<Bullet[]>([]);
  const powerUpsRef = useRef<PowerUp[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const levelRef = useRef(1);
  const mousePos = useRef({ x: 0, y: 0 });
  const shakeRef = useRef(0);

  const initGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    playerRef.current = {
      x: canvas.width / 2,
      y: canvas.height - 80,
      width: 40,
      height: 40,
      color: '#38bdf8',
      health: 100,
      score: 0,
      lastShot: 0,
      powerUp: null,
      powerUpTimer: 0
    };
    enemiesRef.current = [];
    bossRef.current = null;
    bulletsRef.current = [];
    enemyBulletsRef.current = [];
    powerUpsRef.current = [];
    particlesRef.current = [];
    levelRef.current = 1;
    shakeRef.current = 0;
    mousePos.current = { x: canvas.width / 2, y: canvas.height - 80 };
  }, []);

  useEffect(() => {
    if (gameState === GameState.PLAYING) {
      initGame();
    }
  }, [gameState, initGame]);

  const createParticles = (x: number, y: number, color: string, count: number) => {
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x, y, 
        width: Math.random() * 3 + 1, 
        height: Math.random() * 3 + 1, 
        color,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 0,
        maxLife: 30 + Math.random() * 40
      });
    }
  };

  const spawnPowerUp = (x: number, y: number) => {
    const type = Math.random() > 0.5 ? 'triple' : 'shield';
    powerUpsRef.current.push({
      x, y, width: 25, height: 25, color: type === 'triple' ? '#fbbf24' : '#a855f7',
      type, speed: 2
    });
  };

  const spawnBoss = (canvasWidth: number) => {
    const size = 120;
    const hp = levelRef.current * 150;
    bossRef.current = {
      x: canvasWidth / 2 - size / 2,
      y: -size,
      width: size,
      height: size,
      color: '#f472b6',
      type: 'boss',
      health: hp,
      maxHealth: hp,
      speed: 1.5,
      lastShot: 0,
      state: 0 
    };
    shakeRef.current = 20;
  };

  const spawnEnemy = (canvasWidth: number) => {
    if (bossRef.current) return;
    const typeRoll = Math.random();
    let type: Enemy['type'] = 'basic';
    let color = '#f87171';
    let health = 1 + Math.floor(levelRef.current / 2);
    let speed = 2 + Math.random() * 2;
    let size = 30;

    if (typeRoll > 0.85) {
      type = 'heavy';
      color = '#ef4444';
      health *= 4;
      speed *= 0.5;
      size = 50;
    } else if (typeRoll > 0.7) {
      type = 'fast';
      color = '#fbbf24';
      health *= 0.7;
      speed *= 1.7;
      size = 25;
    }

    enemiesRef.current.push({
      x: Math.random() * (canvasWidth - size),
      y: -size,
      width: size,
      height: size,
      color,
      type,
      health,
      maxHealth: health,
      speed
    });
  };

  const update = (canvas: HTMLCanvasElement, time: number) => {
    if (gameState !== GameState.PLAYING) return;

    if (shakeRef.current > 0.1) shakeRef.current *= 0.9; else shakeRef.current = 0;

    const dx = (mousePos.current.x - playerRef.current.x) * 0.15;
    const dy = (mousePos.current.y - playerRef.current.y) * 0.15;
    playerRef.current.x += dx;
    playerRef.current.y += dy;

    // Power-up Timer
    if (playerRef.current.powerUpTimer > 0) {
      playerRef.current.powerUpTimer -= 16;
      if (playerRef.current.powerUpTimer <= 0) {
        playerRef.current.powerUp = null;
      }
    }

    // Shooting
    const fireRate = playerRef.current.powerUp === 'triple' ? 120 : 180;
    if (time - playerRef.current.lastShot > fireRate) {
      if (playerRef.current.powerUp === 'triple') {
        const angles = [-0.15, 0, 0.15];
        angles.forEach(angle => {
          bulletsRef.current.push({
            x: playerRef.current.x + playerRef.current.width / 2 - 2,
            y: playerRef.current.y,
            width: 4, height: 15, color: '#fbbf24', speed: 12, damage: 1,
            vx: Math.sin(angle) * 12, vy: -Math.cos(angle) * 12
          });
        });
      } else {
        bulletsRef.current.push({
          x: playerRef.current.x + playerRef.current.width / 2 - 2,
          y: playerRef.current.y,
          width: 4, height: 15, color: '#7dd3fc', speed: 12, damage: 1
        });
      }
      playerRef.current.lastShot = time;
      audio.playShoot();
    }

    // Player Bullets
    bulletsRef.current.forEach((b, i) => {
      if (b.vx !== undefined && b.vy !== undefined) {
        b.x += b.vx;
        b.y += b.vy;
      } else {
        b.y -= b.speed;
      }
      if (b.y < -20 || b.x < -20 || b.x > canvas.width + 20) bulletsRef.current.splice(i, 1);
    });

    // Enemy Bullets
    enemyBulletsRef.current.forEach((b, i) => {
      if (b.vx !== undefined && b.vy !== undefined) {
        b.x += b.vx;
        b.y += b.vy;
      } else {
        b.y += b.speed;
      }

      const hitX = b.x < playerRef.current.x + playerRef.current.width && b.x + b.width > playerRef.current.x;
      const hitY = b.y < playerRef.current.y + playerRef.current.height && b.y + b.height > playerRef.current.y;

      if (hitX && hitY) {
        if (playerRef.current.powerUp !== 'shield') {
          playerRef.current.health -= 10;
          shakeRef.current = 8;
          audio.playDamage();
        } else {
          createParticles(b.x, b.y, '#a855f7', 3);
        }
        enemyBulletsRef.current.splice(i, 1);
        createParticles(b.x, b.y, b.color, 5);
        if (playerRef.current.health <= 0) onGameOver(playerRef.current.score);
      }

      if (b.y > canvas.height || b.y < -50 || b.x < -50 || b.x > canvas.width + 50) {
        enemyBulletsRef.current.splice(i, 1);
      }
    });

    // Power-ups
    powerUpsRef.current.forEach((p, i) => {
      p.y += p.speed;
      if (p.x < playerRef.current.x + playerRef.current.width && p.x + p.width > playerRef.current.x && p.y < playerRef.current.y + playerRef.current.height && p.y + p.height > playerRef.current.y) {
        playerRef.current.powerUp = p.type;
        playerRef.current.powerUpTimer = 8000;
        audio.playPowerUp();
        createParticles(p.x + p.width / 2, p.y + p.height / 2, p.color, 20);
        powerUpsRef.current.splice(i, 1);
      }
      if (p.y > canvas.height) powerUpsRef.current.splice(i, 1);
    });

    // Boss Logic
    if (levelRef.current % 5 === 0 && !bossRef.current) {
      spawnBoss(canvas.width);
    }

    if (bossRef.current) {
      const boss = bossRef.current;
      if (boss.y < 100) boss.y += 1;
      else {
        boss.state = (boss.state || 0) + 0.015;
        boss.x = (canvas.width / 2 - boss.width / 2) + Math.sin(boss.state) * (canvas.width / 3);
      }

      const bossAttackRate = Math.max(500, 1500 - (levelRef.current * 100));
      if (time - (boss.lastShot || 0) > bossAttackRate) {
        boss.lastShot = time;
        audio.playBossShoot();
        const centerX = boss.x + boss.width / 2;
        const centerY = boss.y + boss.height / 2;

        if (Math.random() > 0.4) {
          for (let i = -3; i <= 3; i++) {
            const angle = Math.PI / 2 + (i * 0.25);
            enemyBulletsRef.current.push({
              x: centerX, y: centerY, width: 10, height: 10, color: '#f472b6', speed: 4, damage: 10,
              vx: Math.cos(angle) * 4, vy: Math.sin(angle) * 4
            });
          }
        } else {
          const angle = Math.atan2(playerRef.current.y - centerY, playerRef.current.x - centerX);
          for (let i = 0; i < 4; i++) {
            setTimeout(() => {
              if (bossRef.current) {
                enemyBulletsRef.current.push({
                  x: centerX, y: centerY, width: 12, height: 12, color: '#ec4899', speed: 8, damage: 15,
                  vx: Math.cos(angle) * 8, vy: Math.sin(angle) * 8
                });
              }
            }, i * 120);
          }
        }
      }

      bulletsRef.current.forEach((b, bi) => {
        if (b.x < boss.x + boss.width && b.x + b.width > boss.x && b.y < boss.y + boss.height && b.y + b.height > boss.y) {
          boss.health -= b.damage;
          bulletsRef.current.splice(bi, 1);
          createParticles(b.x, b.y, '#f472b6', 5);
          if (boss.health <= 0) {
            playerRef.current.score += 5000;
            onScoreUpdate(playerRef.current.score);
            createParticles(boss.x + boss.width / 2, boss.y + boss.height / 2, boss.color, 120);
            audio.playExplosion(true);
            shakeRef.current = 40;
            bossRef.current = null;
            levelRef.current += 1;
            onLevelUp(levelRef.current);
            audio.playLevelUp();
          }
        }
      });
    }

    // Minions
    if (!bossRef.current && Math.random() < 0.02 + (levelRef.current * 0.005)) {
      spawnEnemy(canvas.width);
    }

    enemiesRef.current.forEach((e, ei) => {
      e.y += e.speed;
      const hitX = e.x < playerRef.current.x + playerRef.current.width && e.x + e.width > playerRef.current.x;
      const hitY = e.y < playerRef.current.y + playerRef.current.height && e.y + e.height > playerRef.current.y;
      
      if (hitX && hitY) {
        if (playerRef.current.powerUp !== 'shield') {
          playerRef.current.health -= 20;
          shakeRef.current = 15;
          audio.playDamage();
        } else {
           playerRef.current.powerUpTimer -= 1000; // Shield takes impact
        }
        createParticles(e.x + e.width / 2, e.y + e.height / 2, e.color, 15);
        enemiesRef.current.splice(ei, 1);
        if (playerRef.current.health <= 0) onGameOver(playerRef.current.score);
      }

      bulletsRef.current.forEach((b, bi) => {
        if (b.x < e.x + e.width && b.x + b.width > e.x && b.y < e.y + e.height && b.y + b.height > e.y) {
          e.health -= b.damage;
          bulletsRef.current.splice(bi, 1);
          if (e.health <= 0) {
            playerRef.current.score += 25 * levelRef.current;
            onScoreUpdate(playerRef.current.score);
            createParticles(e.x + e.width / 2, e.y + e.height / 2, e.color, 25);
            audio.playExplosion(false);
            if (Math.random() < 0.1) spawnPowerUp(e.x, e.y);
            enemiesRef.current.splice(ei, 1);
            
            if (playerRef.current.score >= levelRef.current * 2000) {
              levelRef.current += 1;
              onLevelUp(levelRef.current);
              audio.playLevelUp();
            }
          }
        }
      });
      if (e.y > canvas.height) enemiesRef.current.splice(ei, 1);
    });

    particlesRef.current.forEach((p, i) => {
      p.x += p.vx; p.y += p.vy; p.life++;
      if (p.life > p.maxLife) particlesRef.current.splice(i, 1);
    });
  };

  const draw = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    ctx.save();
    if (shakeRef.current > 0.5) {
      ctx.translate((Math.random() - 0.5) * shakeRef.current, (Math.random() - 0.5) * shakeRef.current);
    }
    ctx.clearRect(-50, -50, canvas.width + 100, canvas.height + 100);

    // Dynamic Starfield
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < 60; i++) {
        const x = (Math.sin(i * 123) * 0.5 + 0.5) * canvas.width;
        const y = ((Date.now() * 0.08 + i * 200) % canvas.height);
        const s = (i % 3) + 1;
        ctx.fillStyle = i % 2 === 0 ? '#1e293b' : '#334155';
        ctx.fillRect(x, y, s, s);
    }

    if (gameState !== GameState.PLAYING) {
      ctx.restore();
      return;
    }

    // Power Ups
    powerUpsRef.current.forEach(p => {
      ctx.shadowBlur = 15; ctx.shadowColor = p.color;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x + p.width/2, p.y + p.height/2, p.width/2, 0, Math.PI*2);
      ctx.fill();
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(p.type === 'triple' ? 'T' : 'S', p.x + p.width/2, p.y + p.height/2 + 4);
      ctx.shadowBlur = 0;
    });

    // Boss Rendering
    if (bossRef.current) {
      const b = bossRef.current;
      const cx = b.x + b.width / 2; const cy = b.y + b.height / 2;
      ctx.shadowBlur = 30; ctx.shadowColor = b.color;
      ctx.fillStyle = b.color;
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI * 2) / 8 + (Date.now() * 0.001);
        const r = (b.width / 2) + Math.sin(Date.now() * 0.005 + i) * 10;
        const px = cx + Math.cos(angle) * r; const py = cy + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath(); ctx.fill();
      
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(cx, cy, 20 + Math.sin(Date.now() * 0.01) * 8, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;

      // Boss Health HUD
      const hpWidth = canvas.width * 0.7; const hpX = (canvas.width - hpWidth) / 2;
      ctx.fillStyle = '#1e293b'; ctx.fillRect(hpX, 40, hpWidth, 12);
      ctx.fillStyle = '#f472b6'; ctx.fillRect(hpX, 40, (b.health / b.maxHealth) * hpWidth, 12);
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.strokeRect(hpX, 40, hpWidth, 12);
    }

    // Player Rendering
    if (playerRef.current.powerUp === 'shield') {
      ctx.shadowBlur = 20; ctx.shadowColor = '#a855f7';
      ctx.strokeStyle = '#a855f7'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(playerRef.current.x + playerRef.current.width/2, playerRef.current.y + playerRef.current.height/2, 40, 0, Math.PI*2); ctx.stroke();
      ctx.shadowBlur = 0;
    }
    
    ctx.shadowBlur = 20; ctx.shadowColor = playerRef.current.color; ctx.fillStyle = playerRef.current.color;
    ctx.beginPath();
    ctx.moveTo(playerRef.current.x + playerRef.current.width / 2, playerRef.current.y);
    ctx.lineTo(playerRef.current.x, playerRef.current.y + playerRef.current.height);
    ctx.lineTo(playerRef.current.x + playerRef.current.width, playerRef.current.y + playerRef.current.height);
    ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0;

    // Entities
    [...bulletsRef.current, ...enemyBulletsRef.current].forEach(b => {
      ctx.fillStyle = b.color; ctx.shadowBlur = 8; ctx.shadowColor = b.color;
      ctx.fillRect(b.x, b.y, b.width, b.height); ctx.shadowBlur = 0;
    });

    enemiesRef.current.forEach(e => {
      ctx.fillStyle = e.color; ctx.shadowBlur = 15; ctx.shadowColor = e.color;
      if (e.type === 'heavy') {
        ctx.fillRect(e.x, e.y, e.width, e.height);
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.fillRect(e.x + 5, e.y + 5, e.width - 10, e.height - 10);
      } else if (e.type === 'fast') {
        ctx.beginPath(); ctx.moveTo(e.x + e.width / 2, e.y + e.height); ctx.lineTo(e.x, e.y); ctx.lineTo(e.x + e.width, e.y); ctx.fill();
      } else {
        ctx.beginPath(); ctx.arc(e.x + e.width/2, e.y + e.height/2, e.width/2, 0, Math.PI*2); ctx.fill();
      }
      ctx.shadowBlur = 0;
    });

    particlesRef.current.forEach(p => {
      ctx.globalAlpha = 1 - (p.life / p.maxLife);
      ctx.fillStyle = p.color; ctx.fillRect(p.x, p.y, p.width, p.height); ctx.globalAlpha = 1;
    });

    // Health Bar HUD
    const barW = 80, barH = 6;
    const barX = playerRef.current.x + playerRef.current.width/2 - barW/2;
    const barY = playerRef.current.y + playerRef.current.height + 15;
    ctx.fillStyle = '#1e293b'; ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = playerRef.current.health > 40 ? '#4ade80' : playerRef.current.health > 20 ? '#fbbf24' : '#f87171';
    ctx.fillRect(barX, barY, (playerRef.current.health / 100) * barW, barH);
    
    ctx.restore();
  };

  const animate = (time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    update(canvas, time);
    draw(ctx, canvas);
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handleResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    handleResize();
    window.addEventListener('resize', handleResize);
    
    const handleMove = (e: MouseEvent | TouchEvent) => {
      const x = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const y = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      mousePos.current = { x: x - 20, y: y - 60 };
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchstart', handleMove);
    window.addEventListener('touchmove', handleMove);

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchstart', handleMove);
      window.removeEventListener('touchmove', handleMove);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState]);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 touch-none" />;
};

export default Game;
