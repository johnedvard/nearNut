export type GameObjectType = 'player' | 'goal' | 'goalSwitch';
export function isOfTypeGameObject(
  keyInput: string
): keyInput is GameObjectType {
  return ['player', 'goal', 'goalSwitch'].includes(keyInput);
}
export interface GameObjects {
  goal: { x: number; y: number };
  player: { x: number; y: number };
  goalSwitch: { x: number; y: number };
}
