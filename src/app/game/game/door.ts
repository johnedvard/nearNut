import { emit, load, off, on, Sprite, SpriteSheet, untrack } from 'kontra';
import { GameEvent } from './gameEvent';
import { DoorState } from './doorState';
import { IGameObject } from './iGameObject';
import { Player } from './player';

export class Door implements IGameObject {
  private state: DoorState = DoorState.closed;
  ANIMATION_CLOSED = 'closed';
  ANIMATION_OPENING = 'opening';
  sprite: Sprite;

  constructor(options) {
    this.initDoor(options);
    on(GameEvent.openDoor, this.onDoorOpen);
    on(GameEvent.doorCollision, this.onDoorCollision);
  }

  cleanup(): void {
    off(GameEvent.openDoor, this.onDoorOpen);
    off(GameEvent.doorCollision, this.onDoorCollision);
  }

  onDoorOpen = () => {
    this.setState(DoorState.opening);
  };
  onDoorCollision = ({ other }) => {
    if (other instanceof Player) {
      switch (this.state) {
        case DoorState.opened:
        case DoorState.opening:
          // Do nothing, pass through
          break;
        case DoorState.closed:
          // TODO (johnedvard) change to GameEvent.hitDoor?
          emit(GameEvent.hitWall, { go: other });
          break;
        default:
      }
    }
  };

  setState(state: DoorState) {
    console.log('set state', state);
    if (this.state !== state) {
      this.state = state;
      switch (state) {
        case DoorState.opening:
          this.sprite.currentAnimation =
            this.sprite.animations[this.ANIMATION_OPENING];
          break;
        default:
          this.sprite.currentAnimation =
            this.sprite.animations[this.ANIMATION_CLOSED];
      }
    }
  }

  initDoor({ x, y, anchor }) {
    load(
      'assets/platform_metroidvania/miscellaneous sprites/strange_door_closed_anim_strip_10.png',
      'assets/platform_metroidvania/miscellaneous sprites/strange_door_opening_anim_strip_14.png'
    ).then((assets) => {
      const closedSpriteSheet = SpriteSheet({
        image: assets[0],
        frameWidth: 16,
        frameHeight: 48,
        animations: {
          [this.ANIMATION_CLOSED]: {
            frames: '0..9',
            frameRate: 10,
          },
        },
      });
      const openingSpriteSheet = SpriteSheet({
        image: assets[1],
        frameWidth: 16,
        frameHeight: 48,
        animations: {
          [this.ANIMATION_OPENING]: {
            frames: '0..13',
            frameRate: 10,
            loop: false,
          },
        },
      });

      this.sprite = Sprite({
        x: x,
        y: y,
        anchor: anchor || { x: 0.5, y: 0.5 },
        animations: {
          ...closedSpriteSheet.animations,
          ...openingSpriteSheet.animations,
        },
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
  setContext(context: CanvasRenderingContext2D): void {
    this.sprite.context = context;
  }
}
