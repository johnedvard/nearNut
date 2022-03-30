import { Injectable } from '@angular/core';
import { emit } from 'kontra';
import { BehaviorSubject, Observable } from 'rxjs';
import { GameEvent } from '../game/game/gameEvent';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  selectedCharacterSubject: BehaviorSubject<string> =
    new BehaviorSubject<string>('');

  constructor() {
    const characterId = localStorage.getItem('selectedCharacterId');
    if (characterId) {
      this.selectedCharacterSubject.next(characterId);
    }
  }

  setSelectedCharacterId(id: string) {
    localStorage.setItem('selectedCharacterId', id);
    this.selectedCharacterSubject.next(id);
    emit(GameEvent.selectCharacter, { id });
  }

  getSelectedCharacterId(): Observable<string> {
    return this.selectedCharacterSubject.asObservable();
  }
}
