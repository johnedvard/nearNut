import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ILevelData } from '../game/game/iLevelData';
import { Tool } from '../game/game/tool';

@Injectable({
  providedIn: 'root',
})
export class LevelEditorService {
  levels: BehaviorSubject<ILevelData[]> = new BehaviorSubject<ILevelData[]>([]);
  tileSubject: BehaviorSubject<number> = new BehaviorSubject<number>(17); // defaults to delete tile
  selectedToolSubject: BehaviorSubject<Tool> = new BehaviorSubject<any>(null); // defaults to delete tile
  KEY_PREFIX = 'NearNut-';
  constructor() {
    this.levels.next(this.getLevelsFromLocalStorage());
  }

  getTileId(): Observable<number> {
    return this.tileSubject.asObservable();
  }

  createNewLevel() {
    this.createLevelLocalStorage();
  }
  deleteLevel(level: ILevelData) {
    this.deleteLevelLocalStorage(level);
  }
  getLevels(): Observable<ILevelData[]> {
    return this.levels.asObservable();
  }
  getLevelsForUser() {}
  getLevelsFromLocalStorage(): ILevelData[] {
    const lastLevelIndexStr = this.getLocalItem('lastLevelIndex');
    if (!lastLevelIndexStr) {
      return [];
    } else {
      try {
        const levels: ILevelData[] = [];
        const lastLevelIndex = parseFloat(lastLevelIndexStr);
        for (let i = 0; i <= lastLevelIndex; i++) {
          const levelStr = this.getLocalItem(i);
          if (levelStr) {
            levels.push(JSON.parse(levelStr));
          }
        }
        return levels;
      } catch (err) {
        console.error(err);
        return [];
      }
    }
  }
  createLevelLocalStorage() {
    const lastLevelIndexStr = this.getLocalItem('lastLevelIndex');
    if (!lastLevelIndexStr) {
      const emptyLevel = this.initEmptyLevel(0);
      this.setLocalItem('lastLevelIndex', 0);
      this.setLocalItem(0, emptyLevel);
      this.levels.next([...this.levels.value, emptyLevel]);
    } else {
      try {
        const nextLevelIndex = parseFloat(lastLevelIndexStr) + 1;
        const emptyLevel = this.initEmptyLevel(nextLevelIndex);
        this.setLocalItem(nextLevelIndex, emptyLevel);
        this.setLocalItem('lastLevelIndex', nextLevelIndex);
        this.levels.next([...this.levels.value, emptyLevel]);
      } catch (err) {
        console.error(err);
      }
    }
  }
  deleteLevelLocalStorage(level: ILevelData) {
    const currLevels = this.levels.getValue();
    const indexToDelete = this.levels
      .getValue()
      .findIndex((l) => l.name === level.name);
    currLevels.splice(indexToDelete, 1);
    this.levels.next(currLevels);
    this.deleteLocalItem(level.name);
  }

  getLocalItem(key: string | number): string {
    return localStorage.getItem(this.KEY_PREFIX + key);
  }
  setLocalItem(key: string | number, value: any): void {
    localStorage.setItem(this.KEY_PREFIX + key, JSON.stringify(value));
  }
  deleteLocalItem(key: string) {
    console.log('delete level', key);
    localStorage.removeItem(this.KEY_PREFIX + key);
  }
  saveLevel(level: ILevelData) {
    this.setLocalItem(level.name, level);
  }
  setSelectedTool(tool: any) {
    this.selectedToolSubject.next(tool);
  }
  getSelectedTool(): Observable<Tool> {
    return this.selectedToolSubject.asObservable();
  }
  initEmptyLevel(levelIndex: number): ILevelData {
    const level: ILevelData = {
      name: '' + levelIndex,
      tilewidth: 32,
      tileheight: 32,
      width: 80,
      height: 80,
      tilesets: [{}],
      layers: [
        {
          name: 'ground',
          data: [],
        },
      ],
      gameObjects: [
        { type: 'player', id: 'player', x: 40, y: 40 },
        { type: 'door', id: 'door', x: 218, y: 72 },
        { type: 'doorSwitch', id: 'doorSwitch', x: 100, y: 60 },
        { type: 'goal', id: 'goal', x: 140, y: 60 },
      ],
    };

    return level;
  }
}
