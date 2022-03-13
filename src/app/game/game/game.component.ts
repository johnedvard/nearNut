import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Game } from './game';
import { ILevelData } from './iLevelData';
import { LevelEditor } from './levelEditor';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.sass'],
})
export class GameComponent implements OnInit, OnDestroy {
  @Input() level: ILevelData;
  @Input() isEditing = false;
  game: Game;
  levelEditor: LevelEditor;
  constructor() {}

  ngOnInit(): void {
    if (this.isEditing) {
      this.levelEditor = new LevelEditor(this.level);
    } else {
      this.game = new Game();
    }
  }
  ngOnDestroy(): void {
    if (this.isEditing) {
      this.levelEditor.cleanup();
    } else {
      this.game.cleanup();
    }
  }
}
