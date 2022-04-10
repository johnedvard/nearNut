import { emit, load, off, on, Sprite, SpriteSheet } from 'kontra';
import { GameEvent } from './gameEvent';
import { DoorSwitchState } from './doorSwitchState';
import { IGameObject } from './iGameObject';
import { Player } from './player';
import { BehaviorSubject } from 'rxjs';

export class DoorSwitch implements IGameObject {
  id: string;
  private state: DoorSwitchState = DoorSwitchState.idle;
  ANIMATION_IDLE = 'idle';
  ANIMATION_COLLECTED = 'collected';
  sprite: Sprite;
  readySubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(options) {
    this.initDoorSwitch(options);
    on(GameEvent.doorSwitchCollision, this.onDoorSwitchCollision);
  }

  cleanup(): void {
    off(GameEvent.doorSwitchCollision, this.onDoorSwitchCollision);
  }
  onDoorSwitchCollision = ({ other, self }) => {
    if (self == this && other instanceof Player) {
      this.setState(DoorSwitchState.collected);
    }
  };

  setState(state: DoorSwitchState) {
    if (this.state !== state) {
      this.state = state;
      switch (state) {
        case DoorSwitchState.collected:
          this.sprite.currentAnimation =
            this.sprite.animations[this.ANIMATION_COLLECTED];
          emit(GameEvent.openDoor);
          break;
        case DoorSwitchState.idle:
          this.sprite.currentAnimation =
            this.sprite.animations[this.ANIMATION_IDLE];
          break;
        default:
      }
    }
  }

  initDoorSwitch({ x, y, anchor }) {
    load(
      'assets/platform_metroidvania/miscellaneous sprites/orb_anim_strip_6.png',
      'assets/platform_metroidvania/miscellaneous sprites/orb_collected_anim_strip_5.png'
    ).then((assets) => {
      const idleSpriteSheet = SpriteSheet({
        image: assets[0],
        frameWidth: 8,
        frameHeight: 8,
        animations: {
          [this.ANIMATION_IDLE]: {
            frames: '0..5',
            frameRate: 5,
          },
        },
      });

      const collectedSpriteSheet = SpriteSheet({
        image: assets[1],
        frameWidth: 8,
        frameHeight: 8,
        animations: {
          [this.ANIMATION_COLLECTED]: {
            frames: '0..5', // add one more frame to stop at an invisible sprite
            frameRate: 5,
            loop: false,
          },
        },
      });

      this.sprite = Sprite({
        x: x,
        y: y,
        anchor: anchor || { x: 0.5, y: 0.5 },
        animations: {
          ...idleSpriteSheet.animations,
          ...collectedSpriteSheet.animations,
        },
      });
      this.readySubject.next(true);
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
    const subsc = this.readySubject.subscribe((ready) => {
      if (ready) {
        this.sprite.context = context;
        subsc.unsubscribe();
      }
    });
  }
}
