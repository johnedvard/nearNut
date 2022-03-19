import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { Game } from './game';
import { ILevelData } from './iLevelData';
import { LevelEditor } from './levelEditor';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.sass'],
})
export class GameComponent implements OnInit, OnDestroy, OnChanges {
  @Input() level: ILevelData;
  @Input() isEditing = false;
  game: Game;
  levelEditor: LevelEditor;
  constructor() {}

  ngOnInit(): void {
    this.initGameEditor();
  }
  ngOnDestroy(): void {
    this.cleanup(this.isEditing);
  }
  ngOnChanges(changes: SimpleChanges): void {
    const isEditingProp = (<any>changes).isEditing;
    console.log('isEditingProp', isEditingProp);
    if (
      isEditingProp &&
      isEditingProp.previousValue !== undefined &&
      isEditingProp.currentValue !== isEditingProp.previousValue
    ) {
      this.cleanup(isEditingProp.previousValue);
      this.initGameEditor();
    }
  }
  initGameEditor() {
    if (this.isEditing) {
      this.levelEditor = new LevelEditor(this.level);
    } else {
      this.game = new Game(this.level);
    }
  }
  cleanup(wasEditing: boolean) {
    if (wasEditing) {
      this.levelEditor.cleanup();
    } else {
      this.game.cleanup();
    }
  }
}
