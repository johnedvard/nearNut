import { GameObject, load, Sprite, TileEngine } from 'kontra';
import { Game } from './game';
import { ILevelData } from './iLevelData';
import { GameObjects } from './gameObjects';

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

export const loadLevelFromObject = (
  level: ILevelData
): Promise<{ tileEngine: TileEngine; gameObjects: GameObjects }> => {
  return load('assets/tilesets/tileset_32x32_default.png').then((assets) => {
    // can also use dataAssets (stores all kontra assets)
    level.tilesets = [{ image: assets[0], firstgid: 1 }];
    const tileEngine = TileEngine({ ...level });
    return { tileEngine, gameObjects: level.gameObjects };
  });
};

export const loadLevelFromFile = (
  levelName: string
): Promise<{ tileEngine: TileEngine; gameObjects: GameObjects }> => {
  return load(
    'assets/tilesets/tileset_32x32_default.png',
    'assets/levels/001.json'
  ).then((assets) => {
    console.warn(
      'Passing levelName not implemented yet. Always open same level'
    );
    // can also use dataAssets (stores all kontra assets)
    assets[1].tilesets = [{ image: assets[0], firstgid: 1 }];
    const tileEngine = TileEngine({ ...assets[1] });
    return { tileEngine, gameObjects: assets[1].gameObjects };
  });
};

export const getRow = (y, tileheight, scale, sy) => {
  return ((y + sy) / (tileheight * scale)) | 0;
};
export const getCol = (x, tilewidth, scale, sx) => {
  return ((x + sx) / (tilewidth * scale)) | 0;
};
