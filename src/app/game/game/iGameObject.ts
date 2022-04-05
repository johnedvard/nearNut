import { Sprite } from 'kontra';
export interface IGameObject {
  sprite: Sprite;
  update(dt: number): void;
  render(): void;
  /**
   * Remove event listeners
   */
  cleanup(): void;
  /**
   * Change context of gameobject to render in a different canvas
   */
  setContext(context: CanvasRenderingContext2D): void;
}
