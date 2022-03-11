import { GameObjectType, isOfTypeGameObject } from './gameObjects';
import { Goal } from './goal';
import { GoalSwitch } from './goalSwitch';
import { IGameObject } from './iGameObject';
import { Player } from './player';

export const createGameObject = (key: string, data: any): IGameObject => {
  if (!isOfTypeGameObject(key)) throw new Error('Not a valid type');
  const type = <GameObjectType>key;
  switch (type) {
    case 'player':
      return new Player({ ...data });
    case 'goal':
      return new Goal({ ...data });
    case 'goalSwitch':
      return new GoalSwitch({ ...data });
  }
};
