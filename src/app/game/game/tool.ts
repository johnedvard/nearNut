import { DoorSwitch } from './doorSwitch';
import { GoblinBomber } from './goblinBomber';
import { IGameObject } from './iGameObject';

export class Tool {
  go: IGameObject;
  isActive = false;

  constructor(context: CanvasRenderingContext2D, type?: string) {
    if (type == 'door') {
      this.go = new DoorSwitch({ x: 0, y: 0 });
    } else {
      this.go = new GoblinBomber(context);
    }
  }

  update(dt: number): void {
    if (this.isActive && this.go) {
      this.go.update(dt);
    }
  }
  render(): void {
    if (this.isActive && this.go) {
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
