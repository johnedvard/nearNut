// Remeber to add new types to the type, function, and interface in this file
export type GameObjectType = 'player' | 'door' | 'doorSwitch' | 'goal';
export function isOfTypeGameObject(
  keyInput: string
): keyInput is GameObjectType {
  return ['player', 'door', 'doorSwitch', 'goal'].includes(keyInput);
}
export interface GameObjects {
  door: { x: number; y: number };
  player: { x: number; y: number };
  doorSwitch: { x: number; y: number };
  goal: { x: number; y: number };
}
