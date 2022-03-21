export type GameObjectType = 'player' | 'door' | 'doorSwitch';
export function isOfTypeGameObject(
  keyInput: string
): keyInput is GameObjectType {
  return ['player', 'door', 'doorSwitch'].includes(keyInput);
}
export interface GameObjects {
  door: { x: number; y: number };
  player: { x: number; y: number };
  doorSwitch: { x: number; y: number };
}
