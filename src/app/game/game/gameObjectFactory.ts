import { GameObjectType, isOfTypeGameObject } from './gameObjects';
import { Door } from './door';
import { DoorSwitch } from './doorSwitch';
import { IGameObject } from './iGameObject';
import { Player } from './player';
import { Goal } from './goal';
import { GoblinBomber } from './goblinBomber';

/**
 * Remember to support old keys when modifying the types,
 * otherwise, old data will break
 */
export const createGameObject = (
  key: GameObjectType | string,
  data: any
): IGameObject => {
  if (!isOfTypeGameObject(key)) throw new Error('Not a valid type');
  const type = <GameObjectType>key;
  switch (type) {
    case 'player':
      return new Player({ ...data });
    case 'door':
      return new Door({ ...data });
    case 'doorSwitch':
      return new DoorSwitch({ ...data });
    case 'goal':
      return new Goal({ ...data });
    case 'goblinBomber':
      return new GoblinBomber({ ...data });
    default:
      throw new Error('Not a valid game object type');
  }
};

export const getGameOjectKey = (go: IGameObject): GameObjectType => {
  if (go instanceof Player) {
    return 'player';
  } else if (go instanceof Door) {
    return 'door';
  } else if (go instanceof DoorSwitch) {
    return 'doorSwitch';
  } else if (go instanceof Goal) {
    return 'goal';
  } else if (go instanceof GoblinBomber) {
    return 'goblinBomber';
  } else {
    throw new Error('Not a valid type');
  }
};
