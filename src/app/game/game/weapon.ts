import { IGameObject } from './iGameObject';

export interface Weapon extends IGameObject {
  attack({ x, y, rotation });
}
