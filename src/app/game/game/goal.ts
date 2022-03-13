import { emit, load, off, on, Sprite, SpriteSheet } from 'kontra';
import { GameEvent } from './gameEvent';
import { GoalState } from './goalState';
import { IGameObject } from './iGameObject';
import { Player } from './player';

export class Goal implements IGameObject {
  private state: GoalState = GoalState.closed;
  ANIMATION_CLOSED = 'closed';
  ANIMATION_OPENING = 'opening';
  sprite: Sprite;

  constructor({ x, y }) {
    this.initGoal({ x, y });
    on(GameEvent.openGoal, this.onGoalOpen);
    on(GameEvent.goalCollision, this.onGoalCollision);
  }

  cleanup(): void {
    off(GameEvent.openGoal, this.onGoalOpen);
    off(GameEvent.goalCollision, this.onGoalCollision);
  }

  onGoalOpen = () => {
    this.setState(GoalState.opening);
  };
  onGoalCollision = ({ other }) => {
    if (other instanceof Player) {
      switch (this.state) {
        case GoalState.opened:
        case GoalState.opening:
          emit(GameEvent.levelComplete);
          break;
        case GoalState.closed:
          break;
        default:
      }
    }
  };

  setState(state: GoalState) {
    console.log('set state', state);
    if (this.state !== state) {
      this.state = state;
      switch (state) {
        case GoalState.opening:
          this.sprite.currentAnimation =
            this.sprite.animations[this.ANIMATION_OPENING];
          break;
        default:
          this.sprite.currentAnimation =
            this.sprite.animations[this.ANIMATION_CLOSED];
      }
    }
  }

  initGoal({ x, y }) {
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
        anchor: { x: 0.5, y: 0.5 },
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
}
