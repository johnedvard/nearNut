import { load, Sprite, SpriteSheet } from 'kontra';
import { BehaviorSubject } from 'rxjs';
import { GoblinBomberAnimations } from './goblinBomberAnimations';
import { IGameObject } from './iGameObject';

export class GoblinBomber implements IGameObject {
  id: string;
  sprite: Sprite;
  readySubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  constructor(options) {
    this.initGoblin(options);
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
  cleanup(): void {}

  initGoblin({ x, y, context, anchor }) {
    load(
      'assets/platform_metroidvania/enemies sprites/bomber goblin/goblin_bomber_spritesheet.png'
    ).then((assets) => {
      const spriteSheet = SpriteSheet({
        image: assets[0],
        frameWidth: 16,
        frameHeight: 16,
        animations: {
          [GoblinBomberAnimations.idle]: {
            frames: '12..15',
            frameRate: 6,
          },
        },
      });

      this.sprite = Sprite({
        x: x,
        y: y,
        height: 16,
        width: 16,
        anchor: anchor || { x: 0.5, y: 0.5 },
        animations: {
          ...spriteSheet.animations,
        },
      });
      if (context) {
        this.sprite.context = context;
      }
      this.readySubject.next(true);
    });
  }
  // Set context after sprite has been loaded
  setContext(context) {
    const subsc = this.readySubject.subscribe((ready) => {
      if (ready) {
        this.sprite.context = context;
        subsc.unsubscribe();
      }
    });
  }
}
