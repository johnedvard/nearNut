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
  let go = null;
  switch (type) {
    case 'player':
      go = new Player({ ...data });
      break;
    case 'door':
      go = new Door({ ...data });
      break;
    case 'doorSwitch':
      go = new DoorSwitch({ ...data });
      break;
    case 'goal':
      go = new Goal({ ...data });
      break;
    case 'goblinBomber':
      go = new GoblinBomber({ ...data });
      break;
    default:
      throw new Error('Not a valid game object type');
  }
  // TODO (johnedvard) maybe generate a unique ID
  go.id = data.id || '' + Date.now();
  return go;
};

export const getGameOjectType = (go: IGameObject): GameObjectType => {
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
