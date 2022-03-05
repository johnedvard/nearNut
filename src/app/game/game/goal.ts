import { load, Sprite, SpriteSheet } from 'kontra';
import { IGameObject } from './iGameObject';

export class Goal implements IGameObject {
  sprite: Sprite;

  constructor() {
    load(
      'assets/platform_metroidvania/miscellaneous sprites/strange_door_closed_anim_strip_10.png'
    ).then((assets) => {
      let spriteSheet = SpriteSheet({
        image: assets[0],
        frameWidth: 16,
        frameHeight: 48,
        animations: {
          // create a named animation: walk
          walk: {
            frames: '0..9', // frames 0 through 9
            frameRate: 10,
          },
        },
      });

      this.sprite = Sprite({
        x: 88,
        y: 72,
        anchor: { x: 0.5, y: 0.5 },

        // required for an animation sprite
        animations: spriteSheet.animations,
      });
    });
  }
  update(dt: number): void {
    if (this.sprite) {
      this.sprite.update(dt);
    }
  }
  render(): void {
    if (this.sprite) {
      this.sprite.render();
    }
  }
}
