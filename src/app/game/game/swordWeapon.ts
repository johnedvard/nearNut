import { load, off, on, Sprite, SpriteSheet } from 'kontra';
import { GameEvent } from './gameEvent';
import { PlayerAnimation } from './playerAnimation';
import { PlayerState } from './playerState';
import { PlayerStateChangeEvent } from './playerStateChangeEvent';
import { Weapon } from './weapon';

export class SwordWeapon implements Weapon {
  sprite: Sprite;
  playerState: PlayerState;
  constructor() {
    this.initWeapon();
    on(GameEvent.playerStateChange, this.onPlayerStateChange);
  }

  onPlayerStateChange = (evt: PlayerStateChangeEvent) => {
    this.playerState = evt.state;
  };

  attack({ x, y, rotation }) {
    // mMve the animation in front of the player
    x = x + 20 * Math.cos(rotation);
    y = y + 20 * Math.sin(rotation);
    this.sprite.x = x;
    this.sprite.y = y;
    this.sprite.rotation = rotation;
    this.sprite.currentAnimation.loop = true;
    this.sprite.currentAnimation.reset();
    this.sprite.currentAnimation.loop = false;
  }

  initWeapon() {
    load(
      'assets/platform_metroidvania/herochar sprites(new)/herochar_spritesheet(new).png'
    ).then((assets) => {
      const spriteSheet = SpriteSheet({
        image: assets[0],
        frameWidth: 16,
        frameHeight: 15, // remove 1 px due to some animation errors
        animations: {
          [PlayerAnimation.attack]: {
            frames: '119..125',
            frameRate: 20,
          },
        },
      });

      this.sprite = Sprite({
        height: 15,
        width: 16,
        anchor: { x: 0.5, y: 0.5 },
        animations: spriteSheet.animations,
        currentAnimation: spriteSheet.animations[PlayerAnimation.attack],
      });
    });
  }

  update(dt: number): void {
    if (this.playerState === PlayerState.attacking) {
      this.sprite.update(dt);
    }
  }
  render(): void {
    if (this.playerState === PlayerState.attacking) {
      this.sprite.render();
    }
  }
  cleanup(): void {
    off(GameEvent.playerStateChange, this.onPlayerStateChange);
  }
  setContext(context: CanvasRenderingContext2D): void {
    this.sprite.context = context;
  }
}
