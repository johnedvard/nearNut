// Remeber to add new types to the type, function, and interface in this file
export type GameObjectType =
  | 'player'
  | 'door'
  | 'doorSwitch'
  | 'goal'
  | 'goblinBomber';

export function isOfTypeGameObject(
  keyInput: string
): keyInput is GameObjectType {
  return ['player', 'door', 'doorSwitch', 'goal', 'goblinBomber'].includes(
    keyInput
  );
}
export interface ILevelGameObject {
  type: GameObjectType;
  id: string;
  x: number;
  y: number;
}
