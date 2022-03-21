import {
  emit,
  load,
  off,
  on,
  Sprite,
  SpriteSheet,
  track,
  untrack,
} from 'kontra';
import { GameEvent } from './gameEvent';
import { GoalSwitchState } from './goalSwitchState';
import { IGameObject } from './iGameObject';
import { Player } from './player';

export class GoalSwitch implements IGameObject {
  private state: GoalSwitchState = GoalSwitchState.idle;
  ANIMATION_IDLE = 'idle';
  ANIMATION_COLLECTED = 'collected';
  sprite: Sprite;

  constructor({ x, y }) {
    this.initGoalSwitch({ x, y });
    on(GameEvent.goalSwitchCollision, this.onGoalSwitchCollision);
  }

  cleanup(): void {
    off(GameEvent.goalSwitchCollision, this.onGoalSwitchCollision);
  }
  onGoalSwitchCollision = ({ other }) => {
    if (other instanceof Player) {
      this.setState(GoalSwitchState.collected);
    }
  };

  setState(state: GoalSwitchState) {
    if (this.state !== state) {
      this.state = state;
      switch (state) {
        case GoalSwitchState.collected:
          this.sprite.currentAnimation =
            this.sprite.animations[this.ANIMATION_COLLECTED];
          emit(GameEvent.openGoal);
          break;
        case GoalSwitchState.idle:
          this.sprite.currentAnimation =
            this.sprite.animations[this.ANIMATION_IDLE];
          break;
        default:
      }
    }
  }

  initGoalSwitch({ x, y }) {
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
        anchor: { x: 0.5, y: 0.5 },
        animations: {
          ...idleSpriteSheet.animations,
          ...collectedSpriteSheet.animations,
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
}
