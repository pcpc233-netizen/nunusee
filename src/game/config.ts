import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { GameScene } from './scenes/GameScene';
import { GameOverScene } from './scenes/GameOverScene';

export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 400;
export const GROUND_Y = 320;

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#fef3c7',
  physics: {
    default: 'arcade',
    arcade: { gravity: { x: 0, y: 1200 }, debug: false },
  },
  scene: [BootScene, GameScene, GameOverScene],
};
