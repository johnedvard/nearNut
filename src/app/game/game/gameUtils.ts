import { GameObject, Sprite } from 'kontra';
import { Game } from './game';

export const getPlayerControls = (): string[] => {
  // TODO (johnedvard) use user settings to configure keys
  let leftKey = 'a';
  let rightKey = 'd';
  // let leftKey = 'arrowleft';
  // let rightKey = 'arrowright';
  return [leftKey, rightKey];
};

export function rectCollision(rect: GameObject, other: GameObject) {
  return (
    rect.x < other.x + other.width &&
    rect.x + rect.width > other.x &&
    rect.y < other.y + other.height &&
    rect.y + rect.height > other.y
  );
}

export const isOutOfBounds = (game: Game, go: Sprite): boolean => {
  return (
    go.x <= 0 ||
    go.x >= game.canvas.width ||
    go.y <= 0 ||
    go.y >= game.canvas.height
  );
};
