import { Sprite } from 'kontra';
export interface IGameObject {
  sprite: Sprite;
  update(dt: number): void;
  render(): void;
  /**
   * Remove event listeners
   */
  cleanup(): void;
}
