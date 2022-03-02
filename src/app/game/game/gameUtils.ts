import { Sprite } from 'kontra';
import { Game } from './game';

export const getPlayerControls = (): string[] => {
  // TODO (johnedvard) use user settings to configure keys
  let leftKey = 'left';
  let rightKey = 'right';
  return [leftKey, rightKey];
};

export const isOutOfBounds = (game: Game, go: Sprite): boolean => {
  return (
    go.x <= 0 ||
    go.x >= game.canvas.width ||
    go.y <= 0 ||
    go.y >= game.canvas.height
  );
};
