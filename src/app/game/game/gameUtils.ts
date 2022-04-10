import { GameObject, load, Sprite, TileEngine } from 'kontra';
import { Game } from './game';
import { ILevelData } from './iLevelData';
import { ILevelGameObject } from './gameObjects';
import { tileMapNameDefault } from './gameSettings';

export const getPlayerControls = (): string[] => {
  // TODO (johnedvard) use user settings to configure keys
  let leftKey = 'a';
  let rightKey = 'd';
  // let leftKey = 'arrowleft';
  // let rightKey = 'arrowright';
  return [leftKey, rightKey];
};

export function rectCollision(rect: GameObject, other: GameObject) {
  if (!rect && !other) return false;
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

export const loadLevelFromObject = (
  level: ILevelData
): Promise<{
  tileEngine: TileEngine;
  gameObjects: ILevelGameObject[];
}> => {
  return load(tileMapNameDefault).then((assets) => {
    // can also use dataAssets (stores all kontra assets)
    level.tilesets = [{ image: assets[0], firstgid: 1 }];
    const tileEngine = TileEngine({ ...level });
    return { tileEngine, gameObjects: level.gameObjects };
  });
};

export const loadLevelFromFile = (
  levelName: string
): Promise<{
  tileEngine: TileEngine;
  gameObjects: ILevelGameObject[];
}> => {
  return load(tileMapNameDefault, `assets/levels/${levelName}.json`).then(
    (assets) => {
      console.warn(
        'Passing levelName not implemented yet. Always open same level'
      );
      // can also use dataAssets (stores all kontra assets)
      assets[1].tilesets = [{ image: assets[0], firstgid: 1 }];
      const tileEngine = TileEngine({ ...assets[1] });
      return { tileEngine, gameObjects: assets[1].gameObjects };
    }
  );
};

export const getRow = (y, tileheight, scale, sy) => {
  return ((y + sy * scale) / (tileheight * scale)) | 0;
};
export const getCol = (x, tilewidth, scale, sx) => {
  return ((x + sx * scale) / (tilewidth * scale)) | 0;
};

export const getMaxSxSy = ({ mapwidth, mapheight, canvas, scale }) => {
  return {
    maxSx: Math.max(0, (mapwidth - canvas.width) / scale),
    maxSy: Math.max(0, (mapheight - canvas.height) / scale),
  };
};
