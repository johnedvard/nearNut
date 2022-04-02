import { load, Sprite, SpriteSheet } from 'kontra';
import { IGameObject } from './iGameObject';

export class GoblinBomber implements IGameObject {
  sprite: Sprite;
  update(dt: number): void {
    throw new Error('Method not implemented.');
  }
  render(): void {
    throw new Error('Method not implemented.');
  }
  cleanup(): void {
    throw new Error('Method not implemented.');
  }

  initGoblin({ x, y }) {
    load(
      'assets/platform_metroidvania/enemies sprites/bomber goblin/goblin_bomber_spritesheet.png'
    ).then((assets) => {
      const spriteSheet = SpriteSheet({
        image: assets[0],
        frameWidth: 16,
        frameHeight: 16,
        animations: {},
      });

      this.sprite = Sprite({
        x: x,
        y: y,
        height: 16,
        width: 16,
        anchor: { x: 0.5, y: 0.5 },
        animations: {
          ...spriteSheet.animations,
        },
      });
    });
  }
}
