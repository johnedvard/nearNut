import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { GameService } from 'src/app/shared/game.service';
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
  @Input() levelId;
  @Input() isEditing = false;
  game: Game;
  levelEditor: LevelEditor;
  characterSub: Subscription;
  selectedCharacterId: string = '';
  constructor(private gameService: GameService) {
    this.characterSub = this.gameService
      .getSelectedCharacterId()
      .subscribe((id) => {
        this.selectedCharacterId = id;
      });
  }

  ngOnInit(): void {
    this.initGameEditor();
  }
  ngOnDestroy(): void {
    this.cleanup(this.isEditing);
    if (this.characterSub) {
      this.characterSub.unsubscribe();
    }
  }
  ngOnChanges(changes: SimpleChanges): void {
    const isEditingProp = (<any>changes).isEditing;
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
      this.levelEditor = new LevelEditor(this.level, {
        characterId: this.selectedCharacterId,
      });
    } else {
      if (this.level) {
        this.game = new Game(this.level, {
          characterId: this.selectedCharacterId,
        });
      } else if (this.levelId) {
        this.game = new Game(this.levelId, {
          characterId: this.selectedCharacterId,
        });
      }
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
