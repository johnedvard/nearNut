import { load, on, Sprite, SpriteSheet } from 'kontra';
import { GameEvent } from './gameEvent';
import { GoalState } from './goalState';
import { IGameObject } from './iGameObject';

export class Goal implements IGameObject {
  ANIMATION_CLOSED = 'closed';
  ANIMATION_OPENING = 'opening';
  goalState: GoalState = GoalState.closed;
  sprite: Sprite;

  constructor({ x, y }) {
    this.initGoal({ x, y });
    on(GameEvent.openGoal, () => this.onGoalOpen);
  }

  onGoalOpen() {
    this.setGoalState(GoalState.opening);
  }

  setGoalState(state: GoalState) {
    this.goalState = state;
    if (this.goalState === GoalState.opening) {
      this.sprite.currentAnimation =
        this.sprite.animations[this.ANIMATION_OPENING];
    } else {
      this.sprite.currentAnimation =
        this.sprite.animations[this.ANIMATION_CLOSED];
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
