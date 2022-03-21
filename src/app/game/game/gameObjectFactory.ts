import { GameObjectType, isOfTypeGameObject } from './gameObjects';
import { Door } from './door';
import { DoorSwitch } from './doorSwitch';
import { IGameObject } from './iGameObject';
import { Player } from './player';

/**
 * Remember to support old keys when modifying the types,
 * otherwise, old data will break
 */
export const createGameObject = (key: string, data: any): IGameObject => {
  if (!isOfTypeGameObject(key)) throw new Error('Not a valid type');
  const type = <GameObjectType>key;
  switch (type) {
    case 'player':
      return new Player({ ...data });
    case 'door':
      return new Door({ ...data });
    case 'doorSwitch':
      return new DoorSwitch({ ...data });
  }
};
