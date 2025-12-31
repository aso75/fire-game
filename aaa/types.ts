
export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  GAMEOVER = 'GAMEOVER',
  LEVEL_TRANSITION = 'LEVEL_TRANSITION'
}

export interface Entity {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

export interface Player extends Entity {
  health: number;
  score: number;
  lastShot: number;
  powerUp: 'triple' | 'shield' | null;
  powerUpTimer: number;
}

export interface Enemy extends Entity {
  type: 'basic' | 'fast' | 'heavy' | 'boss';
  health: number;
  maxHealth: number;
  speed: number;
  lastShot?: number;
  state?: number;
}

export interface PowerUp extends Entity {
  type: 'triple' | 'shield';
  speed: number;
}

export interface Bullet extends Entity {
  speed: number;
  damage: number;
  vx?: number;
  vy?: number;
}

export interface Particle extends Entity {
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

export interface Lore {
  title: string;
  description: string;
  isBossLevel: boolean;
}
