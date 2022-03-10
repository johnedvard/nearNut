import { LevelData } from './levelData';

type Layer = {
  name: string;
  data: number[];
};
export interface ILevelData {
  name: string;
  tilewidth: number;
  tileheight: number;
  width: number;
  height: number;
  tilesets: any[];
  layers: Layer[];
  gameObjects: LevelData;
}
