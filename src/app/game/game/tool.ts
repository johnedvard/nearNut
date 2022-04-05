import { DoorSwitch } from './doorSwitch';
import { createGameObject } from './gameObjectFactory';
import { GameObjectType } from './gameObjects';
import { IGameObject } from './iGameObject';

export class Tool {
  go: IGameObject;
  isActive = false;

  constructor(type: GameObjectType, context?: CanvasRenderingContext2D) {
    if (type) {
      this.go = createGameObject(type, { anchor: { x: 0, y: 0 } });
    }
  }

  update(dt: number): void {
    if (this.isActive && this.go) {
      this.go.update(dt);
    }
  }
  render(): void {
    if (this.go) {
      this.go.render();
    }
  }
  cleanup(): void {
    throw new Error('Method not implemented.');
  }
  setContext(context: CanvasRenderingContext2D): void {
    this.go.setContext(context);
  }
}
