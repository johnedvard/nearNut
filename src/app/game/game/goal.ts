import { emit, load, off, on, Sprite } from 'kontra';
import { GameEvent } from './gameEvent';
import { IGameObject } from './iGameObject';
import { Player } from './player';

export class Goal implements IGameObject {
  sprite: Sprite;

  constructor({ x, y }) {
    this.initGoal({ x, y });
    on(GameEvent.goalCollision, this.onGoalCollision);
  }

  cleanup(): void {
    off(GameEvent.goalCollision, this.onGoalCollision);
  }

  onGoalCollision = ({ other }) => {
    if (other instanceof Player) {
      emit(GameEvent.levelComplete);
    }
  };

  initGoal({ x, y }) {
    load('assets/platform_metroidvania/miscellaneous sprites/door.png').then(
      (assets) => {
        this.sprite = Sprite({
          x: x,
          y: y,
          anchor: { x: 0.5, y: 0.5 },
          image: assets[0],
          frameWidth: 24,
          frameHeight: 24,
        });
      }
    );
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
