import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

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
  }

  getSelectedCharacterId(): Observable<string> {
    return this.selectedCharacterSubject.asObservable();
  }
}
