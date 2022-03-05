import { PlayerState } from './playerState';
import { SpaceShip } from './spaceShip';

export interface PlayerStateChangeEvent {
  state: PlayerState;
  ship: SpaceShip;
}
